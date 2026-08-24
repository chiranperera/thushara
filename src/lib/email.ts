/**
 * Transactional email.
 *
 * Every automated message must work as EMAIL. WhatsApp automation is a
 * phase-2 upgrade layered on top — never the only channel.
 * Spec: design-brief/08-booking-and-automation.md
 */

import { Resend } from "resend";
import { site, whatsappLink } from "./site";
import type { LeadData } from "./lead-schema";

const C = {
  ink: "#06231F",
  teal: "#12544A",
  tealLight: "#EBF7F3",
  gold: "#C9962F",
  cream: "#FBFAF6",
  cream100: "#F4F1E9",
  border: "#DCDFDC",
  text: "#161A19",
  muted: "#737C79",
  whatsapp: "#25D366",
} as const;

const PROFESSION_LABEL: Record<string, string> = {
  doctor: "Doctor",
  engineer: "Engineer",
  other_professional: "Other Professional",
  other: "Other",
};

const METHOD_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp call",
  phone: "Phone call",
  video: "Video call",
  in_person: "In person",
};

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function row(label: string, value: string) {
  if (!value) return "";
  return `
    <tr><td style="padding:0 0 18px">
      <div style="font:700 12px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:${C.muted}">${esc(label)}</div>
      <div style="font:400 17px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${C.text};margin-top:5px">${value}</div>
    </td></tr>`;
}

const shell = (inner: string) => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${C.cream100};-webkit-font-smoothing:antialiased">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream100};padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.cream};border:1px solid ${C.border};border-radius:16px;overflow:hidden">
${inner}
</table>
</td></tr></table></body></html>`;

/**
 * TO THUSHARA — the notification he will actually use every day.
 * Read on a phone. The WhatsApp button is the primary action: he
 * should never need to open the admin panel just to reply.
 */
export function leadNotificationEmail(lead: LeadData, leadId: number, siteUrl: string) {
  const profession = [
    PROFESSION_LABEL[lead.profession_category] ?? lead.profession_category,
    lead.profession_role || lead.engineering_discipline || lead.profession_other,
  ]
    .filter(Boolean)
    .join(" — ");

  const wa = whatsappLink(
    `Hello ${lead.name.split(" ")[0]}, thank you for your enquiry. I'd be glad to help.`,
    lead.phone_whatsapp,
  );

  const when = [lead.preferred_date, lead.preferred_time].filter(Boolean).join(" at ");

  return shell(`
<tr><td style="background:${C.ink};padding:20px 28px">
  <div style="font:700 12px/1.4 -apple-system,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${C.gold}">New enquiry</div>
</td></tr>

<tr><td style="padding:28px 28px 8px">
  <div style="font:700 26px/1.15 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${C.ink};letter-spacing:-.02em">${esc(lead.name)}</div>
  <div style="font:400 16px/1.4 -apple-system,sans-serif;color:${C.muted};margin-top:4px">${esc(profession)}</div>
</td></tr>

${
  wa
    ? `<tr><td style="padding:20px 28px 0">
  <a href="${wa}" style="display:block;background:${C.whatsapp};color:#fff;text-decoration:none;text-align:center;padding:18px;border-radius:999px;font:700 17px/1 -apple-system,sans-serif">Reply on WhatsApp</a>
</td></tr>`
    : ""
}

<tr><td style="padding:10px 28px 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td width="49%"><a href="tel:${esc(lead.phone_whatsapp)}" style="display:block;text-align:center;padding:14px;border:1.5px solid ${C.teal};border-radius:999px;color:${C.teal};text-decoration:none;font:700 15px/1 -apple-system,sans-serif">Call</a></td>
    <td width="2%"></td>
    <td width="49%"><a href="mailto:${esc(lead.email)}" style="display:block;text-align:center;padding:14px;border:1.5px solid ${C.teal};border-radius:999px;color:${C.teal};text-decoration:none;font:700 15px/1 -apple-system,sans-serif">Email</a></td>
  </tr></table>
</td></tr>

<tr><td style="padding:28px">
  <div style="height:1px;background:${C.border};margin-bottom:24px"></div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${row("Interested in", esc(lead.services.join(", ")))}
    ${row("Wants to meet", `${esc(when)} — ${esc(METHOD_LABEL[lead.meeting_method] ?? lead.meeting_method)}`)}
    ${lead.alt_time ? row("Or alternatively", esc(lead.alt_time)) : ""}
    ${row("Contact", `${esc(lead.phone_whatsapp)}<br>${esc(lead.email)}<br><span style="color:${C.muted};font-size:15px">Prefers ${esc(lead.preferred_contact)}</span>`)}
    ${lead.notes ? row("Their note", `<em style="color:${C.text}">“${esc(lead.notes)}”</em>`) : ""}
    ${lead.referring_page ? row("Was reading", esc(lead.referring_page)) : ""}
    ${lead.life_stage ? row("Life stage", esc(lead.life_stage)) : ""}
    ${lead.calculator_data ? row("Calculator values", esc(lead.calculator_data)) : ""}
  </table>
</td></tr>

<tr><td style="padding:0 28px 28px">
  <a href="${siteUrl}/admin/leads/${leadId}" style="display:block;text-align:center;padding:15px;background:${C.teal};color:${C.cream};text-decoration:none;border-radius:999px;font:700 16px/1 -apple-system,sans-serif">View in admin</a>
</td></tr>`);
}

