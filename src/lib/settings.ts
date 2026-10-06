/**
 * Site settings, read from the `settings` table Thushara controls in
 * /admin. Never hard-code these on a page: the MDRT count increments
 * annually and he must be able to change it himself.
 *
 * Values still marked PENDING resolve to null so callers can hide the
 * element entirely rather than render a blank phone number.
 */

import { site, PENDING } from "./site";
import { yearsSince } from "./clock";

export interface SiteSettings {
  /** Derived from `experience_since`, not stored. Grows on 1 January. */
  yearsExperience: number;
  /** Derived from `mdrt_since`, not stored. Grows on 1 January. */
  mdrtYears: number;
  /** His first MDRT year; the count runs from here. */
  mdrtSince: number;
  mdrtStatus: string;
  /** Court of the Table years. 0 hides it rather than printing a zero. */
  cotYears: number;
  /** The years he reached Court of the Table, oldest first. Empty if he has not typed them. */
  cotYearList: number[];
  recognition: string;
  /** null while PENDING — do not render */
  phone: string | null;
  /** A second line he answers. Header shows only the first number;
      the footer, contact page and call blocks show both. */
  phoneSecondary: string | null;
  phoneSecondaryHref: string | null;
  whatsapp: string | null;
  /** WhatsApp on the second line. Shown beside `phoneSecondary`. */
  whatsappSecondary: string | null;
  whatsappSecondaryHref: string | null;
  email: string | null;
  serviceArea: string;
  bookingsPaused: boolean;
  /** Ready-made hrefs, null when the underlying value is pending. */
  phoneHref: string | null;
  whatsappHref: string | null;
  emailHref: string | null;
}

const FALLBACK: SiteSettings = {
  yearsExperience: site.credentials.yearsExperience,
  mdrtYears: site.credentials.mdrtYears,
  mdrtSince: site.credentials.mdrtSince,
  mdrtStatus: site.credentials.mdrtStatus,
  cotYears: site.credentials.cotYears,
  cotYearList: [],
  recognition: site.credentials.recognition,
  phone: null,
  phoneSecondary: null,
  whatsapp: null,
  whatsappSecondary: null,
  email: null,
  serviceArea: site.serviceArea,
  bookingsPaused: false,
  phoneHref: null,
  phoneSecondaryHref: null,
  whatsappHref: null,
  whatsappSecondaryHref: null,
  emailHref: null,
};

export function whatsappHref(number: string | null, message?: string): string | null {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export async function getSiteSettings(db: any): Promise<SiteSettings> {
  if (!db) return FALLBACK;

  let map = new Map<string, string>();
  try {
    const res = await db.prepare(`SELECT key, value FROM settings`).all();
    map = new Map((res.results ?? []).map((r: any) => [r.key, r.value]));
  } catch (err) {
    console.error("[settings] read failed", err);
    return FALLBACK;
  }

  const val = (key: string): string | null => {
    const v = map.get(key);
    return !v || v === PENDING ? null : v;
  };
  const num = (key: string, fallback: number) => Number(map.get(key)) || fallback;

  const phone = val("phone");
  const phone2 = val("phone_secondary");
  const whatsapp = val("whatsapp");
  const whatsapp2 = val("whatsapp_secondary");
  const email = val("email");
  const cotList = [...new Set((val("cot_year_list") ?? "").match(/\d{4}/g)?.map(Number) ?? [])].sort((a, b) => a - b);

  return {
    // Both counts are computed from the year each thing began rather
    // than stored. A stored count is only right until the first New
    // Year nobody remembers it — and these two appear in the hero, the
    // credentials band and the footer of every page, so going stale is
    // visible everywhere at once.
    //
    // `years_experience` and `mdrt_years` are still read if present, as
    // a manual override: MDRT counts qualifications, and if a year were
    // ever missed the derived figure would overstate it. Nothing sets
    // them by default.
    yearsExperience:
      num("years_experience", 0) ||
      yearsSince(num("experience_since", site.credentials.experienceSince)),
    // 6 Oct 2026, Chiran: MDRT grows by one every 1 January, exactly like
    // the years of experience — counted from his first MDRT year, 2013
    // inclusive. (On 4 Oct it was briefly a hand-set number; he reversed
    // that.) Only Court of the Table is entered by hand.
    mdrtYears: yearsSince(num("mdrt_since", site.credentials.mdrtSince), { inclusive: true }),
    mdrtSince: num("mdrt_since", site.credentials.mdrtSince),
    // He types the years themselves ("2020, 2024, 2025, 2026"); the
    // count is how many there are, so the number and the years printed
    // beside it can never disagree. The bare count is the fallback.
    cotYears: cotList.length || Number(map.get("cot_years") ?? FALLBACK.cotYears) || 0,
    cotYearList: cotList,
    mdrtStatus: val("mdrt_status") ?? FALLBACK.mdrtStatus,
    recognition: val("recognition") ?? FALLBACK.recognition,
    phone,
    phoneSecondary: phone2,
    whatsapp,
    whatsappSecondary: whatsapp2,
    email,
    serviceArea: val("service_area") ?? FALLBACK.serviceArea,
    bookingsPaused: map.get("bookings_paused") === "1",
    phoneHref: phone ? `tel:${phone.replace(/\s/g, "")}` : null,
    phoneSecondaryHref: phone2 ? `tel:${phone2.replace(/\s/g, "")}` : null,
    whatsappHref: whatsappHref(whatsapp),
    whatsappSecondaryHref: whatsappHref(whatsapp2),
    emailHref: email ? `mailto:${email}` : null,
  };
}

/**
 * Public pages are server-rendered so admin edits appear without a
 * rebuild, but they are near-static in practice — let Cloudflare hold
 * them at the edge for a few minutes.
 */
export const EDGE_CACHE = "public, max-age=0, s-maxage=300, stale-while-revalidate=600";
