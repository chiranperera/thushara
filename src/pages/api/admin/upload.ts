/**
 * POST /api/admin/upload — a photo or a PDF guide.
 *
 * Same rule as the lead form, for the same reason: get the file safely
 * into storage first, then record it. If the database insert fails the
 * object is removed again, so the bucket never fills with files nothing
 * points at.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { requireAdmin } from "../../../lib/auth";
import {
  IMAGE_TYPES,
  PDF_TYPES,
  MAX_IMAGE_BYTES,
  MAX_PDF_BYTES,
  extFor,
  mediaKey,
  slugify,
} from "../../../lib/media";

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export const POST: APIRoute = async ({ request }) => {
  const bindings = env as unknown as Record<string, any>;
  const admin = await requireAdmin(request, bindings.AUTH_SECRET ?? "");
  if (!admin) return json({ ok: false, message: "Not signed in." }, 401);

  const db = bindings.DB;
  const bucket = bindings.MEDIA;
  if (!db || !bucket) {
    return json({ ok: false, message: "Storage is not configured on this environment." }, 500);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, message: "That upload didn't arrive in one piece. Please try again." }, 400);
  }

  const kind = String(form.get("kind") ?? "");
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return json({ ok: false, message: "No file was attached." }, 400);
  }

  const isPhoto = kind === "photo";
  const allowed = isPhoto ? IMAGE_TYPES : PDF_TYPES;
  const limit = isPhoto ? MAX_IMAGE_BYTES : MAX_PDF_BYTES;

  if (!allowed.includes(file.type)) {
    return json(
      { ok: false, message: isPhoto ? "That isn't an image file." : "Guides need to be PDF files." },
      400,
    );
  }
  if (file.size > limit) {
    return json(
      { ok: false, message: `That file is too large. The limit is ${Math.round(limit / 1024 / 1024)} MB.` },
      400,
    );
  }

  const title = String(form.get("title") ?? "").trim().slice(0, 200);
  const key = mediaKey(isPhoto ? "gallery" : "guides", title || file.name.replace(/\.[^.]+$/, ""), extFor(file.type));

  try {
    await bucket.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  } catch (err) {
    console.error("[upload] R2 put failed", err);
    return json({ ok: false, message: "The file could not be saved. Please try again." }, 500);
  }

  const now = new Date().toISOString();

  try {
    if (isPhoto) {
      // A thumbnail is optional — the browser makes one before upload,
      // but the photo still works on its own if it didn't.
      const thumb = form.get("thumb");
      let thumbKey: string | null = null;
      if (thumb instanceof File && thumb.size > 0 && IMAGE_TYPES.includes(thumb.type)) {
        thumbKey = key.replace(/(\.[^.]+)$/, "-thumb$1");
        await bucket.put(thumbKey, thumb.stream(), { httpMetadata: { contentType: thumb.type } });
      }

      const alt = String(form.get("alt_text") ?? "").trim().slice(0, 300);
      await db
        .prepare(
          `INSERT INTO gallery_items
             (image_key, thumb_key, width, height, caption, alt_text, category, visible, sort_order, created_at)
           VALUES (?,?,?,?,?,?,?,1,
             (SELECT COALESCE(MAX(sort_order),0)+1 FROM gallery_items), ?)`,
        )
        .bind(
          key,
          thumbKey,
          Number(form.get("width")) || null,
          Number(form.get("height")) || null,
          String(form.get("caption") ?? "").trim().slice(0, 300) || null,
          // Alt text is required for the public page; fall back to the
          // caption rather than shipping an empty alt.
          alt || String(form.get("caption") ?? "").trim().slice(0, 300) || "Photograph",
          String(form.get("category") ?? "mdrt_awards"),
          now,
        )
        .run();
    } else {
      const slug = slugify(title || file.name.replace(/\.[^.]+$/, "")) || `guide-${Date.now()}`;
      await db
        .prepare(
          `INSERT INTO resources
             (slug, title, description, audience, life_stage, file_key, page_count, file_size,
              download_count, gated, published, sort_order, created_at)
           VALUES (?,?,?,?,?,?,?,?,0,?,1,
             (SELECT COALESCE(MAX(sort_order),0)+1 FROM resources), ?)`,
        )
        .bind(
          slug,
          title || file.name,
          String(form.get("description") ?? "").trim().slice(0, 600) || null,
          String(form.get("audience") ?? "").trim().slice(0, 120) || null,
          String(form.get("life_stage") ?? "starting-out"),
          key,
          Number(form.get("page_count")) || null,
          file.size,
          form.get("gated") === "0" ? 0 : 1,
          now,
        )
        .run();
    }
  } catch (err) {
    console.error("[upload] DB insert failed", err);
    // Don't leave an orphan in the bucket.
    try {
      await bucket.delete(key);
    } catch {
      /* best effort */
    }
    const dupe = String(err).includes("UNIQUE");
    return json(
      {
        ok: false,
        message: dupe
          ? "There is already a guide with that name. Give this one a slightly different title."
          : "The file uploaded but could not be recorded. Please try again.",
      },
      500,
    );
  }

  return json({ ok: true });
};