/**
 * TO THE PROSPECT — often their first real experience of Thushara.
 * First person, no marketing language, always a way to reply.
 */
export function leadConfirmationEmail(lead: LeadData, siteUrl: string, mdrtYears: number, years: number) {
  const when = [lead.preferred_date, lead.preferred_time].filter(Boolean).join(" at ");
  const first = lead.name.split(" ")[0];

  return shell(`
<tr><td style="padding:32px 28px 0">
  <div style="font:400 18px/1.65 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${C.text}">
    <p style="margin:0 0 18px">Hello ${esc(first)},</p>
    <p style="margin:0 0 18px">Thank you for reaching out. I've received your request and I'm looking forward to speaking with you.</p>
  </div>
</td></tr>

<tr><td style="padding:6px 28px 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.tealLight};border-radius:14px">
    <tr><td style="padding:22px 24px">
      <div style="font:700 12px/1.4 -apple-system,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:${C.teal}">Your request</div>
      <div style="font:700 19px/1.4 -apple-system,sans-serif;color:${C.ink};margin-top:8px">${esc(when)}</div>
      <div style="font:400 16px/1.4 -apple-system,sans-serif;color:${C.text};margin-top:4px">${esc(METHOD_LABEL[lead.meeting_method] ?? lead.meeting_method)}</div>
    </td></tr>
  </table>
</td></tr>

<tr><td style="padding:20px 28px 0">
  <div style="font:400 18px/1.65 -apple-system,sans-serif;color:${C.text}">
    <p style="margin:0 0 18px">I'll confirm this shortly. If anything changes, or you'd like to talk sooner, just reply to this email.</p>
    <p style="margin:0">There's no obligation, and nothing to prepare.</p>
  </div>
</td></tr>

<tr><td style="padding:28px">
  <div style="height:1px;background:${C.border};margin-bottom:20px"></div>
  <div style="font:700 17px/1.4 -apple-system,sans-serif;color:${C.ink}">${esc(site.name)}</div>
  <div style="font:400 15px/1.5 -apple-system,sans-serif;color:${C.muted};margin-top:3px">${esc(site.title)}, ${esc(site.employer)}</div>
  <div style="font:400 14px/1.5 -apple-system,sans-serif;color:${C.muted};margin-top:8px">${years} years · ${mdrtYears}× MDRT Lifetime Member</div>
</td></tr>`);
}

export interface SendResult {
  ok: boolean;
  error?: string;
}

/**
 * Sends both emails. Never throws — a delivery failure must not turn
 * into a lost lead. The caller flags the lead instead.
 */
export async function sendLeadEmails(opts: {
  apiKey: string;
  from: string;
  adminEmail: string;
  siteUrl: string;
  lead: LeadData;
  leadId: number;
  mdrtYears: number;
  years: number;
}): Promise<SendResult> {
  const { apiKey, from, adminEmail, siteUrl, lead, leadId } = opts;

  if (!apiKey || apiKey === "PENDING" || !adminEmail || adminEmail === "PENDING") {
    return { ok: false, error: "Email not configured (RESEND_API_KEY / ADMIN_EMAIL pending)" };
  }

  const resend = new Resend(apiKey);
  const professionLabel = PROFESSION_LABEL[lead.profession_category] ?? lead.profession_category;

  const results = await Promise.allSettled([
    resend.emails.send({
      from,
      to: adminEmail,
      replyTo: lead.email,
      subject: `New enquiry — ${lead.name} (${professionLabel}) — ${lead.services.slice(0, 2).join(", ")}`,
      html: leadNotificationEmail(lead, leadId, siteUrl),
    }),
    resend.emails.send({
      from,
      to: lead.email,
      replyTo: adminEmail,
      subject: `Thank you — I'll be in touch`,
      html: leadConfirmationEmail(lead, siteUrl, opts.mdrtYears, opts.years),
    }),
  ]);

  const failures = results
    .map((r, i) => {
      const who = i === 0 ? "admin" : "prospect";
      if (r.status === "rejected") return `${who}: ${r.reason}`;
      if (r.value?.error) return `${who}: ${r.value.error.message}`;
      return null;
    })
    .filter(Boolean);

  return failures.length ? { ok: false, error: failures.join(" | ") } : { ok: true };
}
