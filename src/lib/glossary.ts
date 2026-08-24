/**
 * Plain-English glosses for insurance terms.
 *
 * The audience is highly educated and insurance-illiterate. Explaining
 * a term without making someone feel stupid is the single most
 * differentiating detail on a service page — and it directly answers
 * the client's stated pain point, "complexity of choosing the right
 * policies".
 *
 * Rules: no jargon inside a gloss, no cross-references, one or two
 * sentences. If a gloss needs a gloss, rewrite it.
 */

export const glossary: Record<string, string> = {
  indemnity:
    "The insurer restores you to the financial position you were in before the claim — it does not pay a bonus, and it does not cover deliberate wrongdoing.",
  negligence:
    "Falling below the standard of care your profession expects. It does not mean you did something dishonest.",
  omission: "Something you failed to do or failed to mention, rather than something you got wrong.",
  omissions: "Things you failed to do or failed to mention, rather than things you got wrong.",
  misrepresentation: "Giving information that turns out to be wrong or misleading, even unintentionally.",
  "third-party losses":
    "Money someone else loses because of your work — the “third party” being neither you nor the insurer.",
  "policy extensions":
    "Optional add-ons that widen what the policy covers, usually for an extra premium.",
  exclusions: "The situations a policy specifically does not cover. Always worth reading before you sign.",
  premium: "What you pay for the cover, usually monthly or annually.",
  excess:
    "The first part of any claim you pay yourself. A higher excess usually means a lower premium.",
  "third-party liability":
    "Cover for damage or injury you cause to other people and their property. It is the legal minimum for a vehicle in Sri Lanka.",
  comprehensive:
    "Cover for damage to your own vehicle as well as damage you cause to others.",
  "no-claims bonus": "A discount that builds up for each year you do not make a claim.",
  "windscreen cover": "Repair or replacement of glass, often without affecting your no-claims bonus.",
  "personal accident benefit":
    "A fixed payment if the driver or passengers are injured or killed, separate from vehicle damage.",
  "income protection":
    "A regular monthly income for your family if you can no longer earn, rather than one lump sum.",
  "lump sum": "A single payment made all at once, instead of spread over time.",
  "sum assured": "The amount the policy pays out. You choose it when the policy starts.",
  rider: "An optional extra bolted onto a policy to cover something the base policy does not.",
  riders: "Optional extras bolted onto a policy to cover something the base policy does not.",
  beneficiary: "The person who receives the payout.",
  "policy term": "How long the cover runs for.",
  "maturity benefit": "What the policy pays you at the end of its term, if you are still living.",
  "cashless treatment":
    "The hospital bills the insurer directly, so you are not finding money during an emergency.",
  "network hospital": "A hospital the insurer has an arrangement with, where cashless treatment works.",
  hospitalisation: "Cover for the costs of being admitted to hospital, rather than outpatient visits.",
  "co-payment": "A share of each claim you agree to pay yourself, as a percentage.",
  "pre-existing condition":
    "A health problem you already had before the policy started. Usually excluded, at least at first.",
  "waiting period": "A stretch at the start of a policy during which certain claims cannot be made.",
  curtailment: "Cutting a trip short and coming home early.",
  "missed connection": "Missing an onward flight because an earlier one was delayed.",
  "buildings cover": "The structure itself — walls, roof, permanent fixtures.",
  "contents cover": "Everything inside that you would take with you if you moved.",
  "permanent fixtures": "Things fixed to the building, like built-in cupboards or sanitary ware.",
  "malicious damage": "Deliberate damage caused by someone else.",
  "alternative accommodation":
    "Somewhere to live, paid for by the policy, while your home is repaired.",
  "rent loss": "Rental income you lose while a let property is uninhabitable.",
  "sum insured": "The maximum the policy will pay out. Set it too low and a claim is reduced.",
  inflation: "The steady rise in prices, which quietly reduces what a fixed sum will buy later.",
  annuity: "A product that converts a lump sum into a regular income for life.",
  "wealth accumulation": "Building a sum of money steadily over years, rather than all at once.",
  "guaranteed savings": "A minimum return contractually promised, rather than dependent on markets.",
};

/** Case-insensitive lookup. */
export function gloss(term: string): string | undefined {
  return glossary[term.toLowerCase().trim()];
}
