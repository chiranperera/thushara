/** POST /api/admin/testimonials/update — approve, edit, reject, feature, delete. */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { requireAdmin } from "../../../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const bindings = env as unknown as Record<string, any>;
  const admin = await requireAdmin(request, bindings.AUTH_SECRET ?? "");
  if (!admin) return new Response(null, { status: 302, headers: { location: "/admin/login" } });

  const db = bindings.DB;
  const form = await request.formData();
  const id = Number(form.get("id"));
  const action = String(form.get("action") ?? "");
  const back = { status: 302, headers: { location: "/admin/testimonials" } };

  if (!db || !Number.isFinite(id)) return new Response(null, back);
  const now = new Date().toISOString();

  try {
    switch (action) {
      case "publish": {
        // Edits are applied at the same time — real submissions contain
        // typos, and fixing one shouldn't mean rejecting it.
        const body = String(form.get("body") ?? "").trim().slice(0, 2000);
        const name = String(form.get("name") ?? "").trim().slice(0, 120);
        const profession = String(form.get("profession") ?? "").trim().slice(0, 120);
        if (!body || !name) return new Response(null, back);
        await db
          .prepare(
            `UPDATE testimonials SET status='published', body=?, name=?, profession=?, published_at=?, approve_token=NULL WHERE id=?`,
          )
          .bind(body, name, profession, now, id)
          .run();
        break;
      }
      case "reject":
        await db
          .prepare(`UPDATE testimonials SET status='rejected', reject_reason=?, approve_token=NULL WHERE id=?`)
          .bind(String(form.get("reason") ?? "").slice(0, 500) || null, id)
          .run();
        break;
      case "unpublish":
        await db.prepare(`UPDATE testimonials SET status='pending' WHERE id=?`).bind(id).run();
        break;
      case "feature":
        await db.prepare(`UPDATE testimonials SET featured = 1 - featured WHERE id=?`).bind(id).run();
        break;
      case "delete":
        await db.prepare(`DELETE FROM testimonials WHERE id=?`).bind(id).run();
        break;
    }
  } catch (err) {
    console.error("[testimonial] update failed", err);
  }

  return new Response(null, back);
};
