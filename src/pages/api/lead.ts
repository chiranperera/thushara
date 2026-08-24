/**
 * POST /api/lead — the lead capture endpoint.
 *
 * THE ONE RULE: write to the database FIRST, notify SECOND.
 * A notification outage must never cost a lead. If email fails, the
 * lead is still saved and flagged so it surfaces in /admin/leads.
 *
 * Spec: design-brief/08-booking-and-automation.md
 */

import type { APIRoute } from "astro";
// Astro 7 removed `locals.runtime.env` — bindings come from the
// Workers runtime module now.
import { env } from "cloudflare:workers";
import { leadSchema } from "../../lib/lead-schema";
import { sendLeadEmails } from "../../lib/email";
import { site } from "../../lib/site";

export const prerender = false;

/** Simple per-IP rate limit. Invisible — no CAPTCHA. */
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // crude bound; Workers isolates are short-lived
  return recent.length > RATE_LIMIT.max;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const bindings = env as unknown as Record<string, any>;

  // ---------------------------------------------------------------- parse
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_body", message: "Something went wrong. Please try again." }, 400);
  }

  if (rateLimited(clientAddress ?? "unknown")) {
    return json(
      { ok: false, error: "rate_limited", message: "That's a few too many attempts. Please try again shortly, or message me on WhatsApp." },
      429,
    );
  }

  // ---------------------------------------------------------------- validate
  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "root";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    // Honeypot: pretend success so bots don't learn anything.
    if ("website" in fieldErrors) return json({ ok: true, id: 0 });
    return json({ ok: false, error: "validation", fieldErrors }, 422);
  }

  const lead = parsed.data;
  const now = new Date().toISOString();

  // ---------------------------------------------------------------- SAVE FIRST
  const db = bindings.DB;
  if (!db) {
    // No database binding — the one case where we cannot save. Tell the
    // truth and hand them a channel that definitely works.
    return json(
      { ok: false, error: "storage_unavailable", message: "I couldn't save that just now. Please message me on WhatsApp and I'll pick it up straight away." },
      503,
    );
  }

  let leadId: number;
  try {
    const result = await db
      .prepare(
        `INSERT INTO leads (
           name, email, phone_whatsapp,
           profession_category, profession_role, engineering_discipline, profession_other,
           services, preferred_date, preferred_time, alt_time, meeting_method,
           notes, preferred_contact, referring_page, life_stage, calculator_data,
           consent_at, status, created_at
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'new',?)`,
      )
      .bind(
        lead.name,
        lead.email,
        lead.phone_whatsapp,
        lead.profession_category,
        lead.profession_role ?? null,
        lead.engineering_discipline ?? null,
        lead.profession_other ?? null,
        JSON.stringify(lead.services),
        lead.preferred_date ?? null,
        lead.preferred_time ?? null,
        lead.alt_time ?? null,
        lead.meeting_method,
        lead.notes ?? null,
        lead.preferred_contact,
        lead.referring_page ?? null,
        lead.life_stage ?? null,
        lead.calculator_data ?? null,
        now,
        now,
      )
      .run();

    leadId = Number(result.meta?.last_row_id ?? 0);
  } catch (err) {
    console.error("[lead] DB insert failed", err);
    return json(
      { ok: false, error: "storage_failed", message: "I couldn't save that just now. Please message me on WhatsApp and I'll pick it up straight away." },
      503,
    );
  }

  // The lead is safe from here. Everything below is best-effort.

  // ---------------------------------------------------------------- NOTIFY SECOND
  let notified = false;
  try {
    const settings = await readCredentialSettings(db);
    const sent = await sendLeadEmails({
      apiKey: bindings.RESEND_API_KEY ?? "",
      from: bindings.FROM_EMAIL ?? "",
      adminEmail: bindings.ADMIN_EMAIL ?? "",
      siteUrl: bindings.SITE_URL ?? site.url,
      lead,
      leadId,
      mdrtYears: settings.mdrtYears,
      years: settings.years,
    });
    notified = sent.ok;
    if (!sent.ok) console.error("[lead] notification failed", sent.error);
  } catch (err) {
    console.error("[lead] notification threw", err);
  }

  // Flag it so Thushara sees the lead needs a manual reply.
  if (!notified) {
    try {
      await db.prepare(`UPDATE leads SET notification_failed = 1 WHERE id = ?`).bind(leadId).run();
    } catch (err) {
      console.error("[lead] could not flag notification failure", err);
    }
  }

  // Saved is success from the visitor's point of view — they must never
  // be asked to resubmit because *our* email provider had a bad minute.
  return json({ ok: true, id: leadId });
};

async function readCredentialSettings(db: any) {
  const fallback = {
    years: site.credentials.yearsExperience,
    mdrtYears: site.credentials.mdrtYears,
  };
  try {
    const rows = await db
      .prepare(`SELECT key, value FROM settings WHERE key IN ('years_experience','mdrt_years')`)
      .all();
    const map = new Map<string, string>((rows.results ?? []).map((r: any) => [r.key, r.value]));
    return {
      years: Number(map.get("years_experience")) || fallback.years,
      mdrtYears: Number(map.get("mdrt_years")) || fallback.mdrtYears,
    };
  } catch {
    return fallback;
  }
}
