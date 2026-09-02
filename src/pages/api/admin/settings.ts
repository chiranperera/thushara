/** POST /api/admin/settings — profile values and availability windows. */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { requireAdmin } from "../../../lib/auth";

export const prerender = false;

const PROFILE_KEYS = ["phone", "whatsapp", "email", "service_area", "years_experience", "mdrt_years", "cot_years"];
const NUMERIC = ["appointment_minutes", "buffer_minutes", "max_per_day"];

export const POST: APIRoute = async ({ request }) => {
  const bindings = env as unknown as Record<string, any>;
  const admin = await requireAdmin(request, bindings.AUTH_SECRET ?? "");
  if (!admin) return new Response(null, { status: 302, headers: { location: "/admin/login" } });

  const db = bindings.DB;
  const form = await request.formData();
  const section = String(form.get("_section") ?? "");
  const dest = section === "profile" ? "/admin/profile" : "/admin/availability";
  if (!db) return new Response(null, { status: 302, headers: { location: dest } });

  const now = new Date().toISOString();
  const put = (key: string, value: string) =>
    db
      .prepare(
        `INSERT INTO settings (key, value, updated_at) VALUES (?,?,?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      )
      .bind(key, value, now);

  try {
    const stmts: any[] = [];

    if (section === "profile") {
      for (const key of PROFILE_KEYS) {
        if (!form.has(key)) continue;
        const raw = String(form.get(key) ?? "").trim().slice(0, 200);
        // Empty goes back to PENDING so the site keeps hiding it rather
        // than rendering a blank phone number.
        stmts.push(put(key, raw || "PENDING"));
      }
    } else {
      for (const key of NUMERIC) {
        if (!form.has(key)) continue;
        const n = Math.max(1, Math.min(480, Number(form.get(key)) || 0));
        if (n) stmts.push(put(key, String(n)));
      }
      stmts.push(put("bookings_paused", form.get("bookings_paused") ? "1" : "0"));

      // Unchecked checkboxes are simply absent, so every window is set
      // explicitly from what the form did send.
      const ids: number[] = [];
      const res = await db.prepare(`SELECT id FROM availability`).all();
      for (const r of res.results ?? []) ids.push(Number((r as any).id));
      for (const id of ids) {
        stmts.push(
          db.prepare(`UPDATE availability SET active = ? WHERE id = ?`).bind(form.has(`window_${id}`) ? 1 : 0, id),
        );
      }
    }

    if (stmts.length) await db.batch(stmts);
  } catch (err) {
    console.error("[admin] settings save failed", err);
  }

  return new Response(null, { status: 302, headers: { location: `${dest}?saved=1` } });
};
