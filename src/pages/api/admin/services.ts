/**
 * POST /api/admin/services — service page wording.
 *
 * Separate from /api/admin/content because these rows are upserted by
 * slug: a service he has never touched has no row at all, and the page
 * falls back to the text written from his approved copy. "Undo my
 * changes" clears the edits, which restores that original wording
 * exactly — so editing is never a one-way door.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { requireAdmin } from "../../../lib/auth";
import { serviceContent } from "../../../lib/service-content";
import { getService } from "../../../lib/site";

export const prerender = false;

const back = (note: string) =>
  new Response(null, { status: 302, headers: { location: `/admin/services?${note}` } });

export const POST: APIRoute = async ({ request }) => {
  const bindings = env as unknown as Record<string, any>;
  const admin = await requireAdmin(request, bindings.AUTH_SECRET ?? "");
  if (!admin) return new Response(null, { status: 302, headers: { location: "/admin/login" } });

  const db = bindings.DB;
  const form = await request.formData();
  const slug = String(form.get("slug") ?? "");
  const action = String(form.get("_action") ?? "save");

  if (!db || !slug || !serviceContent[slug]) return back("error=1");

  try {
    if (action === "revert") {
      // Clear the edits rather than the row. The row also carries the
      // published flag and the nav ordering from the seed migration,
      // and deleting it would take those with it.
      await db
        .prepare(`UPDATE services SET promise = NULL, intro = NULL, sections = NULL WHERE slug = ?`)
        .bind(slug)
        .run();
      return back("saved=1");
    }

    if (action === "toggle") {
      await db
        .prepare(`UPDATE services SET published = CASE published WHEN 1 THEN 0 ELSE 1 END WHERE slug = ?`)
        .bind(slug)
        .run();
      return back("saved=1");
    }

    const file = serviceContent[slug];
    const meta = getService(slug);
    const title = String(form.get("title") ?? "").trim().slice(0, 200) || file.title;
    const promise = String(form.get("promise") ?? "").trim().slice(0, 300);
    const intro = String(form.get("intro") ?? "").trim().slice(0, 3000);
    const closing = String(form.get("closing") ?? "").trim().slice(0, 600);

    await db
      .prepare(
        `INSERT INTO services (slug, title, promise, intro, sections, life_stage, icon, published, sort_order)
         VALUES (?,?,?,?,?,?,?,1,(SELECT COALESCE(MAX(sort_order),0)+1 FROM services))
         ON CONFLICT(slug) DO UPDATE SET
           title = excluded.title,
           promise = excluded.promise,
           intro = excluded.intro,
           sections = excluded.sections`,
      )
      .bind(slug, title, promise || null, intro || null, JSON.stringify({ closing }), meta?.lifeStage ?? null, meta?.icon ?? null)
      .run();

    return back("saved=1");
  } catch (err) {
    console.error("[admin/services] save failed", err);
    return back("error=1");
  }
};
