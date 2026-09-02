/**
 * Shared queries for admin pages. Keeping them here means every screen
 * counts things the same way.
 */

export interface LeadRow {
  id: number;
  name: string;
  email: string;
  phone_whatsapp: string;
  profession_category: string;
  profession_role: string | null;
  engineering_discipline: string | null;
  profession_other: string | null;
  services: string;
  preferred_date: string | null;
  preferred_time: string | null;
  alt_time: string | null;
  meeting_method: string;
  notes: string | null;
  preferred_contact: string;
  referring_page: string | null;
  life_stage: string | null;
  calculator_data: string | null;
  status: string;
  notification_failed: number;
  admin_notes: string | null;
  created_at: string;
}

export interface TestimonialRow {
  id: number;
  name: string;
  profession: string;
  service: string | null;
  rating: number | null;
  body: string;
  photo_key: string | null;
  status: string;
  featured: number;
  sort_order: number;
  created_at: string;
}

export interface AdminCounts {
  newLeads: number;
  pendingReviews: number;
}

export async function getCounts(db: any): Promise<AdminCounts> {
  if (!db) return { newLeads: 0, pendingReviews: 0 };
  try {
    const [l, t] = await db.batch([
      db.prepare(`SELECT COUNT(*) AS n FROM leads WHERE status = 'new'`),
      db.prepare(`SELECT COUNT(*) AS n FROM testimonials WHERE status = 'pending'`),
    ]);
    return {
      newLeads: Number(l.results?.[0]?.n ?? 0),
      pendingReviews: Number(t.results?.[0]?.n ?? 0),
    };
  } catch {
    return { newLeads: 0, pendingReviews: 0 };
  }
}

export const PROFESSION_LABEL: Record<string, string> = {
  doctor: "Doctor",
  engineer: "Engineer",
  other_professional: "Other Professional",
  other: "Other",
};

export const METHOD_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp call",
  phone: "Phone call",
  video: "Video call",
  in_person: "In person",
};

export const SERVICE_LABEL: Record<string, string> = {
  "professional-indemnity": "Professional Indemnity",
  "motor-insurance": "Motor Insurance",
  "life-income-protection": "Life & Income Protection",
  "health-insurance": "Health Insurance",
  "children-education": "Children's Education",
  "retirement-plan": "Retirement Plan",
  "house-property": "House & Property",
  "travel-insurance": "Travel Insurance",
  "not-sure": "Not sure yet — wants advice",
  "reviewing-cover": "Reviewing existing cover",
};

/** Status pill styling. Gold = needs him. */
export const STATUS_STYLE: Record<string, string> = {
  new: "bg-gold-500 text-ink-900",
  contacted: "bg-navy-50 text-navy-600",
  confirmed: "bg-navy-600 text-cream-50",
  met: "bg-ink-800 text-cream-50",
  converted: "bg-success text-white",
  not_proceeding: "bg-warm-200 text-warm-700",
};

export const STATUS_LABEL: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  met: "Met",
  converted: "Converted",
  not_proceeding: "Not proceeding",
};

export function parseServices(json: string | null): string[] {
  try {
    const arr = JSON.parse(json ?? "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function serviceNames(json: string | null): string {
  const list = parseServices(json).map((s) => SERVICE_LABEL[s] ?? s);
  return list.length ? list.join(" · ") : "—";
}

export function professionSummary(lead: {
  profession_category: string;
  profession_role: string | null;
  engineering_discipline: string | null;
  profession_other: string | null;
}): string {
  const base = PROFESSION_LABEL[lead.profession_category] ?? lead.profession_category;
  const detail = lead.profession_role || lead.engineering_discipline || lead.profession_other;
  return detail ? `${base} — ${detail}` : base;
}

/** "12 min ago" reads better than a timestamp on a list he scans. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** "Today, 6:30 pm" — how he thinks about an appointment. */
export function appointmentLabel(date: string | null, time: string | null): string {
  if (!date) return "No time given";
  const [y, m, d] = date.split("-").map(Number);
  const when = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((when.getTime() - today.getTime()) / 86400000);

  let day: string;
  if (diff === 0) day = "Today";
  else if (diff === 1) day = "Tomorrow";
  else if (diff === -1) day = "Yesterday";
  else if (diff > 1 && diff < 7)
    day = when.toLocaleDateString("en-GB", { weekday: "long" });
  else day = when.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  if (!time) return day;
  const [hh, mm] = time.split(":").map(Number);
  const period = hh < 12 ? "am" : "pm";
  const hour = hh % 12 === 0 ? 12 : hh % 12;
  return `${day}, ${hour}:${String(mm).padStart(2, "0")} ${period}`;
}
