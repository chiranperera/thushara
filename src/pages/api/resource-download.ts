/**
 * POST /api/resource-download — records who took a guide, then hands
 * over the file.
 *
 * Same rule as the lead form: record first, deliver second. If the
 * insert fails the visitor still gets the guide — losing a download
 * record is a nuisance, refusing someone a free PDF is worse.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { normaliseSriLankanPhone } from "../../lib/lead-schema";

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const bindings = env as unknown as Record<string, any>;
  const db = bindings.DB;

  const form = await request.formData();
  const slug = String(form.get("slug") ?? "");
  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const phone = normaliseSriLankanPhone(String(form.get("phone_whatsapp") ?? ""));
  const email = String(form.get("email") ?? "").trim().slice(0, 200);

  const fail = () =>
    new Response(null, { status: 302, headers: { location: `/resources/${slug}?error=1` } });

  if (!slug || !db) return fail();

  // Honeypot. Silently give the file — a bot gets a PDF, which costs
  // nothing, and no false record is written.
  const isBot = String(form.get("company") ?? "").length > 0;

  let guide: any = null;
  try {
    guide = await db
      .prepare(`SELECT id, file_key FROM resources WHERE slug = ? AND published = 1`)
      .bind(slug)
      .first();
  } catch (err) {
    console.error("[resource-download] lookup failed", err);
  }
  if (!guide) return new Response(null, { status: 302, headers: { location: "/resources" } });

  if (!isBot) {
    if (!name || !phone) return fail();
    const now = new Date().toISOString();
    try {
      await db.batch([
        db
          .prepare(
            `INSERT INTO resource_downloads (resource_id, name, phone_whatsapp, email, consent_at, created_at)
             VALUES (?,?,?,?,?,?)`,
          )
          .bind(guide.id, name, phone, email || null, now, now),
        db.prepare(`UPDATE resources SET download_count = download_count + 1 WHERE id = ?`).bind(guide.id),
      ]);
    } catch (err) {
      // Deliberately not fatal — see the note at the top.
      console.error("[resource-download] record failed", err, { ip: clientAddress });
    }
  }

  return new Response(null, { status: 302, headers: { location: `/media/${guide.file_key}` } });
};
