/**
 * Lead capture schema — ONE definition, used by both the client form
 * and the API route. Divergence between the two is how forms silently
 * start losing submissions, so there is deliberately only one source.
 *
 * Spec: design-brief/06-page-specs/booking.md
 */

import { z } from "zod";

/**
 * Sri Lankan mobile numbers. Accepts the shapes people actually type:
 *   0771234567 · 077 123 4567 · +94771234567 · +94 77 123 4567 · 94771234567
 * Normalised to E.164 (+94XXXXXXXXX) before storage.
 */
const SL_MOBILE = /^(?:\+?94|0)?(7[0-9]{8})$/;

export function normaliseSriLankanPhone(input: string): string | null {
  const cleaned = input.replace(/[\s\-()]/g, "");
  const m = SL_MOBILE.exec(cleaned);
  return m ? `+94${m[1]}` : null;
}

const phoneField = z
  .string({ error: "Please add your WhatsApp number so I can reach you" })
  .trim()
  .min(1, "Please add your WhatsApp number so I can reach you")
  .refine((v) => normaliseSriLankanPhone(v) !== null, {
    message: "That doesn't look like a Sri Lankan mobile number — e.g. 077 123 4567",
  })
  .transform((v) => normaliseSriLankanPhone(v)!);

// ---------------------------------------------------------------- steps

/**
 * Step 1 — profession. Two taps, no typing. The easiest possible opening.
 *
 * The base object and its refinements are kept separate: `.refine()`
 * returns a wrapper without `.shape`, so `leadSchema` below composes the
 * bases and re-applies the rules once at the end.
 */
const step1Base = z.object({
  profession_category: z.enum(["doctor", "engineer", "other_professional", "other"], {
    message: "Let me know what you do",
  }),
  profession_role: z.string().trim().optional(),
  engineering_discipline: z.string().trim().optional(),
  profession_other: z.string().trim().max(160).optional(),
});

type Step1Shape = z.infer<typeof step1Base>;

/** Conditional requirements, applied to both the step and the full schema. */
const step1Rules = <T extends z.ZodType<Step1Shape, any, any>>(schema: T) =>
  schema
    .refine((d) => d.profession_category !== "doctor" || !!d.profession_role, {
      message: "Which best describes your role?",
      path: ["profession_role"],
    })
    .refine((d) => d.profession_category !== "engineer" || !!d.engineering_discipline, {
      message: "Which discipline?",
      path: ["engineering_discipline"],
    })
    .refine((d) => d.profession_category !== "other" || !!d.profession_other, {
      message: "Tell me briefly what you do",
      path: ["profession_other"],
    });

export const step1Schema = step1Rules(step1Base);

/**
 * Step 2 — interest. "I'm not sure yet" is a first-class option:
 * it converts the most uncertain visitors, who are a large share.
 */
export const step2Schema = z.object({
  services: z
    .array(z.string())
    .min(1, "Pick at least one — or choose “I'm not sure yet”"),
});

/** Step 3 — when. */
export const step3Schema = z.object({
  meeting_method: z.enum(["whatsapp", "phone", "video", "in_person"], {
    message: "How would you like to talk?",
  }),
  preferred_date: z
    .string({ error: "Pick a day that suits you" })
    .min(1, "Pick a day that suits you"),
  preferred_time: z.string({ error: "Pick a time" }).min(1, "Pick a time"),
  alt_time: z.string().optional(),
});

/** Step 4 — contact. Only two required text fields in the whole flow. */
export const step4Schema = z.object({
  name: z
    .string({ error: "What should I call you?" })
    .trim()
    .min(2, "What should I call you?")
    .max(120),
  phone_whatsapp: phoneField,
  email: z
    .string({ error: "I need an email address for the confirmation" })
    .trim()
    .email("Please check that email address")
    .max(200),
  preferred_contact: z.enum(["whatsapp", "phone", "email"]).default("whatsapp"),
  notes: z.string().trim().max(2000).optional(),
  consent: z.literal(true, {
    message: "I need your permission to get back to you",
  }),
});

// ---------------------------------------------------------------- full

/** Captured automatically — never shown to the visitor. */
const contextSchema = z.object({
  referring_page: z.string().max(300).optional(),
  life_stage: z.string().max(60).optional(),
  calculator_data: z.string().max(4000).optional(),
  /** Invisible spam trap. Must stay empty. No CAPTCHA — it would cost
      real conversions from a busy doctor. */
  website: z.string().max(0).optional(),
});

export const leadSchema = step1Rules(
  z.object({
    ...step1Base.shape,
    ...step2Schema.shape,
    ...step3Schema.shape,
    ...step4Schema.shape,
    ...contextSchema.shape,
  }),
);

export type LeadInput = z.input<typeof leadSchema>;
export type LeadData = z.output<typeof leadSchema>;

export const stepSchemas = [step1Schema, step2Schema, step3Schema, step4Schema] as const;
export const TOTAL_STEPS = 4;
