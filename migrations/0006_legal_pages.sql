-- Privacy, terms and disclaimer move out of the code and into the
-- settings table, where he edits them himself under Legal pages.
--
-- They are his own policies, not ours. This seeds the first version
-- with the wording the pages already carried, minus the internal
-- "copy pending" note, so the admin starts from something rather than
-- an empty box. ON CONFLICT DO NOTHING: re-running never overwrites
-- what he has since written.
INSERT INTO settings (key, value) VALUES ('legal_privacy', 'This site collects personal data in three places: the consultation booking form, the testimonial submission form, and guide downloads. This page explains what is collected, why, and what happens to it.

## What is collected

- Booking a consultation — your name, email address, WhatsApp number, profession, the topics you selected, your preferred time, and anything you write in the notes field.
- Submitting a review — your name, profession, rating, review text, and an email address used only to verify the submission is genuine.
- Downloading a guide — your name and WhatsApp number, and which guide you took.

## Why it is collected

So that Thushara Rathnayake can respond to your enquiry, prepare properly before speaking with you, and send you what you asked for. Nothing more.

## Who sees it

Thushara Rathnayake only. Your details are never sold, and are not shared with third parties for marketing. Where a policy is arranged, the information needed to issue it is shared with Sri Lanka Insurance Corporation as the insurer.

## Your choices

You can ask for your details to be corrected or deleted at any time. Reviews are only published with your explicit consent, and can be removed on request.

## Cookies

This site does not use advertising or tracking cookies. Your life-stage selection is stored in your browser for the session only, so the site does not forget what you told it while you move between pages.') ON CONFLICT(key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('legal_terms', 'By using this website you accept these terms. If you do not accept them, please do not use the site.

## What this site is

The personal professional profile of Thushara Rathnayake, a Senior Financial Consultant at Sri Lanka Insurance Corporation. It is provided for information and to arrange a consultation.

## Accuracy

Reasonable care is taken to keep the information here accurate and current, but products, terms and premiums change. Nothing here forms part of a contract of insurance. The policy document issued by the insurer prevails in all cases.

## Reviews

Reviews are submitted by clients and published only after review. Submitting a review does not guarantee publication. Anything defamatory, misleading about a policy, or not from a genuine client will not be published.

## Links

Where this site links elsewhere, those sites are not under Thushara Rathnayake''s control and he is not responsible for their content.

## Contact

Questions about these terms can be raised through the contact page.') ON CONFLICT(key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('legal_disclaimer', 'This website provides general information about insurance products available from Sri Lanka Insurance Corporation. It does not constitute personalised financial advice, and nothing on it should be relied upon as a recommendation for your particular circumstances.

All cover is subject to the terms, conditions, limits and exclusions of the policy issued by Sri Lanka Insurance Corporation Limited. Where this site describes what a policy covers, the policy document prevails.

## Regulation

Insurance in Sri Lanka is a regulated activity supervised by the Insurance Regulatory Commission of Sri Lanka (IRCSL).

Thushara Rathnayake is a Senior Financial Consultant at Sri Lanka Insurance Corporation. This website is his personal professional profile and is not an official publication of Sri Lanka Insurance Corporation.

## Figures and examples

Any figures, calculators or examples shown are indicative guidance only and never a quotation. Actual premiums and cover levels depend on your circumstances and are confirmed by the insurer.

## Claims

Claims are assessed and paid by Sri Lanka Insurance Corporation. Thushara Rathnayake provides support in preparing and following up a claim, but does not assess claims, decide outcomes, or pay them.') ON CONFLICT(key) DO NOTHING;
