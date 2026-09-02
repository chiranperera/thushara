/**
 * Site constants — single source of truth.
 *
 * PLACEHOLDERS: values marked PENDING come from the client and are
 * defined in design-brief/12-placeholders-and-asset-manifest.md.
 * They are deliberately obvious so nothing fake ever ships.
 *
 * LIVE VALUES: `years_experience` and `mdrt_years` are overridden at
 * runtime from the `settings` table so Thushara can update them himself
 * each year. The values here are the fallback only.
 */

export const PENDING = "PENDING" as const;

export const site = {
  name: "Thushara Rathnayake",
  title: "Senior Financial Consultant",
  employer: "Sri Lanka Insurance Corporation",
  employerShort: "SLIC",

  /** PENDING — domain not yet registered. See 11, item A4. */
  url: "https://example.com",

  serviceArea: "Island-wide · Colombo & suburbs",
  locale: "en_LK",
  lang: "en",

  /** PENDING — real contact details. See 11, item A5. */
  contact: {
    phone: PENDING,
    phoneDisplay: "+94 XX XXX XXXX",
    whatsapp: PENDING,
    email: PENDING,
  },

  /** Fallbacks. The `settings` table wins at runtime. */
  credentials: {
    yearsExperience: 16,
    mdrtYears: 14,
    mdrtStatus: "Lifetime Member",
    /**
     * Court of the Table — MDRT's second tier, roughly three times the
     * production required for membership. Four years, three of them
     * consecutive and current, which is a stronger signal than the
     * membership count on its own.
     */
    cotYears: 4,
    cotRecent: "2024, 2025, 2026",
    recognition: "Top Performer in Life & General Insurance, Regional",
  },

  qualifications: [
    "National Diploma in Sales Management — SLIM (Sri Lanka Institute of Marketing)",
    "Diploma in Human Resource Management (HRM)",
    "Basic Certificate in Psychology",
  ],
} as const;

/**
 * The Milestone Line — the site's signature concept.
 * Ages 28→58. Every visitor stands somewhere on this line.
 */
export const milestones = [
  { age: 28, milestone: "First car & licence",     services: ["motor-insurance"] },
  { age: 32, milestone: "Qualify & practise",      services: ["professional-indemnity"] },
  { age: 36, milestone: "Marriage & first child",  services: ["life-income-protection", "health-insurance"] },
  { age: 42, milestone: "Children's education",    services: ["children-education"] },
  { age: 50, milestone: "Peak earnings & assets",  services: ["house-property", "life-income-protection"] },
  { age: 58, milestone: "Retire with an income",   services: ["retirement-plan"] },
] as const;

/**
 * Life stages. Design weighting is 60/30/10 — see 02.
 * The homepage selector must not visibly rank them.
 */
export const lifeStages = [
  {
    id: "starting-out",
    label: "Starting out",
    ageRange: "Typically ages 28–34",
    description: "Newly qualified, first vehicle, building a career",
    weight: 60,
  },
  {
    id: "building-family",
    label: "Building a family",
    ageRange: "Typically ages 35–45",
    description: "Marriage, children, a home, school fees",
    weight: 30,
  },
  {
    id: "planning-ahead",
    label: "Planning ahead",
    ageRange: "Typically ages 46 and over",
    description: "Retirement, property, securing what you've built",
    weight: 10,
  },
] as const;

export type LifeStageId = (typeof lifeStages)[number]["id"];

/**
 * The eight services, in default display order.
 * Segment A's products lead, per the 60% weighting.
 * Full copy lives in src/content/services/. Admin edits override it.
 */
