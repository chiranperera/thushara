/**
 * POST /api/admin/testimonials/create — a review Thushara enters himself.
 *
 * Separate from /api/testimonial, which is the public form a client
 * fills in and then confirms by email. These are the ones he collects
 * in person from consultants he already works with, so there is no
 * email round-trip to prove consent — which is exactly why the form
 * makes him tick a box saying he has permission. A real doctor's name,
 * photograph and words are going on a public page; recording who
 * asserted the right to publish them, and when, is the least this
 * should do.
 *
 * Photo and fields arrive together in one multipart POST rather than
 * the two-step upload the gallery uses. One form, one Save.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { requireAdmin } from "../../../../lib/auth";
import { mediaKey, extFor, IMAGE_TYPES, MAX_IMAGE_BYTES } from "../../../../lib/media";

export const prerender = false;

const back = (q: string) =>
  new Response(null, { status: 303, headers: { location: `/admin/testimonials?${q}` } });

export const POST: APIRoute = async ({ request }) => {
  const bindings = env as unknown as Record<string, any>;
  const admin = await requireAdmin(request, bindings.AUTH_SECRET ?? "");
  if (!admin) return new Response(null, { status: 302, headers: { location: "/admin/login" } });

  const db = bindings.DB;
  const bucket = bindings.MEDIA;
  if (!db) return back("error=nodb");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return back("error=upload");
  }

  const id = String(form.get("id") ?? "").trim();
  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const profession = String(form.get("profession") ?? "").trim().slice(0, 160);
  const body = String(form.get("body") ?? "").trim().slice(0, 2000);

  // Only the words are required. A client's name, title or photo can
  // arrive later, and he fills them in when they do.
  if (!body) return back("error=empty");
  // Only required when creating: an edit is not a fresh assertion.
  if (!id && !form.get("consent")) return back("error=consent");

  // The photo is optional. A review with a name and a title still
  // works — the card falls back to initials rather than a broken image.
  let photoKey: string | null = null;
  const file = form.get("photo");
  if (file instanceof File && file.size > 0) {
    if (!IMAGE_TYPES.includes(file.type)) return back("error=filetype");
    if (file.size > MAX_IMAGE_BYTES) return back("error=filesize");
    if (!bucket) return back("error=nobucket");
    photoKey = mediaKey("testimonials", name, extFor(file.type));
    try {
      await bucket.put(photoKey, file.stream(), { httpMetadata: { contentType: file.type } });
    } catch (err) {
      console.error("[testimonials] R2 put failed", err);
      return back("error=upload");
    }
  }

  const now = new Date().toISOString();

  try {
    if (id) {
      // A missing photo on an edit means "leave the current one", not
      // "remove it" — the file input is empty every time the page
      // loads, so treating empty as a delete would wipe the photograph
      // of anyone whose wording he tweaked.
      await db
        .prepare(
          `UPDATE testimonials
             SET name = ?, profession = ?, body = ?${photoKey ? ", photo_key = ?" : ""}
           WHERE id = ?`,
        )
        .bind(...(photoKey ? [name, profession, body, photoKey, id] : [name, profession, body, id]))
        .run();
      return back("saved=1");
    }

    await db
      .prepare(
        `INSERT INTO testimonials
           (name, profession, body, photo_key, consent_at, status, featured, sort_order, created_at)
         VALUES (?,?,?,?,?, 'published', 0,
                 (SELECT COALESCE(MAX(sort_order),0)+1 FROM testimonials), ?)`,
      )
      .bind(name, profession, body, photoKey, now, now)
      .run();
    return back("saved=1");
  } catch (err) {
    console.error("[testimonials] write failed", err);
    return back("error=save");
  }
};
