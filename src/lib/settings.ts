/**
 * Site settings, read from the `settings` table Thushara controls in
 * /admin. Never hard-code these on a page: the MDRT count increments
 * annually and he must be able to change it himself.
 *
 * Values still marked PENDING resolve to null so callers can hide the
 * element entirely rather than render a blank phone number.
 */

import { site, PENDING } from "./site";

export interface SiteSettings {
  yearsExperience: number;
  mdrtYears: number;
  mdrtStatus: string;
  /** Court of the Table years. 0 hides it rather than printing a zero. */
  cotYears: number;
  recognition: string;
  /** null while PENDING — do not render */
  phone: string | null;
  whatsapp: string | null;
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
  mdrtStatus: site.credentials.mdrtStatus,
  cotYears: site.credentials.cotYears,
  recognition: site.credentials.recognition,
  phone: null,
  whatsapp: null,
  email: null,
  serviceArea: site.serviceArea,
  bookingsPaused: false,
  phoneHref: null,
  whatsappHref: null,
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
  const whatsapp = val("whatsapp");
  const email = val("email");

  return {
    yearsExperience: num("years_experience", FALLBACK.yearsExperience),
    mdrtYears: num("mdrt_years", FALLBACK.mdrtYears),
    cotYears: Number(map.get("cot_years") ?? FALLBACK.cotYears) || 0,
    mdrtStatus: val("mdrt_status") ?? FALLBACK.mdrtStatus,
    recognition: val("recognition") ?? FALLBACK.recognition,
    phone,
    whatsapp,
    email,
    serviceArea: val("service_area") ?? FALLBACK.serviceArea,
    bookingsPaused: map.get("bookings_paused") === "1",
    phoneHref: phone ? `tel:${phone.replace(/\s/g, "")}` : null,
    whatsappHref: whatsappHref(whatsapp),
    emailHref: email ? `mailto:${email}` : null,
  };
}

/**
 * Public pages are server-rendered so admin edits appear without a
 * rebuild, but they are near-static in practice — let Cloudflare hold
 * them at the edge for a few minutes.
 */
export const EDGE_CACHE = "public, max-age=0, s-maxage=300, stale-while-revalidate=600";
