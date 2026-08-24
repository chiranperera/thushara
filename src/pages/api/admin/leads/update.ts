/** POST /api/admin/leads/update — status + private notes. */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { requireAdmin } from "../../../../lib/auth";

export const prerender = false;

const VALID = new Set(["new", "contacted", "confirmed", "met", "converted", "not_proceeding"]);

export const POST: APIRoute = async ({ request }) => {
  const bindings = env as unknown as Record<string, any>;
  const admin = await requireAdmin(request, bindings.AUTH_SECRET ?? "");
  if (!admin) return new Response(null, { status: 302, headers: { location: "/admin/login" } });

  const db = bindings.DB;
  const form = await request.formData();
  const id = Number(form.get("id"));
  const status = String(form.get("status") ?? "");
  const notes = String(form.get("admin_notes") ?? "").slice(0, 4000);

  if (!db || !Number.isFinite(id) || !VALID.has(status)) {
    return new Response(null, { status: 302, headers: { location: `/admin/leads/${id}` } });
  }

  try {
    await db
      .prepare(`UPDATE leads SET status = ?, admin_notes = ?, updated_at = ? WHERE id = ?`)
      .bind(status, notes || null, new Date().toISOString(), id)
      .run();
  } catch (err) {
    console.error("[admin] lead update failed", err);
  }

  return new Response(null, { status: 302, headers: { location: `/admin/leads/${id}?saved=1` } });
};
