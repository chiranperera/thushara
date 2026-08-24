/**
 * Persona landing pages — /for/doctors and /for/engineers.
 *
 * The highest-leverage pages for the 60% segment. These are what
 * Thushara sends when a colleague refers someone, so the whole job is
 * to make a newly qualified professional feel the page was written for
 * them specifically.
 *
 * Tone rule, from the design: factual and calm, never fear-based.
 * Doctors and engineers detect exaggeration instantly and disengage.
 * No figures until Thushara supplies verifiable ones.
 */

export interface CareerStage {
  ages: string;
  role: string;
  products: string;
  /** The stage most people arrive at — carries the gold rule and pill. */
  primary?: boolean;
}

export interface AnchorPoint {
  lead: string;
  body: string;
}

export interface PracticalPoint {
  lead: string;
  body: string;
}

export interface Persona {
  slug: string;
  /** Pill text in the hero. */
  eyebrow: string;
  title: string;
  intro: string;
  /** Pre-selects this profession in the booking form, skipping step 1. */
  bookingProfession: string;
  imageSlot: { id: string; note: string };
  careerLineLabel: string;
  careerLineHeading: string;
  stages: CareerStage[];
  anchorHeading: string;
  anchor: AnchorPoint[];
  practicalLabel: string;
  practicalHeading: string;
  practical: PracticalPoint[];
  /** Service slugs shown as dark cards, with a one-line reason. */
  products: { slug: string; note: string }[];
  testimonialsHeading: string;
  faqHeading: string;
  faqs: { q: string; a: string }[];
  ctaHeading: string;
  ctaBody: string;
}

