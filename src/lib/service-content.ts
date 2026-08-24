/**
 * Structured content for the eight service pages.
 *
 * The client's approved copy (design-brief/content/*.md) is the source
 * of every claim here. It has been restructured, not rewritten: flat
 * bullet lists become lead + supporting sentence, and the regulatory
 * qualifiers ("as per policy terms", "where applicable") are preserved
 * as captions rather than deleted.
 *
 * `terms` marks words to wrap in a plain-English gloss on first use.
 */

export interface Benefit {
  lead: string;
  body: string;
  /** Regulatory qualifier, shown small beneath. Never removed. */
  caption?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ServiceContent {
  slug: string;
  /** Life-stage line above the H1. */
  overline: string;
  title: string;
  /** Serif italic line under the H1, from the client's copy. */
  promise: string;
  intro: string;
  /** "Is this for you?" — first two are highlighted. */
  audiences: string[];
  /** Note explaining a short list, when the approved list is short. */
  audienceNote?: string;
  covers: Benefit[];
  /** The callout under the benefits — the one term worth defining fully. */
  keyTerm?: { term: string; body: string };
  /** Milestone age this product usually lands at. */
  milestoneAge: number;
  milestoneLabel: string;
  before?: { label: string; href: string };
  after?: { label: string; href: string };
  /** "Why work with me", from the copy's own section. */
  whyMe: string[];
  faqs: FaqItem[];
  /** Closing line, from the copy. */
  closing: string;
  /** Comparison table, where the design specifies one. */
  table?: { caption: string; heading: string; columns: string[]; rows: string[] };
}

const CLAIM_STEPS = [
  { n: "01", lead: "Call me first", body: "Before anything else, before any form." },
  { n: "02", lead: "I tell you exactly what's needed", body: "Documents, timelines, who to contact." },
  { n: "03", lead: "I follow it through", body: "I chase it with the insurer so you don't have to." },
  { n: "04", lead: "You're kept informed", body: "You'll always know where it stands." },
];
export { CLAIM_STEPS };

export const serviceContent: Record<string, ServiceContent> = {
  "professional-indemnity": {
    slug: "professional-indemnity",
    overline: "For newly qualified professionals",
    title: "Professional Indemnity Insurance",
    promise: "Protect Your Profession. Secure Your Reputation.",
    intro:
      "In today's professional environment, even a small error, omission, or misjudgment can lead to significant financial loss, legal claims, and reputational damage. Whether you are a consultant, advisor, healthcare professional, engineer, or service provider, your expertise is your most valuable asset—and it deserves strong protection.",
    audiences: [
      "Doctors, consultants and healthcare professionals",
      "Engineers, architects and surveyors",
      "Lawyers, accountants and auditors",
      "IT professionals and software developers",
      "Any professional providing expert advice or services",
    ],
    audienceNote:
      "Order is fixed by the copy spec: doctors first, engineers second. Five audiences is the approved list.",
    covers: [
      { lead: "Legal defence costs and court expenses", body: "The cost of defending a claim is often larger than the claim itself. This covers the lawyers, not just the settlement." },
      { lead: "Claims of professional negligence", body: "If a client alleges your work fell below the expected standard, the policy responds — whether or not the allegation is upheld." },
      { lead: "Compensation for third-party losses", body: "Financial support where a client suffers a loss because of your professional work.", caption: "As per policy terms." },
      { lead: "Errors, omissions and advice risk", body: "Covers what you got wrong, and equally what you left out — including misrepresentation." },
      { lead: "Your reputation and your practice", body: "Peace of mind while you focus on the work, backed by Sri Lanka's leading state-owned insurer." },
      { lead: "Optional policy extensions", body: "Tailored to your profession and risk exposure, rather than one shape for everyone.", caption: "Based on your profession and risk exposure." },
    ],
    keyTerm: {
      term: "Indemnity",
      body: "means the insurer restores you to the financial position you were in before the claim — it does not pay a bonus, and it does not cover deliberate wrongdoing.",
    },
    milestoneAge: 32,
    milestoneLabel: "Qualify & practise",
    before: { label: "Motor Insurance", href: "/services/motor-insurance" },
    after: { label: "Life & Income Protection at 36", href: "/services/life-income-protection" },
    whyMe: [
      "Expert guidance to choose the right indemnity coverage for your profession.",
      "Customized insurance solutions based on your risk profile.",
      "Clear explanation of policy terms, exclusions, and claim procedures.",
      "Ongoing support with policy management and renewals.",
      "Dedicated assistance during claims and professional risk situations.",
    ],
    faqs: [
      { q: "Do I need this if my employer already has cover?", a: "Copy pending. Answer must distinguish employer policies from personal cover and avoid absolute claims." },
      { q: "What isn't covered?", a: "Copy pending. Must set out the main exclusions plainly, including deliberate wrongdoing." },
      { q: "How quickly can cover start?", a: "Copy pending." },
      { q: "What happens if I change profession?", a: "Copy pending." },
    ],
    closing: "Don't let a professional claim put your career and financial future at risk.",
    table: {
      caption: "Indicative guidance",
      heading: "What cover level do people at your stage take?",
      columns: ["Newly qualified", "Established", "Own practice"],
      rows: ["Doctors & healthcare", "Engineers & architects", "Lawyers, accountants, IT"],
    },
  },

  "motor-insurance": {
    slug: "motor-insurance",
    overline: "For your first vehicle",
    title: "Motor Insurance",
    promise: "Protect Your Journey with Sri Lanka Insurance Motor Insurance",
    intro:
      "Your vehicle is one of your most valuable assets. At Sri Lanka Insurance Corporation, we provide comprehensive motor insurance solutions designed to protect you, your vehicle, and your financial security. I will help you choose the most suitable plan based on your needs and budget, with professional support throughout the policy period.",
    audiences: [
      "First-time car and motorcycle owners",
      "Private vehicle owners renewing cover",
      "Commercial and fleet vehicle owners",
      "Anyone looking for better protection than they have now",
    ],
    covers: [
      { lead: "Accidental damage", body: "Repair or replacement after a collision, using approved workshops." },
      { lead: "Theft, fire and attempted theft", body: "Cover if the vehicle is stolen or damaged by fire." },
      { lead: "Third-party liability", body: "Injury or property damage you cause to others — the legal minimum in Sri Lanka, included as standard." },
      { lead: "Natural disaster cover", body: "Flood, landslide and storm damage, which in Sri Lanka is a real risk rather than an abstract one.", caption: "Subject to policy terms and conditions." },
      { lead: "Windscreen damage", body: "Glass repair or replacement.", caption: "Where included in the selected policy." },
      { lead: "Personal accident benefit", body: "For the driver and passengers.", caption: "Subject to the selected policy." },
      { lead: "Island-wide approved garages", body: "A network of authorised garages and service providers, wherever you break down." },
      { lead: "24/7 support and roadside assistance", body: "Someone to call at the roadside, not just an office number.", caption: "Where applicable under your policy." },
    ],
    keyTerm: {
      term: "Third-party liability",
      body: "covers damage or injury you cause to other people and their property. It is the legal minimum for a vehicle in Sri Lanka — comprehensive cover adds damage to your own vehicle on top.",
    },
    milestoneAge: 28,
    milestoneLabel: "First car & licence",
    after: { label: "Professional Indemnity at 32", href: "/services/professional-indemnity" },
    whyMe: [
      "Professional advice before you buy, not after.",
      "Help choosing the cover that actually fits how you drive.",
      "Prompt support during the claims process.",
      "Annual renewal reminders, so cover never lapses by accident.",
      "Continuous after-sales service and personalised assistance.",
    ],
    faqs: [
      { q: "What's the difference between comprehensive and third-party?", a: "Copy pending. Must explain plainly without steering the reader toward the more expensive option by default." },
      { q: "How is my premium worked out?", a: "Copy pending." },
      { q: "What happens to my no-claims bonus if I claim?", a: "Copy pending." },
      { q: "Can I insure a vehicle I've just bought?", a: "Copy pending." },
    ],
    closing: "Whether you are buying a new vehicle, renewing, or looking for better protection, I am here to help.",
  },

  "life-income-protection": {
    slug: "life-income-protection",
    overline: "For building a family",
    title: "Life Insurance — Income Protection",
    promise: "Protect Your Family's Income. Secure Their Future.",
    intro:
      "Life is full of opportunities, but it also comes with uncertainties. The greatest gift you can give your loved ones is financial security, even if life takes an unexpected turn. I help individuals and families choose life insurance that provides long-term protection and peace of mind.",
    audiences: [
      "Salaried employees",
      "Parents with young children",
      "Business owners",
      "Self-employed professionals",
      "Anyone whose family depends on their monthly income",
    ],
    covers: [
      { lead: "A monthly income, not a single cheque", body: "Income Protection pays your family a regular income if you are no longer there to earn it, so their standard of living does not change overnight." },
      { lead: "Monthly household expenses", body: "The ordinary running of a home continues, uninterrupted." },
      { lead: "Children's education costs", body: "School and university fees keep being paid." },
      { lead: "Loan and mortgage repayments", body: "The house does not become a second problem on top of the first." },
      { lead: "Flexible protection plans", body: "Cover levels and premium options set around your situation, not a template." },
      { lead: "Long-term financial stability", body: "Backed by Sri Lanka Insurance Corporation." },
    ],
    keyTerm: {
      term: "Income protection",
      body: "pays your family a regular monthly income rather than one lump sum. A lump sum has to be managed and can be spent; an income simply keeps arriving.",
    },
    milestoneAge: 36,
    milestoneLabel: "Marriage & first child",
    before: { label: "Professional Indemnity", href: "/services/professional-indemnity" },
    after: { label: "Children's Education at 42", href: "/services/children-education" },
    whyMe: [
      "Understand your financial protection needs.",
      "Select the most suitable life insurance plan.",
      "Review your coverage as your life changes.",
      "Continuous support before and after your policy is issued.",
    ],
    faqs: [
      { q: "How much cover does my family actually need?", a: "Copy pending. Should point to the calculator rather than give a number here." },
      { q: "What's the difference between this and a lump sum policy?", a: "Copy pending." },
      { q: "What happens if my circumstances change?", a: "Copy pending." },
    ],
    closing: "Your income is your family's foundation. Protect it today so your loved ones can continue their lives with confidence tomorrow.",
  },

  "health-insurance": {
    slug: "health-insurance",
    overline: "For your family's wellbeing",
    title: "Health Insurance",
    promise: "Protect Your Health. Protect Your Future.",
    intro:
      "Good health is one of your greatest assets, but unexpected medical emergencies can place a significant financial burden on you and your family. With Sri Lanka Insurance Corporation Health Insurance you can face life's uncertainties knowing you have reliable financial protection when you need it most.",
    audiences: [
      "Families with children",
      "Working professionals",
      "Individuals seeking financial protection",
      "Business owners",
      "Senior citizens",
      "Anyone wanting peace of mind against unexpected medical expenses",
    ],
    covers: [
      { lead: "Cashless treatment at network hospitals", body: "The hospital bills the insurer directly, so you are not finding cash during an emergency. In practice this is the benefit that matters most.", caption: "Where applicable under the chosen policy." },
      { lead: "Hospitalisation cover", body: "The cost of being admitted, not just of being seen." },
      { lead: "Surgical and medical expense benefits", body: "Procedures and the care around them." },
      { lead: "Flexible plan options", body: "Cover levels to suit a family's needs and budget." },
      { lead: "Optional additional benefits and riders", body: "Extras where your situation calls for them.", caption: "Depending on the selected policy." },
      { lead: "Fast and reliable claims support", body: "With me handling the paperwork side." },
    ],
    keyTerm: {
      term: "Cashless treatment",
      body: "means the hospital settles directly with the insurer. You are not arranging money at the worst possible moment — which is the whole point of having cover.",
    },
    milestoneAge: 36,
    milestoneLabel: "Marriage & first child",
    before: { label: "Life & Income Protection", href: "/services/life-income-protection" },
    after: { label: "Children's Education at 42", href: "/services/children-education" },
    whyMe: [
      "Professional advice tailored to your needs.",
      "Personalized health insurance solutions.",
      "Ongoing policy servicing and claims guidance.",
      "Trusted support before and after your policy purchase.",
    ],
    faqs: [
      { q: "Are pre-existing conditions covered?", a: "Copy pending. Must be accurate about waiting periods and exclusions." },
      { q: "Which hospitals can I use?", a: "Copy pending." },
      { q: "Can I add my parents or children?", a: "Copy pending." },
    ],
    closing: "Your health is priceless. Don't let unexpected medical expenses affect your financial future.",
  },

  "children-education": {
    slug: "children-education",
    overline: "For your children's future",
    title: "Children's Education Fund",
    promise: "Secure Your Child's Future Today",
    intro:
      "Every parent dreams of providing the best education for their child. With the rising cost of education, planning early is the smartest way to ensure your child has every opportunity. This plan builds a dedicated fund for their educational journey — from primary school to university.",
    audiences: [
      "Parents of newborns and young children",
      "Families planning ahead for school or university expenses",
      "Anyone wanting to create a secure financial future for a child",
    ],
    covers: [
      { lead: "The fund completes even if you don't", body: "Life insurance protection for the parent is built in. If you are no longer there, the plan continues and the fund still reaches your child. This is what separates it from a savings account." },
      { lead: "Guaranteed long-term savings", body: "A disciplined, dedicated fund rather than money that gets used for something else." },
      { lead: "Protection against rising education costs", body: "Planning early is what makes the numbers work." },
      { lead: "Maturity benefit for higher education", body: "Paid when the fees actually arrive." },
      { lead: "Flexible premium payment options", body: "Set around what you can commit to now." },
      { lead: "Optional additional protection", body: "Through available riders." },
    ],
    keyTerm: {
      term: "Maturity benefit",
      body: "is what the plan pays out at the end of its term — timed, in this case, to arrive when university fees do.",
    },
    milestoneAge: 42,
    milestoneLabel: "Children's education",
    before: { label: "Life & Income Protection", href: "/services/life-income-protection" },
    after: { label: "Retirement Plan at 58", href: "/services/retirement-plan" },
    whyMe: [
      "A plan sized to what university will actually cost, not a round number.",
      "Clear explanation of what is guaranteed and what is not.",
      "Reviews as your child gets closer to needing it.",
      "Support throughout the life of the plan.",
    ],
    faqs: [
      { q: "What happens if I can't keep up the payments?", a: "Copy pending. Must be honest about lapse and surrender." },
      { q: "Can I use the money for something other than education?", a: "Copy pending." },
      { q: "When should I start?", a: "Copy pending." },
    ],
    closing: "The best gift you can give your child is the opportunity to learn without financial worries.",
  },

  "retirement-plan": {
    slug: "retirement-plan",
    overline: "For planning ahead — and for starting early",
    title: "Retirement Plan",
    promise: "Plan Today for a Comfortable Tomorrow",
    intro:
      "Retirement is one of life's most important milestones, and the lifestyle you enjoy afterwards depends on the decisions you make today. This plan builds a retirement fund while providing financial protection throughout your working years.",
    audiences: [
      "Young professionals starting their careers",
      "Employees planning for a financially secure retirement",
      "Self-employed individuals",
      "Business owners",
      "Anyone who wants a comfortable and independent retirement",
    ],
    audienceNote:
      "Young professionals are first in the client's own copy. Starting at 28 rather than 48 is the single biggest lever on the outcome.",
    covers: [
      { lead: "Reduce financial dependence on family", body: "Independence in later life is what this actually buys. For most people it matters more than the number itself." },
      { lead: "Systematic long-term wealth accumulation", body: "Built steadily, over years, rather than gathered late." },
      { lead: "Guaranteed maturity benefits", body: "Based on the selected plan." },
      { lead: "Life insurance protection during the term", body: "The plan protects you while it builds." },
      { lead: "Protection against inflation", body: "Rising living costs quietly reduce what a fixed sum will buy." },
      { lead: "Flexible premium payment options", body: "Personalised to your financial goals." },
    ],
    keyTerm: {
      term: "Inflation",
      body: "is the steady rise in prices over time. It is why a figure that sounds comfortable today may not be in thirty years, and why starting early matters more than starting big.",
    },
    milestoneAge: 58,
    milestoneLabel: "Retire with an income",
    before: { label: "House & Property", href: "/services/house-property" },
    whyMe: [
      "Personalised retirement planning around your goals.",
      "A clear view of what starting now versus later actually produces.",
      "Reviews as your income changes.",
      "Support through the whole term, not just at the start.",
    ],
    faqs: [
      { q: "I'm 28 — isn't this far too early?", a: "Copy pending. Should show the arithmetic rather than argue." },
      { q: "What if I need the money before retirement?", a: "Copy pending." },
      { q: "How does this sit alongside EPF and ETF?", a: "Copy pending." },
    ],
    closing: "The earlier you start, the more time your savings have to grow.",
  },

  "house-property": {
    slug: "house-property",
    overline: "For protecting what you've built",
    title: "House & Property Insurance",
    promise: "Protect Your Home. Secure Your Future.",
    intro:
      "Your home and property are among your most valuable assets — built through years of hard work. Unexpected events such as fire, natural disasters, theft, or accidental damage can cause significant financial loss and emotional stress.",
    audiences: [
      "Homeowners protecting their primary residence",
      "Families safeguarding their valuable assets",
      "Landlords renting out residential or commercial property",
      "Apartment and condominium owners",
      "Property investors and developers",
    ],
    covers: [
      { lead: "Natural disaster damage", body: "Flood and landslide are a lived, recent concern in Sri Lanka rather than an abstract risk. Cover here is not a formality." },
      { lead: "Buildings cover", body: "The structure itself and its permanent fixtures." },
      { lead: "Contents cover", body: "Household contents and personal belongings — the part people most often under-insure." },
      { lead: "Fire, lightning and theft", body: "Including burglary and malicious damage." },
      { lead: "Alternative accommodation or rent loss", body: "Somewhere to live, or income replaced, while the property is repaired.", caption: "Optional cover." },
      { lead: "Emergency support and claims assistance", body: "Someone to call when it happens.", caption: "As per policy terms." },
    ],
    keyTerm: {
      term: "Buildings and contents",
      body: "are two separate things. Buildings is the structure; contents is everything you would take with you if you moved. Most under-insurance happens because someone covered one and not the other.",
    },
    milestoneAge: 50,
    milestoneLabel: "Peak earnings & assets",
    before: { label: "Life & Income Protection", href: "/services/life-income-protection" },
    after: { label: "Retirement Plan at 58", href: "/services/retirement-plan" },
    whyMe: [
      "Expert guidance to select the right property insurance plan.",
      "Customized solutions based on your property type and value.",
      "Clear explanation of coverage, exclusions, and benefits.",
      "Support with policy servicing and claims assistance.",
      "Reliable advice to ensure long-term protection of your assets.",
    ],
    faqs: [
      { q: "How do I work out the right sum insured?", a: "Copy pending." },
      { q: "Am I covered for flood and landslide?", a: "Copy pending. Must be precise about what is and isn't included." },
      { q: "Does this cover a property I rent out?", a: "Copy pending." },
    ],
    closing: "Don't wait for unexpected events to put your home and finances at risk.",
  },

  "travel-insurance": {
    slug: "travel-insurance",
    overline: "For travelling with confidence",
    title: "Travel Insurance",
    promise: "Protect Your Journey. Travel with Confidence.",
    intro:
      "Travelling opens the door to new experiences — but medical emergencies, cancellations, lost baggage or delays can quickly turn a trip into a stressful and expensive one. Cover is often required for a visa, and can usually be arranged the same day.",
    audiences: [
      "Students studying overseas",
      "Families going on overseas trips",
      "Frequent international travellers",
      "Business professionals travelling abroad",
      "Holidaymakers and vacation travellers",
    ],
    audienceNote:
      "Students are first here. Universities and visa applications frequently require proof of cover, and the buyer is usually the parent.",
    covers: [
      { lead: "Overseas medical and hospitalisation", body: "Treatment abroad, where costs can be many times what they are at home." },
      { lead: "Trip cancellation and curtailment", body: "If the trip is called off, or cut short once you are there." },
      { lead: "Baggage loss, delay or damage", body: "Compensation for what does not arrive with you." },
      { lead: "Travel delay and missed connection", body: "For the onward flight you did not make." },
      { lead: "Personal accident protection", body: "During the journey itself." },
      { lead: "24/7 emergency assistance", body: "Someone reachable in a different time zone.", caption: "As per policy terms." },
    ],
    keyTerm: {
      term: "Curtailment",
      body: "means cutting a trip short and coming home early — usually because of illness or a family emergency. It is a separate thing from cancelling before you leave.",
    },
    milestoneAge: 28,
    milestoneLabel: "First car & licence",
    after: { label: "Professional Indemnity at 32", href: "/services/professional-indemnity" },
    whyMe: [
      "Expert guidance to choose the right plan for your destination and purpose.",
      "Clear explanation of what is and is not covered.",
      "Support with policy servicing and claims assistance.",
      "Reliable advice before, during, and after your journey.",
    ],
    faqs: [
      { q: "My university asks for proof of cover — can you provide it?", a: "Copy pending." },
      { q: "How quickly can cover be arranged?", a: "Copy pending." },
      { q: "Does it cover pre-existing medical conditions?", a: "Copy pending. Must be accurate." },
    ],
    closing: "Don't let unexpected disruptions affect your journey or your finances.",
  },
};
