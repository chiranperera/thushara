/**
 * POST /api/admin/content — edits, reordering, hide and delete for the
 * four content screens.
 *
 * One endpoint rather than four, because every screen does the same
 * four things and the difference is only which table. Everything is a
 * plain form post, so all of it keeps working with JavaScript off.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { requireAdmin } from "../../../lib/auth";
import { slugify } from "../../../lib/media";

export const prerender = false;

/** Only these tables, and only these columns, can ever be written. */
const TABLES: Record<string, { table: string; page: string; fields: string[]; flag: string; fileCol?: string }> = {
  photo: {
    table: "gallery_items",
    page: "/admin/gallery",
    fields: ["caption", "alt_text", "category"],
    flag: "visible",
    fileCol: "image_key",
  },
  guide: {
    table: "resources",
    page: "/admin/resources",
    fields: ["title", "description", "audience", "life_stage", "page_count", "gated"],
    flag: "published",
    fileCol: "file_key",
  },
  faq: {
    table: "faqs",
    page: "/admin/faq",
    fields: ["question", "answer", "category", "service"],
    flag: "published",
  },
  service: {
    table: "services",
    page: "/admin/services",
    fields: ["title", "promise", "intro", "sections"],
    flag: "published",
  },
};

const back = (page: string, note: string) =>
  new Response(null, { status: 302, headers: { location: `${page}?${note}` } });

export const POST: APIRoute = async ({ request }) => {
  const bindings = env as unknown as Record<string, any>;
  const admin = await requireAdmin(request, bindings.AUTH_SECRET ?? "");
  if (!admin) return new Response(null, { status: 302, headers: { location: "/admin/login" } });

  const db = bindings.DB;
  const form = await request.formData();
  const spec = TABLES[String(form.get("_kind") ?? "")];
  if (!spec) return new Response("Unknown content type", { status: 400 });
  if (!db) return back(spec.page, "error=nodb");

  const action = String(form.get("_action") ?? "save");
  const id = Number(form.get("id")) || 0;

  try {
    /* ---------------------------------------------------- delete */
    if (action === "delete" && id) {
      // Remove the file too, or the bucket quietly accumulates orphans
      // nothing on the site points at.
      if (spec.fileCol && bindings.MEDIA) {
        const row: any = await db
          .prepare(`SELECT ${spec.fileCol} AS k${spec.table === "gallery_items" ? ", thumb_key" : ""} FROM ${spec.table} WHERE id = ?`)
          .bind(id)
          .first();
        for (const k of [row?.k, row?.thumb_key].filter(Boolean)) {
          try {
            await bindings.MEDIA.delete(k);
          } catch {
            /* best effort — the row still goes */
          }
        }
      }
      await db.prepare(`DELETE FROM ${spec.table} WHERE id = ?`).bind(id).run();
      return back(spec.page, "deleted=1");
    }

    /* ------------------------------------------------ show / hide */
    if (action === "toggle" && id) {
      await db
        .prepare(`UPDATE ${spec.table} SET ${spec.flag} = CASE ${spec.flag} WHEN 1 THEN 0 ELSE 1 END WHERE id = ?`)
        .bind(id)
        .run();
      return back(spec.page, "saved=1");
    }

    /* --------------------------------------------------- reorder */
    if (action === "move" && id) {
      const dir = String(form.get("dir")) === "up" ? "up" : "down";
      const me: any = await db.prepare(`SELECT sort_order FROM ${spec.table} WHERE id = ?`).bind(id).first();
      if (me) {
        const neighbour: any = await db
          .prepare(
            dir === "up"
              ? `SELECT id, sort_order FROM ${spec.table} WHERE sort_order < ? ORDER BY sort_order DESC LIMIT 1`
              : `SELECT id, sort_order FROM ${spec.table} WHERE sort_order > ? ORDER BY sort_order ASC LIMIT 1`,
          )
          .bind(me.sort_order)
          .first();
        if (neighbour) {
          await db.batch([
            db.prepare(`UPDATE ${spec.table} SET sort_order = ? WHERE id = ?`).bind(neighbour.sort_order, id),
            db.prepare(`UPDATE ${spec.table} SET sort_order = ? WHERE id = ?`).bind(me.sort_order, neighbour.id),
          ]);
        }
      }
      return back(spec.page, "saved=1");
    }

    /* ------------------------------------------------ create FAQ */
    if (action === "create" && spec.table === "faqs") {
      const q = String(form.get("question") ?? "").trim().slice(0, 300);
      const a = String(form.get("answer") ?? "").trim().slice(0, 4000);
      if (!q || !a) return back(spec.page, "error=empty");
      await db
        .prepare(
          `INSERT INTO faqs (question, answer, category, service, published, sort_order)
           VALUES (?,?,?,?,1,(SELECT COALESCE(MAX(sort_order),0)+1 FROM faqs))`,
        )
        .bind(q, a, String(form.get("category") ?? "").trim() || null, String(form.get("service") ?? "").trim() || null)
        .run();
      return back(spec.page, "saved=1");
    }

    /* ------------------------------------------------------ save */
    if (!id) return back(spec.page, "error=noid");

    const sets: string[] = [];
    const values: any[] = [];
    for (const f of spec.fields) {
      if (!form.has(f)) continue;
      let v: any = String(form.get(f) ?? "").trim();
      if (f === "page_count") v = Number(v) || null;
      else if (f === "gated") v = v === "on" || v === "1" ? 1 : 0;
      else v = v.slice(0, 6000) || null;
      sets.push(`${f} = ?`);
      values.push(v);
    }

    // `gated` is a checkbox: absent means off, so set it explicitly.
    if (spec.table === "resources" && !form.has("gated")) {
      sets.push("gated = ?");
      values.push(0);
    }
    // Keeping the slug in step with the title means the public URL
    // never drifts from what he sees on screen.
    if (spec.table === "resources" && form.has("title")) {
      const s = slugify(String(form.get("title") ?? ""));
      if (s) {
        sets.push("slug = ?");
        values.push(s);
      }
    }

    if (!sets.length) return back(spec.page, "saved=1");
    values.push(id);
    await db.prepare(`UPDATE ${spec.table} SET ${sets.join(", ")} WHERE id = ?`).bind(...values).run();
    return back(spec.page, "saved=1");
  } catch (err) {
    console.error("[admin/content] failed", err);
    return back(spec.page, "error=1");
  }
};