export const personas: Record<string, Persona> = {
  doctors: {
    slug: "doctors",
    eyebrow: "For Sri Lanka's doctors",
    title: "You spent nine years qualifying. Let's protect it.",
    intro:
      "Indemnity cover, your first vehicle, and a financial plan that grows with your practice — explained in plain language, by someone who has done this with hundreds of doctors.",
    bookingProfession: "doctor",
    imageSlot: {
      id: "IMG-DOCTORS-01",
      note: "A healthcare professional in a real Sri Lankan clinical setting. Must be authentic and locally shot — never stock. A visitor should recognise the room.",
    },
    careerLineLabel: "The medical career line",
    careerLineHeading: "What doctors typically need, and when.",
    stages: [
      { ages: "26–28", role: "Internship", products: "First vehicle → Motor" },
      { ages: "28–32", role: "Medical Officer", products: "Professional Indemnity · Motor · Health", primary: true },
      { ages: "32–38", role: "Registrar, private practice begins", products: "Indemnity at higher cover · Life & Income Protection" },
      { ages: "38–48", role: "Consultant", products: "Life · Children's Education · House & Property" },
      { ages: "48+", role: "Senior consultant", products: "Retirement · Property" },
    ],
    anchorHeading: "Why indemnity matters for you",
    anchor: [
      {
        lead: "What a claim actually looks like",
        body: "Usually a letter, not a courtroom. A patient or their family alleges that treatment fell below the expected standard. Most matters are resolved long before any hearing — but the response has to be organised, documented and legally advised from the first week.",
      },
      {
        lead: "What the cover does",
        body: "It pays for the defence, and it pays compensation if the claim succeeds. The defence costs are the part people underestimate: they arrive whether or not the allegation is upheld.",
      },
      {
        lead: "What being without it costs",
        body: "Personal exposure to both. For a doctor two or three years out of internship, that is the entire financial position built so far.",
      },
    ],
    practicalLabel: "The practical part",
    practicalHeading: "I understand your hours.",
    practical: [
      { lead: "Evenings and weekends", body: "Appointments after 7pm and on Sundays are normal, not a favour." },
      { lead: "WhatsApp first", body: "Questions answered in writing, when you have five minutes between patients." },
      { lead: "Paperwork handled", body: "Forms prepared and brought to you. You sign; I file." },
      { lead: "No daytime calls", body: "Unless you ask for one. I will never ring during a clinic." },
    ],
    products: [
      { slug: "professional-indemnity", note: "Start here." },
      { slug: "motor-insurance", note: "Usually the first policy." },
      { slug: "life-income-protection", note: "When someone depends on yours." },
      { slug: "health-insurance", note: "Cover as a patient, not a doctor." },
    ],
    testimonialsHeading: "From doctors",
    faqHeading: "Questions doctors ask",
    faqs: [
      { q: "Does the hospital's cover protect me personally?", a: "Copy pending. Must distinguish institutional cover from personal cover without overstating the gap." },
      { q: "I'm still an intern. Is it too early?", a: "Copy pending." },
      { q: "What happens when I start private practice?", a: "Copy pending." },
      { q: "Can we do all of this over WhatsApp?", a: "Copy pending." },
    ],
    ctaHeading: "Half an hour, and you'll know where you stand.",
    ctaBody: "Free, no obligation, and scheduled around your clinic.",
  },

  engineers: {
    slug: "engineers",
    eyebrow: "For Sri Lanka's engineers",
    title: "You sign off on the work. Make sure you're covered for it.",
    intro:
      "Professional indemnity, motor cover, and a long-term plan — set out clearly, with the numbers shown.",
    bookingProfession: "engineer",
    imageSlot: {
      id: "IMG-ENGINEERS-01",
      note: "On site or with drawings, in a real Sri Lankan setting. Locally shot, never stock.",
    },
    careerLineLabel: "The engineering career line",
    careerLineHeading: "What engineers typically need, and when.",
    stages: [
      { ages: "24–28", role: "Graduate Engineer", products: "First vehicle → Motor" },
      { ages: "28–34", role: "Engineer / Chartered", products: "Professional Indemnity · Motor · Health", primary: true },
      { ages: "34–42", role: "Senior / Lead", products: "Life & Income Protection · Children's Education Fund" },
      { ages: "42+", role: "Consultant / Practice owner", products: "House & Property · Retirement · Business cover" },
    ],
    anchorHeading: "Why indemnity matters for you",
    anchor: [
      {
        lead: "Your signature carries the exposure",
        body: "A structural engineer signing drawings, a certifying engineer signing off completion — the liability attaches to the person who signed, and it can surface years after the project closed.",
      },
      {
        lead: "Design and certification claims are slow",
        body: "Defects emerge late. Cover needs to be in force when the claim is made, which is why lapses between projects matter more than people expect.",
      },
      {
        lead: "What the cover does",
        body: "It pays the legal defence and any compensation awarded. The defence costs arrive whether or not the allegation is upheld — that is the part most people underestimate.",
      },
    ],
    practicalLabel: "The practical part",
    practicalHeading: "Numbers, not sales talk.",
    practical: [
      { lead: "The working shown", body: "Comparison tables and figures, so you can check the reasoning rather than take my word for it." },
      { lead: "Starting early is the whole argument", body: "The retirement comparison at 28 versus 38 versus 48 makes the case on its own. No persuasion required." },
      { lead: "WhatsApp first", body: "Questions answered in writing, on site or after hours." },
      { lead: "Evenings and weekends", body: "Appointments outside working hours are normal, not a favour." },
    ],
    products: [
      { slug: "professional-indemnity", note: "Start here." },
      { slug: "motor-insurance", note: "Usually the first policy." },
      { slug: "life-income-protection", note: "When someone depends on yours." },
      { slug: "retirement-plan", note: "Where starting early shows most." },
    ],
    testimonialsHeading: "From engineers",
    faqHeading: "Questions engineers ask",
    faqs: [
      { q: "My employer carries cover for the practice. Do I need my own?", a: "Copy pending. Must distinguish practice cover from personal cover without overstating the gap." },
      { q: "I'm not chartered yet. Is it too early?", a: "Copy pending." },
      { q: "Does cover follow me if I change firms?", a: "Copy pending." },
      { q: "What about work I signed off years ago?", a: "Copy pending. Must be accurate about claims-made versus occurrence cover." },
    ],
    ctaHeading: "Half an hour, and you'll know where you stand.",
    ctaBody: "Free, no obligation, and scheduled around your site hours.",
  },
};

export const personaSlugs = Object.keys(personas);
