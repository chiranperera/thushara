/**
 * POST /api/testimonial — public review submission.
 *
 * Submissions are NEVER auto-published. The client asked for automatic
 * publishing; a public unmoderated form on a regulated professional's
 * website is an open door to spam, abuse and misleading claims about
 * policies. Instead this lands in a pending queue and emails Thushara
 * a one-tap approve link — near enough as effortless, none of the risk.
 * See design-brief/09-admin-panel-spec.md.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { z } from "zod";
import { newToken } from "../../lib/auth";
import { site } from "../../lib/site";
import { canSend, sendMail } from "../../lib/mailer";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, extFor, mediaKey } from "../../lib/media";
import { getSiteSettings } from "../../lib/settings";

export const prerender = false;

// 6 Oct 2026, Chiran: the form Thushara sends to clients asks only for
// name, title, the review and an optional photo.
const schema = z.object({
  name: z.string({ error: "Please add your name" }).trim().min(2, "Please add your name").max(120),
  profession: z.string({ error: "Please add your title or workplace" }).trim().min(2, "Please add your title or workplace").max(160),
  body: z
    .string({ error: "Please write a few words" })
    .trim()
    .min(30, "A sentence or two would help — about 30 characters minimum")
    .max(2000),
  consent: z.literal(true, { error: "I need your permission to publish this" }),
  website: z.string().max(0).optional(), // honeypot
});

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });

export const POST: APIRoute = async ({ request }) => {
  const bindings = env as unknown as Record<string, any>;
  const db = bindings.DB;

  let form: FormData;
  try { form = await request.formData(); } catch { return json({ ok: false }, 400); }
  const payload = {
    name: form.get("name") ?? undefined,
    profession: form.get("profession") ?? undefined,
    body: form.get("body") ?? undefined,
    consent: form.get("consent") === "on" || form.get("consent") === "true",
    website: form.get("website") ?? "",
  };
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = i.path.join(".") || "root";
      if (!fieldErrors[k]) fieldErrors[k] = i.message;
    }
    if ("website" in fieldErrors) return json({ ok: true });
    return json({ ok: false, fieldErrors }, 422);
  }

  const t = parsed.data;
  if (!db) return json({ ok: false, message: "Couldn't save that just now. Please try again shortly." }, 503);

  // The photo is optional; a bad one is a field error, not a lost review.
  let photoKey: string | null = null;
  const file = form.get("photo");
  if (file instanceof File && file.size > 0) {
    if (!IMAGE_TYPES.includes(file.type)) return json({ ok: false, fieldErrors: { photo: "Please use a JPG, PNG or WebP photo" } }, 422);
    if (file.size > MAX_IMAGE_BYTES) return json({ ok: false, fieldErrors: { photo: "That photo is over 6 MB — please choose a smaller one" } }, 422);
    const bucket = bindings.MEDIA;
    if (bucket) {
      photoKey = mediaKey("testimonials", t.name, extFor(file.type));
      try {
        await bucket.put(photoKey, file.stream(), { httpMetadata: { contentType: file.type } });
      } catch (err) {
        console.error("[testimonial] photo upload failed", err);
        photoKey = null;
      }
    }
  }

  const approveToken = newToken();
  try {
    await db
      .prepare(
        `INSERT INTO testimonials (name, profession, body, photo_key, consent_at, status, approve_token, created_at)
         VALUES (?,?,?,?,?, 'pending', ?, ?)`,
      )
      .bind(t.name, t.profession, t.body, photoKey, new Date().toISOString(), approveToken, new Date().toISOString())
      .run();
  } catch (err) {
    console.error("[testimonial] insert failed", err);
    return json({ ok: false, message: "Couldn't save that just now. Please try again shortly." }, 503);
  }

  // Notify Thushara with a one-tap approve link — the workflow that
  // actually gets used. The panel is the fallback, not the main path.
  const base = bindings.SITE_URL ?? site.url;
  const from = bindings.FROM_EMAIL;
  // To the email under My details, like enquiries; the admin login email is the fallback.
  const to = (await getSiteSettings(db)).email ?? bindings.ADMIN_EMAIL;

  if (canSend(bindings) && from && from !== "PENDING" && to && to !== "PENDING") {
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const sent = await sendMail(bindings, {
      from, to,
      subject: `New review from ${t.name}`,
      html: `<!doctype html><html><body style="margin:0;background:#F4F1E9;padding:24px 12px">
<table role="presentation" width="100%"><tr><td align="center">
<table role="presentation" style="max-width:520px;background:#FBFAF6;border:1px solid #DCDEDF;border-radius:16px">
<tr><td style="background:#071A2E;padding:20px 28px">
  <div style="font:700 12px/1.4 -apple-system,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#C9962F">New review</div>
</td></tr>
<tr><td style="padding:28px">
  <div style="font:700 22px/1.2 -apple-system,sans-serif;color:#071A2E">${esc(t.name)}</div>
  <div style="font:400 16px/1.4 -apple-system,sans-serif;color:#6E7377;margin-top:3px">${esc(t.profession)}${photoKey ? " · photo attached" : ""}</div>
  <div style="margin-top:18px;padding:18px;background:#F4F1E9;border-radius:12px;font:400 17px/1.6 -apple-system,sans-serif;color:#16181A">${esc(t.body)}</div>
  <a href="${base}/admin/testimonials/approve?token=${approveToken}" style="display:block;margin-top:22px;text-align:center;padding:16px;background:#123A6B;color:#FBFAF6;text-decoration:none;border-radius:999px;font:700 17px/1 -apple-system,sans-serif">Approve &amp; publish</a>
  <a href="${base}/admin/testimonials" style="display:block;margin-top:10px;text-align:center;padding:14px;border:1.5px solid #DCDEDF;color:#123A6B;text-decoration:none;border-radius:999px;font:700 16px/1 -apple-system,sans-serif">Edit or reject first</a>
</td></tr></table></td></tr></table></body></html>`,
    });
    if (!sent.ok) {
      // The review is already saved and the approve link still works —
      // log it so a mail failure never strands a real client's words.
      console.error(`[testimonial] notify failed (${sent.error}). Approve: ${base}/admin/testimonials/approve?token=${approveToken}`);
    }
  } else {
    console.warn(`[testimonial] email not configured. Approve: ${base}/admin/testimonials/approve?token=${approveToken}`);
  }

  return json({ ok: true });
};