export const services = [
  {
    slug: "professional-indemnity",
    title: "Professional Indemnity",
    short: "Protect your licence, your reputation, and the judgement you're paid for.",
    lifeStage: "starting-out",
    icon: "indemnity",
    related: ["motor-insurance", "life-income-protection", "health-insurance"],
  },
  {
    slug: "motor-insurance",
    title: "Motor Insurance",
    short: "Comprehensive cover for your first car, your bike, or your fleet.",
    lifeStage: "starting-out",
    icon: "motor",
    related: ["professional-indemnity", "house-property", "travel-insurance"],
  },
  {
    slug: "life-income-protection",
    title: "Life & Income Protection",
    short: "A monthly income for your family if you can no longer earn it.",
    lifeStage: "building-family",
    icon: "life",
    related: ["health-insurance", "children-education", "retirement-plan"],
  },
  {
    slug: "health-insurance",
    title: "Health Insurance",
    short: "Hospitalisation and medical cover, without finding cash in an emergency.",
    lifeStage: "building-family",
    icon: "health",
    related: ["life-income-protection", "children-education", "travel-insurance"],
  },
  {
    slug: "children-education",
    title: "Children's Education Fund",
    short: "A fund that completes even if you don't.",
    lifeStage: "building-family",
    icon: "education",
    related: ["life-income-protection", "retirement-plan", "health-insurance"],
  },
  {
    slug: "retirement-plan",
    title: "Retirement Plan",
    short: "Independence later, built from decisions you make now.",
    lifeStage: "planning-ahead",
    icon: "pension",
    related: ["life-income-protection", "house-property", "health-insurance"],
  },
  {
    slug: "house-property",
    title: "House & Property",
    short: "Your home, its contents, and what it took to build them.",
    lifeStage: "planning-ahead",
    icon: "house",
    related: ["motor-insurance", "life-income-protection", "retirement-plan"],
  },
  {
    slug: "travel-insurance",
    title: "Travel Insurance",
    short: "Medical cover, cancellations and baggage — including students going overseas.",
    lifeStage: "starting-out",
    icon: "travel",
    related: ["health-insurance", "motor-insurance", "life-income-protection"],
  },
] as const;

export type ServiceSlug = (typeof services)[number]["slug"];

export const getService = (slug: string) => services.find((s) => s.slug === slug);

/** Profession options for booking step 1. Doctors and engineers lead. */
export const professions = {
  doctor: {
    label: "Doctor / Healthcare",
    roles: [
      "Intern / Pre-registration",
      "Medical Officer",
      "Registrar / Senior Registrar",
      "Consultant",
      "Dentist",
      "Other healthcare professional",
    ],
  },
  engineer: {
    label: "Engineer",
    disciplines: [
      "Civil / Structural",
      "Mechanical",
      "Electrical / Electronic",
      "Software / IT",
      "Chemical / Process",
      "Other",
    ],
    roles: [
      "Graduate / Trainee",
      "Engineer",
      "Chartered Engineer",
      "Senior / Lead",
      "Consultant",
    ],
  },
  other_professional: {
    label: "Other Professional",
    roles: [
      "Lawyer",
      "Accountant / Auditor",
      "Architect / Surveyor",
      "Business owner",
      "IT professional",
      "Other",
    ],
  },
  other: { label: "Something else", roles: [] },
} as const;

export type ProfessionCategory = keyof typeof professions;

export const meetingMethods = [
  { id: "whatsapp", label: "WhatsApp call" },
  { id: "phone", label: "Phone call" },
  { id: "video", label: "Video call" },
  { id: "in_person", label: "In person" },
] as const;

export const leadStatuses = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "confirmed", label: "Confirmed" },
  { id: "met", label: "Met" },
  { id: "converted", label: "Converted" },
  { id: "not_proceeding", label: "Not proceeding" },
] as const;

/**
 * Builds a wa.me link with a pre-filled message.
 * Returns null while the number is PENDING so nothing broken ships.
 */
export function whatsappLink(message?: string, number = site.contact.whatsapp) {
  if (!number || number === PENDING) return null;
  const digits = number.replace(/\D/g, "");
  const q = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${q}`;
}

export function telLink(number = site.contact.phone) {
  if (!number || number === PENDING) return null;
  return `tel:${number.replace(/\s/g, "")}`;
}

/** Context-aware WhatsApp message for a service page. */
export function serviceWhatsappMessage(serviceTitle: string) {
  return `Hello Thushara, I'm reading about ${serviceTitle} on your website and would like to know more.`;
}
