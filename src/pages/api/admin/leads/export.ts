/**
 * GET /api/admin/leads/export — CSV.
 * He is never locked in: his own data walks out in one click.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { requireAdmin } from "../../../../lib/auth";
import { parseServices } from "../../../../lib/admin-data";

export const prerender = false;

/** A leading =, +, - or @ makes spreadsheets treat a cell as a formula. */
const cell = (v: unknown) => {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export const GET: APIRoute = async ({ request }) => {
  const bindings = env as unknown as Record<string, any>;
  const admin = await requireAdmin(request, bindings.AUTH_SECRET ?? "");
  if (!admin) return new Response(null, { status: 302, headers: { location: "/admin/login" } });

  const db = bindings.DB;
  if (!db) return new Response("No database", { status: 503 });

  const cols = [
    "Received", "Name", "Email", "WhatsApp", "Profession", "Role",
    "Interested in", "Preferred date", "Preferred time", "Method",
    "Their message", "Was reading", "Status", "My notes",
  ];

  let rows: any[] = [];
  try {
    const res = await db.prepare(`SELECT * FROM leads ORDER BY created_at DESC`).all();
    rows = res.results ?? [];
  } catch (err) {
    console.error("[admin] export failed", err);
    return new Response("Export failed", { status: 500 });
  }

  const body = [
    cols.map(cell).join(","),
    ...rows.map((r) =>
      [
        r.created_at, r.name, r.email, r.phone_whatsapp,
        r.profession_category,
        r.profession_role || r.engineering_discipline || r.profession_other,
        parseServices(r.services).join("; "),
        r.preferred_date, r.preferred_time, r.meeting_method,
        r.notes, r.referring_page, r.status, r.admin_notes,
      ].map(cell).join(","),
    ),
  ].join("\r\n");

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="enquiries-${stamp}.csv"`,
    },
  });
};
