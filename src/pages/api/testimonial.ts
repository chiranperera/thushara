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
import { Resend } from "resend";
import { newToken } from "../../lib/auth";
import { site } from "../../lib/site";

export const prerender = false;

const schema = z.object({
  name: z.string({ error: "Please add your name" }).trim().min(2, "Please add your name").max(120),
  profession: z.string({ error: "What do you do?" }).trim().min(2, "What do you do?").max(120),
  service: z.string().trim().max(120).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  body: z
    .string({ error: "Please write a few words" })
    .trim()
    .min(30, "A sentence or two would help — about 30 characters minimum")
    .max(2000),
  email: z.string({ error: "I need an email to verify this is genuine" }).trim().email("Please check that email address"),
  consent: z.literal(true, { error: "I need your permission to publish this" }),
  website: z.string().max(0).optional(), // honeypot
});

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });

export const POST: APIRoute = async ({ request }) => {
  const bindings = env as unknown as Record<string, any>;
  const db = bindings.DB;

  let payload: unknown;
  try { payload = await request.json(); } catch { return json({ ok: false }, 400); }

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

  const approveToken = newToken();
  try {
    await db
      .prepare(
        `INSERT INTO testimonials (name, profession, service, rating, body, email, consent_at, status, approve_token, created_at)
         VALUES (?,?,?,?,?,?,?, 'pending', ?, ?)`,
      )
      .bind(
        t.name, t.profession, t.service ?? null, t.rating ?? null, t.body, t.email,
        new Date().toISOString(), approveToken, new Date().toISOString(),
      )
      .run();
  } catch (err) {
    console.error("[testimonial] insert failed", err);
    return json({ ok: false, message: "Couldn't save that just now. Please try again shortly." }, 503);
  }

  // Notify Thushara with a one-tap approve link — the workflow that
  // actually gets used. The panel is the fallback, not the main path.
  const base = bindings.SITE_URL ?? site.url;
  const apiKey = bindings.RESEND_API_KEY;
  const from = bindings.FROM_EMAIL;
  const to = bindings.ADMIN_EMAIL;

  if (apiKey && from && from !== "PENDING" && to && to !== "PENDING") {
    try {
      const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      await new Resend(apiKey).emails.send({
        from, to,
        subject: `New review from ${t.name}`,
        html: `<!doctype html><html><body style="margin:0;background:#F4F1E9;padding:24px 12px">
<table role="presentation" width="100%"><tr><td align="center">
<table role="presentation" style="max-width:520px;background:#FBFAF6;border:1px solid #DCDFDC;border-radius:16px">
<tr><td style="background:#06231F;padding:20px 28px">
  <div style="font:700 12px/1.4 -apple-system,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#C9962F">New review</div>
</td></tr>
<tr><td style="padding:28px">
  <div style="font:700 22px/1.2 -apple-system,sans-serif;color:#06231F">${esc(t.name)}</div>
  <div style="font:400 16px/1.4 -apple-system,sans-serif;color:#737C79;margin-top:3px">${esc(t.profession)}${t.rating ? ` · ${t.rating}/5` : ""}</div>
  <div style="margin-top:18px;padding:18px;background:#F4F1E9;border-radius:12px;font:400 17px/1.6 -apple-system,sans-serif;color:#161A19">${esc(t.body)}</div>
  <a href="${base}/admin/testimonials/approve?token=${approveToken}" style="display:block;margin-top:22px;text-align:center;padding:16px;background:#12544A;color:#FBFAF6;text-decoration:none;border-radius:999px;font:700 17px/1 -apple-system,sans-serif">Approve &amp; publish</a>
  <a href="${base}/admin/testimonials" style="display:block;margin-top:10px;text-align:center;padding:14px;border:1.5px solid #DCDFDC;color:#12544A;text-decoration:none;border-radius:999px;font:700 16px/1 -apple-system,sans-serif">Edit or reject first</a>
</td></tr></table></td></tr></table></body></html>`,
      });
    } catch (err) {
      console.error("[testimonial] notify failed", err);
    }
  } else {
    console.warn(`[testimonial] email not configured. Approve: ${base}/admin/testimonials/approve?token=${approveToken}`);
  }

  return json({ ok: true });
};
