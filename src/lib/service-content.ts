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

/**
 * One entry from the copy's "Who Should Have…" list. The label is his;
 * the note says why that group in particular, which the flat list left
 * to the reader.
 */
export interface Audience {
  label: string;
  note: string;
  caption?: string;
}

export interface ServiceContent {
  slug: string;
  /** Life-stage line above the H1. */
  overline: string;
  /**
   * Hero photograph, 4:5, filling the right-hand panel. Until one
   * exists the hero stays single-column with the icon watermark — an
   * empty panel would look worse than no panel.
   */
  heroImage?: { src: string; alt: string };
  title: string;
  /** Serif italic line under the H1, from the client's copy. */
  promise: string;
  intro: string;
  /** "Is this for you?" — first two are highlighted. */
  audiences: Audience[];
  covers: Benefit[];
  /**
   * The copy's own second argument section — "Why Choose Sri Lanka
   * Insurance…", or on the savings products "Why Start Early" and "Why
   * Choose a Retirement Plan". The heading differs per document and is
   * kept, because the question each one answers is genuinely different.
   */
  why: { heading: string; standfirst: string; items: Benefit[] };
  /** The callout under the benefits — the one term worth defining fully. */
  keyTerm?: { term: string; body: string };
  /** Milestone age this product usually lands at. */
  milestoneAge: number;
  milestoneLabel: string;
  before?: { label: string; href: string };
  after?: { label: string; href: string };
  /**
   * His own framing line above the "Why work with me" list. `{years}`
   * is substituted from settings so the count is never stale.
   */
  whyMeIntro: string;
  /** "Why work with me", from the copy's own section. */
  whyMe: string[];
  faqs: FaqItem[];
  /** Closing line, from the copy. */
  closing: string;
  /** Second half of the closing, where the copy carries one. */
  closingBody?: string;
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
      { label: "Doctors, consultants and healthcare professionals", note: "A complaint can arrive years after the consultation it refers to, long after you have stopped thinking about it." },
      { label: "Engineers, architects and surveyors", note: "You sign off on work that other people then build on, live in and rely on." },
      { label: "Lawyers, accountants and auditors", note: "Advice is the product, so a mistake in the advice is the claim." },
      { label: "IT professionals and software developers", note: "A system that fails in production becomes your client's financial loss, not just a bug." },
      { label: "Any professional providing expert advice or services", note: "If people pay for your judgement, your judgement is what gets challenged." },
    ],
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
    whyMeIntro:
      "With over {years} years in financial consulting and insurance, and a working knowledge of how claims against professionals actually unfold, here is what you get from me:",
    whyMe: [
      "Expert guidance to choose the right indemnity coverage for your profession.",
      "Customized insurance solutions based on your risk profile.",
      "Clear explanation of policy terms, exclusions, and claim procedures.",
      "Ongoing support with policy management and renewals.",
      "Dedicated assistance during claims and professional risk situations.",
    ],
    why: {
      heading: "Why Sri Lanka Insurance for this cover",
      standfirst: "Indemnity is only worth what the insurer behind it is worth on the day you claim.",
      items: [
        { lead: "Written around your profession", body: "A surgeon, a structural engineer and a software consultant do not face the same claims. The policy is shaped to the risk you actually carry." },
        { lead: "Legal costs and compensation, together", body: "Defending an allegation is expensive whether or not it is upheld. Both sides of that are covered." },
        { lead: "Backed by the state-owned insurer", body: "Sri Lanka Insurance Corporation is the country's leading state-owned insurer. For a policy you may not call on for a decade, that matters." },
        { lead: "Extensions where your work needs them", body: "Optional cover added for the specific exposures of your field rather than sold as a single shape." },
      ],
    },
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
      { label: "First-time car and motorcycle owners", note: "The first policy is the one most often bought on price alone, and the one most often found wanting." },
      { label: "Private vehicle owners renewing cover", note: "Renewal is the moment to check the cover still matches what you drive and how you drive it." },
      { label: "Commercial and fleet vehicle owners", note: "A vehicle that earns its keep needs cover that accounts for the earning, not just the vehicle." },
      { label: "Motorcycle riders", note: "Cover is written differently for two wheels, and the personal accident benefit matters more." },
      { label: "Anyone looking for better protection than they have now", note: "Most people discover what their policy excludes at the one moment they cannot afford to." },
    ],
    covers: [
      { lead: "Optional additional covers", body: "Extras added where your individual requirements call for them, rather than a fixed bundle." },
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
    whyMeIntro:
      "When you arrange your motor insurance through me, this is what you can expect — before the policy, and on the day you need it:",
    whyMe: [
      "Professional advice before you buy, not after.",
      "Help choosing the cover that actually fits how you drive.",
      "Prompt support during the claims process.",
      "Annual renewal reminders, so cover never lapses by accident.",
      "Continuous after-sales service and personalised assistance.",
    ],
    why: {
      heading: "Why Sri Lanka Insurance for your vehicle",
      standfirst: "Motor cover is judged on the day something goes wrong, which is usually the day you are least able to argue about it.",
      items: [
        { lead: "Island-wide approved garages", body: "A network of authorised garages and service providers, so wherever the car stops there is somewhere proper to take it." },
        { lead: "Fast, reliable claim assistance", body: "The claim is the product. Everything before it is paperwork." },
        { lead: "Repairs through approved workshops", body: "Quality repair work rather than the cheapest available quote." },
        { lead: "Competitive premiums, flexible payment", body: "Payment options that fit how you are actually paid, and a renewal reminder so cover never lapses by accident." },
      ],
    },
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
      { label: "Salaried employees", note: "Your salary is what the household runs on. This insures the earning, not the earner's possessions." },
      { label: "Parents with young children", note: "The years when someone depends on you completely are the years to be certain you are covered." },
      { label: "Business owners", note: "A business rarely survives the loss of the person running it unless that was planned for in advance." },
      { label: "Self-employed professionals", note: "There is no employer scheme sitting behind you, so the cover has to be your own." },
      { label: "Anyone whose family depends on their monthly income", note: "If your income stopping would change how your family lives, this is the cover that answers it." },
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
    whyMeIntro:
      "A life policy is one of the most consequential financial decisions you will make. My commitment is to help you:",
    whyMe: [
      "Understand your financial protection needs.",
      "Select the most suitable life insurance plan.",
      "Review your coverage as your life changes.",
      "Continuous support before and after your policy is issued.",
    ],
    why: {
      heading: "Why Sri Lanka Insurance for life cover",
      standfirst: "A life policy is a promise to be kept decades from now. The institution making it is most of what you are buying.",
      items: [
        { lead: "Financial security for your family", body: "Not a lump sum they must learn to manage during the worst year of their lives, but an income that keeps arriving." },
        { lead: "Flexible protection plans", body: "Cover levels set around your situation and revised as it changes, rather than fixed at the day you signed." },
        { lead: "Affordable premium options", body: "The right cover you can sustain beats the ideal cover you cancel in three years." },
        { lead: "Long-term stability", body: "Backed by Sri Lanka Insurance Corporation, which is the point of a contract measured in decades." },
      ],
    },
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
      { label: "Families with children", note: "Children produce the unplanned hospital visits, and they arrive without any warning at all." },
      { label: "Working professionals", note: "Time away from work and a hospital bill tend to turn up in the same week." },
      { label: "Individuals seeking financial protection", note: "A single admission can undo several years of careful saving." },
      { label: "Business owners", note: "Nobody covers you while you are in a ward, and the business does not pause." },
      { label: "Senior citizens", note: "Cover is available later in life, though the plan and the terms will differ.", caption: "Subject to plan eligibility." },
      { label: "Anyone who wants peace of mind against unexpected medical expenses", note: "The point is not to profit from illness. It is to keep it from becoming a financial event as well as a medical one." },
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
    whyMeIntro:
      "With over {years} years in financial consulting and insurance, and a great deal of time spent inside hospital admissions offices on clients' behalf, here is what I provide:",
    whyMe: [
      "Professional advice tailored to your needs.",
      "Personalized health insurance solutions.",
      "Ongoing policy servicing and claims guidance.",
      "Trusted support before and after your policy purchase.",
    ],
    why: {
      heading: "Why Sri Lanka Insurance for health cover",
      standfirst: "Health cover is used more often than any other policy you will hold, so how it behaves in practice matters more than how it reads.",
      items: [
        { lead: "Comprehensive medical expense protection", body: "Hospitalisation, surgery and the care around it, rather than a narrow list of named procedures." },
        { lead: "Access to quality healthcare", body: "Treatment at recognised hospitals, chosen on clinical grounds rather than on what you can pay that week." },
        { lead: "Affordable plans for individuals and families", body: "Cover that can start with one person and grow to take in a family." },
        { lead: "Fast and reliable claims support", body: "With me handling the submission and the follow-up, which is the part people dread." },
      ],
    },
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
      { label: "Parents of newborns and young children", note: "Starting at birth gives the fund eighteen years to do the work, which is what makes the monthly figure small." },
      { label: "Families planning ahead for school or university expenses", note: "The fees arrive on a known date. That is unusually helpful — it means the plan can be timed to meet them." },
      { label: "Anyone who wants to create a secure financial future for a child", note: "Grandparents and guardians can hold this plan too; it does not have to be a parent." },
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
    whyMeIntro:
      "This is a plan you will hold for fifteen or twenty years. Over that time, here is what I provide:",
    whyMe: [
      "A plan sized to what university will actually cost, not a round number.",
      "Clear explanation of what is guaranteed and what is not.",
      "Reviews as your child gets closer to needing it.",
      "Support throughout the life of the plan.",
    ],
    why: {
      heading: "Why start early",
      standfirst: "This is the one product on this page where the date you begin matters more than the amount you begin with.",
      items: [
        { lead: "Small contributions, given time to grow", body: "A fund built steadily from a child's early years reaches a figure that would be painful to save for in the last five." },
        { lead: "Ahead of rising education costs", body: "Fees do not stand still. Starting early is how the plan keeps pace with them rather than chasing them." },
        { lead: "A savings habit that holds", body: "A dedicated plan is money that does not quietly get spent on something else, which is what usually happens to education savings." },
        { lead: "Knowing it is settled", body: "The peace of mind of knowing your child's education is provided for, whatever else changes." },
      ],
    },
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
      { label: "Young professionals starting their careers", note: "Thirty years of small contributions beats ten years of large ones. Time is doing most of the work." },
      { label: "Employees planning for a financially secure retirement", note: "EPF and ETF are a floor, not a plan. This is what sits on top of them." },
      { label: "Self-employed individuals", note: "No employer is contributing on your behalf, so every rupee in the fund is one you put there." },
      { label: "Business owners", note: "The business is not a retirement plan on its own. It has to be sold, and that takes a buyer." },
      { label: "Anyone who wants a comfortable and independent retirement", note: "Independence is the real product here. The fund is only how it gets paid for." },
    ],
    covers: [
      { lead: "Optional riders for enhanced protection", body: "Additional benefits attached to the plan where they earn their place." },
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
    whyMeIntro:
      "A retirement plan is a thirty-year relationship, not a transaction. Over that time, here is what I provide:",
    whyMe: [
      "Personalised retirement planning around your goals.",
      "A clear view of what starting now versus later actually produces.",
      "Reviews as your income changes.",
      "Support through the whole term, not just at the start.",
    ],
    why: {
      heading: "Why have a retirement plan at all",
      standfirst: "Retirement is the one financial event everybody knows is coming and most people plan for last.",
      items: [
        { lead: "A fund that is only for this", body: "Built through regular savings and kept separate, so it is still there when you reach it." },
        { lead: "The lifestyle you already have", body: "The aim is not to economise in retirement. It is to carry on much as before." },
        { lead: "Less dependence on family", body: "For most people this is the real motivation, and it is rarely the one stated first." },
        { lead: "Protection against inflation", body: "Rising living costs quietly shrink what a fixed sum will buy. A figure that sounds ample today may not be in thirty years." },
        { lead: "Peace of mind, long before the date", body: "Knowing the plan exists changes how the working years feel, not only the retired ones." },
      ],
    },
    faqs: [
      { q: "I'm 28 — isn't this far too early?", a: "Copy pending. Should show the arithmetic rather than argue." },
      { q: "What if I need the money before retirement?", a: "Copy pending." },
      { q: "How does this sit alongside EPF and ETF?", a: "Copy pending." },
    ],
    closing: "The earlier you start, the more time your savings have to grow.",
    closingBody:
      "A well-planned retirement is what lets you spend those years on the things you actually want to do, and on the people you want to do them with, rather than on arithmetic.",
  },

  "house-property": {
    slug: "house-property",
    overline: "For protecting what you've built",
    title: "House & Property Insurance",
    promise: "Protect Your Home. Secure Your Future.",
    intro:
      "Your home and property are among your most valuable assets — built through years of hard work. Unexpected events such as fire, natural disasters, theft, or accidental damage can cause significant financial loss and emotional stress.",
    audiences: [
      { label: "Homeowners protecting their primary residence", note: "For most people this is the largest single thing they own, and the one they could least easily replace." },
      { label: "Families safeguarding their valuable assets", note: "Contents are almost always worth more than people estimate when they first add it up." },
      { label: "Landlords renting out residential or commercial property", note: "A let property carries risks an owner-occupied one does not, including loss of rent." },
      { label: "Apartment and condominium owners", note: "The building's own policy covers the structure. What is inside your walls is usually yours to insure." },
      { label: "Property investors and developers", note: "Cover has to follow the property through construction, letting and resale." },
      { label: "Anyone who wants financial security for their property", note: "The cost of cover is a small fraction of what it protects. That ratio is the whole argument." },
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
    whyMeIntro:
      "As your financial consultant, my job is to make sure your home, its contents and the investment behind them are properly covered — not approximately covered. That means:",
    whyMe: [
      "Expert guidance to select the right property insurance plan.",
      "Customized solutions based on your property type and value.",
      "Clear explanation of coverage, exclusions, and benefits.",
      "Support with policy servicing and claims assistance.",
      "Reliable advice to ensure long-term protection of your assets.",
    ],
    why: {
      heading: "Why Sri Lanka Insurance for your home",
      standfirst: "Property claims tend to arrive after events that affect whole streets at once, which is when an insurer's capacity is tested.",
      items: [
        { lead: "Buildings and contents together", body: "Comprehensive protection for the structure and for what is inside it. Insuring one and forgetting the other is the commonest gap I see." },
        { lead: "Fire, lightning and natural disaster", body: "Flood and landslide are a recent, lived concern in Sri Lanka rather than a theoretical clause." },
        { lead: "Theft, burglary and malicious damage", body: "Including damage done in the course of a break-in, not only what was taken." },
        { lead: "Plans for owners and landlords alike", body: "A let property and a family home carry different risks and are written differently." },
        { lead: "Backed by the state-owned insurer", body: "Trusted cover from Sri Lanka's leading state-owned insurer, which matters most in exactly the years everyone claims at once." },
      ],
    },
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
      { label: "Students studying overseas", note: "Universities and visa applications routinely require proof of cover before they will proceed." },
      { label: "Families going on overseas trips", note: "One person falling ill abroad can cost more than the entire holiday did." },
      { label: "Frequent international travellers", note: "If you fly often, an annual multi-trip policy usually costs less than the single trips add up to." },
      { label: "Business professionals travelling abroad", note: "A missed connection is a missed meeting, and the policy can cover the cost of both." },
      { label: "Holidaymakers and vacation travellers", note: "Cancellation cover starts working from the day you buy it, not the day you fly." },
      { label: "Anyone who wants peace of mind while travelling", note: "Medical treatment abroad is charged at local rates, which can be many times what you would pay at home." },
    ],
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
    whyMeIntro:
      "With over {years} years in financial consulting and insurance, and cover arranged for students, families and business travellers alike, here is what I provide:",
    whyMe: [
      "Expert guidance to choose the right plan for your destination and purpose.",
      "Clear explanation of what is and is not covered.",
      "Support with policy servicing and claims assistance.",
      "Reliable advice before, during, and after your journey.",
    ],
    why: {
      heading: "Why Sri Lanka Insurance for travel",
      standfirst: "Travel cover is the one policy you may have to use in a country where you do not speak the language.",
      items: [
        { lead: "Medical emergencies abroad", body: "Treatment overseas is charged at local rates. In much of the world that is many times what the same care costs here." },
        { lead: "Cancellation and interruption", body: "Financial protection if the trip is called off before you go, or cut short once you are there." },
        { lead: "Baggage lost, stolen or delayed", body: "Compensation for what does not arrive when you do." },
        { lead: "Emergency assistance while you travel", body: "Someone reachable in a different time zone, which is the whole value of it at two in the morning." },
        { lead: "Backed by the state-owned insurer", body: "Trusted cover from Sri Lanka's leading state-owned insurer, recognised by embassies and universities." },
      ],
    },
    faqs: [
      { q: "My university asks for proof of cover — can you provide it?", a: "Copy pending." },
      { q: "How quickly can cover be arranged?", a: "Copy pending." },
      { q: "Does it cover pre-existing medical conditions?", a: "Copy pending. Must be accurate." },
    ],
    closing: "Don't let unexpected disruptions affect your journey or your finances.",
  },
};
