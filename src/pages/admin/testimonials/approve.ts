/**
 * GET /admin/testimonials/approve?token=… — one-tap approval.
 *
 * Reached from the notification email, usually on a phone. Requires a
 * signed-in session as well as the token: an approve link forwarded to
 * someone else must not publish anything.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { requireAdmin } from "../../../lib/auth";

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  const bindings = env as unknown as Record<string, any>;
  const token = url.searchParams.get("token") ?? "";

  const admin = await requireAdmin(request, bindings.AUTH_SECRET ?? "");
  if (!admin) {
    // Send them through login, then straight back here.
    const next = encodeURIComponent(`/admin/testimonials/approve?token=${token}`);
    return new Response(null, { status: 302, headers: { location: `/admin/login?next=${next}` } });
  }

  const db = bindings.DB;
  if (!db || !token) {
    return new Response(null, { status: 302, headers: { location: "/admin/testimonials?e=invalid" } });
  }

  try {
    const row = await db
      .prepare(`SELECT id, status FROM testimonials WHERE approve_token = ?`)
      .bind(token)
      .first();

    if (!row) return new Response(null, { status: 302, headers: { location: "/admin/testimonials?e=invalid" } });
    if (row.status === "published") {
      return new Response(null, { status: 302, headers: { location: "/admin/testimonials?ok=already" } });
    }

    await db
      .prepare(`UPDATE testimonials SET status='published', published_at=?, approve_token=NULL WHERE id=?`)
      .bind(new Date().toISOString(), row.id)
      .run();
  } catch (err) {
    console.error("[testimonial] approve failed", err);
    return new Response(null, { status: 302, headers: { location: "/admin/testimonials?e=failed" } });
  }

  return new Response(null, { status: 302, headers: { location: "/admin/testimonials?ok=published" } });
};
