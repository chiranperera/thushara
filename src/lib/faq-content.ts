/**
 * FAQ content.
 *
 * "Questions, including the awkward ones" — answering the
 * uncomfortable ones plainly is the single most trust-building thing
 * this site can do. A FAQ full of soft questions is worse than none.
 *
 * Answers marked PENDING need Thushara's own words or a factual check
 * he has to make. They render as an honest note rather than a guess.
 */

export interface Faq {
  q: string;
  a: string;
  category: string;
  /** true when the copy is real and approved-safe; false = needs him. */
  ready?: boolean;
}

export const faqCategories = [
  "Getting started",
  "About Thushara",
  "Motor",
  "Life & Income Protection",
  "Health",
  "Professional Indemnity",
  "Education & Retirement",
  "Travel",
  "Property",
  "Claims",
  "Premiums & payments",
  "Privacy",
];

export const faqs: Faq[] = [
  // ---------- the awkward ones, answered plainly ----------
  {
    category: "Getting started",
    q: "Are you going to pressure me into buying something?",
    a: "No. The first conversation is twenty to thirty minutes and ends with no decision required. I come back to you in writing with options, and one of those options is always doing nothing if that is genuinely the right answer for where you are.",
    ready: true,
  },
  {
    category: "Getting started",
    q: "How are you paid?",
    a: "PENDING — exact wording to be confirmed with Thushara. The substance: he is paid by the insurer when a policy is issued, not by the client. Being this direct about commission is unusual in this market and is the strongest single trust signal available to him.",
  },
  {
    category: "Getting started",
    q: "What does the first conversation actually involve?",
    a: "I ask about your situation, your family, and your plans. You are not asked to decide anything, bring anything, or prepare anything. If it turns out you do not need cover right now, I will say so.",
    ready: true,
  },
  {
    category: "Getting started",
    q: "Why use an advisor instead of buying online?",
    a: "PENDING — must be honest that online is sometimes cheaper, and make the case on claims support and getting the cover level right rather than on price.",
  },
  {
    category: "Getting started",
    q: "What if I already have cover through my employer?",
    a: "PENDING — must distinguish employer policies from personal cover without overstating the gap.",
  },

  // ---------- about ----------
  {
    category: "About Thushara",
    q: "What is MDRT, and why does it matter?",
    a: "The Million Dollar Round Table is a global association of financial professionals, founded in 1927. Membership is earned annually on production, ethics and professional conduct — it cannot be bought. Fewer than one percent of the world's advisors qualify in any given year.",
    ready: true,
  },
  {
    category: "About Thushara",
    q: "Do you work with people outside Colombo?",
    a: "Yes. I am based in Colombo and travel island-wide for clients. Most first conversations happen by phone or WhatsApp regardless of where you are.",
    ready: true,
  },
  {
    category: "About Thushara",
    q: "Are you tied to Sri Lanka Insurance Corporation?",
    a: "PENDING — must state the relationship accurately. He is a Senior Financial Consultant at SLIC and the policies are SLIC policies.",
  },

  // ---------- claims ----------
  {
    category: "Claims",
    q: "What happens if my claim is rejected?",
    a: "PENDING — must be honest that rejection happens, explain the usual reasons, and set out what he can and cannot do about it. Overpromising here would be the worst possible place to do it.",
  },
  {
    category: "Claims",
    q: "Do you decide whether my claim is paid?",
    a: "No. Claims are assessed and paid by Sri Lanka Insurance Corporation. I am a consultant, not the insurer. What I do is make sure your claim is presented correctly, chase it through the assessment, and keep you informed — which is worth more than most people expect.",
    ready: true,
  },
  {
    category: "Claims",
    q: "What should I do first when something happens?",
    a: "Call me, before filling in any form. I will tell you exactly which documents are needed and in what order, then prepare and submit the paperwork on your behalf.",
    ready: true,
  },

  // ---------- product categories ----------
  { category: "Motor", q: "What's the difference between comprehensive and third-party?", a: "PENDING — explain plainly, without steering toward the more expensive option by default." },
  { category: "Motor", q: "How is my premium calculated?", a: "PENDING." },
  { category: "Motor", q: "What happens to my no-claims bonus if I claim?", a: "PENDING." },

  { category: "Life & Income Protection", q: "How much cover does my family actually need?", a: "PENDING — should point to the calculator rather than give a number here." },
  { category: "Life & Income Protection", q: "What is the difference between a lump sum and income protection?", a: "Income protection pays your family a regular monthly income rather than one lump sum. A lump sum has to be managed and can be spent; an income simply keeps arriving.", ready: true },

  { category: "Health", q: "Are pre-existing conditions covered?", a: "PENDING — must be accurate about waiting periods and exclusions." },
  { category: "Health", q: "Which hospitals can I use?", a: "PENDING." },

  { category: "Professional Indemnity", q: "Do I need this if my employer already has cover?", a: "PENDING — must distinguish institutional cover from personal cover without overstating the gap." },
  { category: "Professional Indemnity", q: "What isn't covered?", a: "PENDING — must set out the main exclusions plainly, including deliberate wrongdoing." },

  { category: "Education & Retirement", q: "What happens if I cannot keep up the payments?", a: "PENDING — must be honest about lapse and surrender." },
  { category: "Education & Retirement", q: "I'm 28. Isn't a retirement plan far too early?", a: "PENDING — should show the arithmetic rather than argue." },

  { category: "Travel", q: "My university asks for proof of cover. Can you provide it?", a: "PENDING." },
  { category: "Travel", q: "How quickly can cover be arranged?", a: "PENDING." },

  { category: "Property", q: "How do I work out the right sum insured?", a: "PENDING." },
  { category: "Property", q: "Am I covered for flood and landslide?", a: "PENDING — must be precise about what is and is not included." },

  { category: "Premiums & payments", q: "How do I pay, and how often?", a: "PENDING." },
  { category: "Premiums & payments", q: "What happens if I miss a payment?", a: "PENDING — must be accurate about grace periods and lapse." },

  {
    category: "Privacy",
    q: "What do you do with my details?",
    a: "They are used to contact you about your enquiry and nothing else. They are never sold or shared with third parties for marketing. You can ask me to delete them at any time.",
    ready: true,
  },
];

export const readyCount = faqs.filter((f) => f.ready).length;
