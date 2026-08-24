/**
 * The lead capture form — the most important component on the site.
 *
 * Governing constraint: Dr. Anushka Perera has ninety seconds. She is
 * standing in a corridor between patients. Four short steps, each
 * fitting one mobile screen. Nothing here may cost her time.
 *
 * Spec: design-brief/06-page-specs/booking.md + "02 Booking.dc.html"
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CompactDay } from "../../lib/availability";
import { formatLongDayLabel, formatTime, fromCompact } from "../../lib/availability";
import { stepSchemas, leadSchema, normaliseSriLankanPhone } from "../../lib/lead-schema";
import { professions, services as ALL_SERVICES, meetingMethods } from "../../lib/site";

const DRAFT_KEY = "tr_booking_draft_v1";
const TOTAL = 4;

type Values = Record<string, any>;
type Errors = Record<string, string>;

interface Props {
  /** Compact wire format — expanded on mount. See availability.ts. */
  days: CompactDay[];
  bookingsPaused: boolean;
  whatsappNumber: string | null;
  phoneDisplay: string;
  phoneHref: string | null;
  /** Pre-selects a service when arriving from a service page. */
  initialService?: string;
  initialLifeStage?: string;
  referringPage?: string;
}

const SPECIAL_OPTIONS = [
  { id: "not-sure", label: "I'm not sure yet — I'd like advice", note: "Perfectly normal. Most people start here." },
  { id: "reviewing-cover", label: "Reviewing cover I already have" },
];

export default function BookingForm({
  days: compactDays,
  bookingsPaused,
  whatsappNumber,
  phoneDisplay,
  phoneHref,
  initialService,
  initialLifeStage,
  referringPage,
}: Props) {
  // Expand once; labels and periods are derived, not transferred.
  const days = useMemo(() => fromCompact(compactDays), [compactDays]);

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(() => ({
    profession_category: "",
    services: initialService ? [initialService] : [],
    meeting_method: "",
    preferred_date: "",
    preferred_time: "",
    preferred_contact: "whatsapp",
    consent: false,
    life_stage: initialLifeStage ?? "",
    referring_page: referringPage ?? "",
    website: "", // honeypot
  }));
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "failed" | "done">("idle");
  const [result, setResult] = useState<{ id: number } | null>(null);
  const [showAltTime, setShowAltTime] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  // ---- draft persistence: if the browser closes mid-form, nothing is lost
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.values) {
          setValues((v) => ({ ...v, ...saved.values, website: "" }));
          setStep(Math.min(saved.step ?? 0, TOTAL - 1));
        }
      }
    } catch {
      /* corrupt draft is not worth surfacing */
    }
  }, []);

  useEffect(() => {
    if (status === "done") return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, values }));
    } catch {
      /* private browsing / quota — the form still works */
    }
  }, [step, values, status]);

  const set = useCallback((patch: Values) => {
    setValues((v) => ({ ...v, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const k of Object.keys(patch)) delete next[k];
      return next;
    });
  }, []);

  const scrollTop = () =>
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const validateStep = (i: number): boolean => {
    const parsed = stepSchemas[i].safeParse(values);
    if (parsed.success) return true;
    const next: Errors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "root";
      if (!next[key]) next[key] = issue.message;
    }
    setErrors(next);
    // Announce, then move focus to the first bad field.
    const first = Object.keys(next)[0];
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
    });
    return false;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, TOTAL - 1));
    scrollTop();
  };

  // Back never loses data — values are held above the step index.
  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
    scrollTop();
  };

  async function submit() {
    if (!validateStep(3)) return;
    const parsed = leadSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "root";
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok) {
        setStatus("done");
        setResult({ id: data.id });
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch { /* ignore */ }
        scrollTop();
        return;
      }

      if (res.status === 422 && data?.fieldErrors) {
        setErrors(data.fieldErrors);
        setStatus("idle");
        return;
      }
      setStatus("failed");
    } catch {
      // Almost always a dropped connection on mobile data.
      setStatus("failed");
    }
    scrollTop();
  }

  const selectedDay = days.find((d) => d.date === values.preferred_date);

  if (status === "done" && result) {
    return (
      <Confirmed
        values={values}
        whatsappNumber={whatsappNumber}
        phoneDisplay={phoneDisplay}
        phoneHref={phoneHref}
        topRef={topRef}
      />
    );
  }

  if (bookingsPaused) {
    return <Paused whatsappNumber={whatsappNumber} phoneDisplay={phoneDisplay} phoneHref={phoneHref} />;
  }

  return (
    <div ref={topRef} className="min-w-0 scroll-mt-20">
      {/* Progress — reuses the Milestone Line language: a rule with nodes. */}
      <div className="mb-8">
        <div className="flex items-baseline justify-between mb-3">
          <span className="overline text-teal-400">
            Step {step + 1} of {TOTAL}
          </span>
          <span className="text-caption text-warm-500">About 90 seconds</span>
        </div>
        <div className="flex gap-2" role="presentation">
          {Array.from({ length: TOTAL }, (_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                i < step ? "bg-gold-500" : i === step ? "bg-teal-600" : "bg-warm-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div aria-live="polite" className="sr-only" ref={liveRef}>
        {Object.keys(errors).length > 0
          ? `${Object.keys(errors).length} field${Object.keys(errors).length > 1 ? "s need" : " needs"} attention`
          : ""}
      </div>

      {status === "failed" && (
        <SubmissionFailed
          values={values}
          whatsappNumber={whatsappNumber}
          phoneDisplay={phoneDisplay}
          phoneHref={phoneHref}
          onRetry={() => {
            setStatus("idle");
            submit();
          }}
        />
      )}

      {step > 0 && status !== "failed" && (
        <button
          type="button"
          onClick={back}
          className="mb-5 inline-flex min-h-11 items-center gap-2 text-body font-bold text-teal-600 hover:text-teal-400"
        >
          <span aria-hidden="true">←</span> Back
        </button>
      )}

      {status !== "failed" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            step === TOTAL - 1 ? submit() : next();
          }}
          noValidate
        >
          {/* Honeypot. Invisible to people, catnip to bots. No CAPTCHA:
              it would cost real conversions from a busy doctor. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
            <label>
              Website
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={(e) => set({ website: e.target.value })}
              />
            </label>
          </div>

          {step === 0 && <Step1 values={values} errors={errors} set={set} />}
          {step === 1 && <Step2 values={values} errors={errors} set={set} arrivedFrom={initialService} />}
          {step === 2 && (
            <Step3
              values={values}
              errors={errors}
              set={set}
              days={days}
              selectedDay={selectedDay}
              showAltTime={showAltTime}
              setShowAltTime={setShowAltTime}
              whatsappNumber={whatsappNumber}
            />
          )}
          {step === 3 && <Step4 values={values} errors={errors} set={set} />}

          <div className="mt-8">
            <button
              type="submit"
              disabled={status === "sending"}
              className="flex min-h-14 w-full items-center justify-center rounded-full bg-teal-600 px-8 text-[17px] font-bold text-cream-50 transition-colors hover:bg-teal-500 disabled:opacity-70"
            >
              {status === "sending" ? (
                <span className="inline-flex items-center gap-3">
                  <Spinner /> Book my consultation
                </span>
              ) : step === TOTAL - 1 ? (
                "Book my consultation"
              ) : (
                "Continue"
              )}
            </button>

            <p className="mt-4 text-center text-small text-warm-500">
              {status === "sending"
                ? "Sending — this can take a moment on a slow connection."
                : step === TOTAL - 1
                  ? "Free. No obligation. I'll confirm within a few hours."
                  : "Free consultation · No obligation · Your details are never shared"}
            </p>

            {step === 0 && whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                className="mt-5 block text-center text-body font-bold text-teal-600 underline underline-offset-4 hover:text-teal-400"
              >
                Or just message me on WhatsApp
              </a>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

/* ============================================================ steps */

function Step1({ values, errors, set }: { values: Values; errors: Errors; set: (p: Values) => void }) {
  const cat = values.profession_category as keyof typeof professions | "";
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 font-display text-h2 font-extrabold text-ink-900">First, what do you do?</legend>
      <p className="mb-6 text-body-lg text-warm-700">So I can prepare properly before we speak.</p>

      <div className="grid grid-cols-2 gap-3" data-field="profession_category" tabIndex={-1}>
        {(Object.keys(professions) as Array<keyof typeof professions>).map((key) => (
          <ChoiceCard
            key={key}
            selected={cat === key}
            label={professions[key].label}
            onClick={() =>
              set({
                profession_category: key,
                profession_role: "",
                engineering_discipline: "",
                profession_other: "",
              })
            }
          />
        ))}
      </div>
      <FieldError message={errors.profession_category} />

      {/* Conditional reveal — immediate, never a page reload. */}
      {cat === "doctor" && (
        <Reveal label="What's your current role?" error={errors.profession_role}>
          <PillGroup
            name="profession_role"
            options={professions.doctor.roles}
            value={values.profession_role}
            onChange={(v) => set({ profession_role: v })}
          />
        </Reveal>
      )}

      {cat === "engineer" && (
        <>
          <Reveal label="What's your discipline?" error={errors.engineering_discipline}>
            <PillGroup
              name="engineering_discipline"
              options={professions.engineer.disciplines}
              value={values.engineering_discipline}
              onChange={(v) => set({ engineering_discipline: v })}
            />
          </Reveal>
          <Reveal label="And your current level?">
            <PillGroup
              name="profession_role"
              options={professions.engineer.roles}
              value={values.profession_role}
              onChange={(v) => set({ profession_role: v })}
            />
          </Reveal>
        </>
      )}

      {cat === "other_professional" && (
        <Reveal label="Which of these fits best?">
          <PillGroup
            name="profession_role"
            options={professions.other_professional.roles}
            value={values.profession_role}
            onChange={(v) => set({ profession_role: v })}
          />
        </Reveal>
      )}

      {cat === "other" && (
        <Reveal label="Tell me briefly what you do" error={errors.profession_other}>
          <input
            type="text"
            data-field="profession_other"
            value={values.profession_other ?? ""}
            onChange={(e) => set({ profession_other: e.target.value })}
            placeholder="Your line of work"
            className="h-13 w-full rounded-md border border-warm-200 bg-warm-100 px-4 text-body text-warm-900 placeholder:text-warm-500 focus:border-teal-400 focus:bg-white"
          />
        </Reveal>
      )}
    </fieldset>
  );
}

function Step2({
  values,
  errors,
  set,
  arrivedFrom,
}: {
  values: Values;
  errors: Errors;
  set: (p: Values) => void;
  arrivedFrom?: string;
}) {
  const selected: string[] = values.services ?? [];
  const toggle = (id: string) =>
    set({ services: selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id] });

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 font-display text-h2 font-extrabold text-ink-900">What's on your mind?</legend>
      <p className="mb-6 text-body-lg text-warm-700">Select as many as apply.</p>

      <div className="space-y-3" data-field="services" tabIndex={-1}>
        {/* "Not sure" is a first-class option, not an afterthought —
            it converts the most uncertain visitors. */}
        {SPECIAL_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            aria-pressed={selected.includes(opt.id)}
            onClick={() => toggle(opt.id)}
            className={`flex w-full min-h-14 flex-col justify-center rounded-lg border-[1.5px] px-5 py-3 text-left transition-colors ${
              selected.includes(opt.id)
                ? "border-teal-400 bg-teal-50"
                : "border-warm-200 bg-white hover:border-teal-300"
            }`}
          >
            <span className="text-body font-bold text-ink-900">{opt.label}</span>
            {opt.note && <span className="mt-0.5 text-small text-warm-500">{opt.note}</span>}
          </button>
        ))}

        <div className="grid gap-2 sm:grid-cols-2">
          {ALL_SERVICES.map((s) => (
            <Chip
              key={s.slug}
              label={s.title}
              selected={selected.includes(s.slug)}
              onClick={() => toggle(s.slug)}
            />
          ))}
        </div>
      </div>

      <FieldError message={errors.services} />

      {arrivedFrom && (
        <p className="mt-4 text-small text-warm-500">
          Pre-selected from the page you came from. Change anything you like.
        </p>
      )}
    </fieldset>
  );
}

function Step3({
  values,
  errors,
  set,
  days,
  selectedDay,
  showAltTime,
  setShowAltTime,
  whatsappNumber,
}: {
  values: Values;
  errors: Errors;
  set: (p: Values) => void;
  days: DayAvailability[];
  selectedDay?: DayAvailability;
  showAltTime: boolean;
  setShowAltTime: (v: boolean) => void;
  whatsappNumber: string | null;
}) {
  const openDays = days.filter((d) => d.slots.length > 0 || d.blocked);
  const nextFree = selectedDay && !selectedDay.hasSlots
    ? days.find((d) => d.date > selectedDay.date && d.hasSlots)
    : null;

  const grouped = (period: string) =>
    (selectedDay?.slots ?? []).filter((s) => s.period === period);

  return (
    <fieldset className="min-w-0">
      <legend className="mb-6 font-display text-h2 font-extrabold text-ink-900">When shall we talk?</legend>

      <Label>How would you like to meet?</Label>
      <div className="mb-7 grid grid-cols-2 gap-3" data-field="meeting_method" tabIndex={-1}>
        {meetingMethods.map((m) => (
          <ChoiceCard
            key={m.id}
            compact
            selected={values.meeting_method === m.id}
            label={m.label}
            onClick={() => set({ meeting_method: m.id })}
          />
        ))}
      </div>
      <FieldError message={errors.meeting_method} />

      <Label>Preferred date</Label>
      <div
        className="mb-7 flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-2 -mx-1 px-1"
        data-field="preferred_date"
        tabIndex={-1}
      >
        {openDays.slice(0, 21).map((d) => {
          const active = values.preferred_date === d.date;
          return (
            <button
              key={d.date}
              type="button"
              disabled={!d.hasSlots}
              aria-pressed={active}
              onClick={() => set({ preferred_date: d.date, preferred_time: "" })}
              className={`flex min-w-[74px] shrink-0 flex-col items-center rounded-lg border-[1.5px] px-3 py-3 transition-colors ${
                active
                  ? "border-teal-400 bg-teal-600 text-cream-50"
                  : d.hasSlots
                    ? "border-warm-200 bg-white text-warm-900 hover:border-teal-300"
                    : "border-warm-100 bg-warm-100 text-warm-400 line-through"
              }`}
            >
              <span className="text-caption font-bold uppercase tracking-wider opacity-80">
                {d.label.split(" ")[0]}
              </span>
              <span className="font-display text-h4 font-extrabold">{d.label.split(" ")[1]}</span>
              <span className="text-caption opacity-80">{d.label.split(" ")[2]}</span>
            </button>
          );
        })}
      </div>
      <FieldError message={errors.preferred_date} />

      {selectedDay && !selectedDay.hasSlots && (
        <div className="mb-7 rounded-lg border border-gold-300 bg-gold-100 p-5">
          <p className="text-body font-bold text-ink-900">
            {formatLongDayLabel(selectedDay.date)} is fully booked.
          </p>
          {nextFree ? (
            <>
              <p className="mt-1 text-body text-warm-700">
                The next day with slots free is {formatLongDayLabel(nextFree.date)}
                {nextFree.slots.some((s) => s.available && s.period === "evening")
                  ? " — including an evening slot."
                  : "."}
              </p>
              <button
                type="button"
                onClick={() => set({ preferred_date: nextFree.date, preferred_time: "" })}
                className="mt-4 inline-flex min-h-12 items-center rounded-full bg-teal-600 px-6 text-body font-bold text-cream-50"
              >
                Show {formatLongDayLabel(nextFree.date)}
              </button>
            </>
          ) : (
            <p className="mt-1 text-body text-warm-700">Nothing free in the next few weeks.</p>
          )}
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
              className="mt-3 block text-body font-bold text-teal-600 underline underline-offset-4"
            >
              Ask me on WhatsApp instead
            </a>
          )}
        </div>
      )}

      {selectedDay?.hasSlots && (
        <>
          <Label>Preferred time · {selectedDay.label}</Label>
          <div className="mb-2 space-y-4" data-field="preferred_time" tabIndex={-1}>
            {(["morning", "afternoon", "evening"] as const).map((period) => {
              const slots = grouped(period);
              if (!slots.length) return null;
              return (
                <div key={period}>
                  <p className="overline mb-2 text-warm-500 capitalize">{period}</p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((s) => (
                      <Chip
                        key={s.value}
                        label={s.label}
                        disabled={!s.available}
                        selected={values.preferred_time === s.value}
                        onClick={() => set({ preferred_time: s.value })}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <FieldError message={errors.preferred_time} />

          {!showAltTime ? (
            <button
              type="button"
              onClick={() => setShowAltTime(true)}
              className="mt-4 min-h-11 text-body font-bold text-teal-600 hover:text-teal-400"
            >
              + Add an alternative time
            </button>
          ) : (
            <div className="mt-4">
              <Label>Alternative time (optional)</Label>
              <input
                type="text"
                value={values.alt_time ?? ""}
                onChange={(e) => set({ alt_time: e.target.value })}
                placeholder="e.g. Thursday evening would also work"
                className="h-13 w-full rounded-md border border-warm-200 bg-warm-100 px-4 text-body placeholder:text-warm-500 focus:border-teal-400 focus:bg-white"
              />
            </div>
          )}
        </>
      )}

      <p className="mt-6 text-small text-warm-500">Evening and weekend slots included.</p>
    </fieldset>
  );
}

function Step4({ values, errors, set }: { values: Values; errors: Errors; set: (p: Values) => void }) {
  const errorCount = Object.keys(errors).length;
  const phoneOk = values.phone_whatsapp && normaliseSriLankanPhone(values.phone_whatsapp);

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 font-display text-h2 font-extrabold text-ink-900">Almost done.</legend>
      <p className="mb-6 text-body-lg text-warm-700">Just so I know who I'm speaking to.</p>

      {errorCount > 0 && (
        <div className="mb-6 flex gap-3 rounded-lg border border-danger/30 bg-danger/5 p-4">
          <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-danger font-bold text-danger">!</span>
          <p className="text-body text-warm-900">
            {errorCount === 1 ? "One thing needs" : `${errorCount} things need`} fixing before I can book this.
          </p>
        </div>
      )}

      <div className="space-y-5">
        <Field label="Full name" error={errors.name} valid={values.name?.length >= 2}>
          <input
            type="text"
            data-field="name"
            autoComplete="name"
            value={values.name ?? ""}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Your name"
            className={inputClass(errors.name)}
          />
        </Field>

        <Field label="WhatsApp number" error={errors.phone_whatsapp} valid={Boolean(phoneOk)}>
          <div className="flex">
            <span className="flex h-13 items-center rounded-l-md border border-r-0 border-warm-200 bg-warm-100 px-4 text-body text-warm-700">
              +94
            </span>
            <input
              /* type=tel gives the numeric keypad — small detail, real
                 difference when you are typing one-handed. */
              type="tel"
              inputMode="numeric"
              data-field="phone_whatsapp"
              autoComplete="tel"
              value={values.phone_whatsapp ?? ""}
              onChange={(e) => set({ phone_whatsapp: e.target.value })}
              placeholder="7X XXX XXXX"
              className={inputClass(errors.phone_whatsapp) + " rounded-l-none"}
            />
          </div>
        </Field>

        <Field label="Email address" error={errors.email} valid={/.+@.+\..+/.test(values.email ?? "")}>
          <input
            type="email"
            inputMode="email"
            data-field="email"
            autoComplete="email"
            value={values.email ?? ""}
            onChange={(e) => set({ email: e.target.value })}
            placeholder="you@example.com"
            className={inputClass(errors.email)}
          />
        </Field>

        <div>
          <Label>Preferred contact method</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "whatsapp", label: "WhatsApp" },
              { id: "phone", label: "Call" },
              { id: "email", label: "Email" },
            ].map((o) => (
              <ChoiceCard
                key={o.id}
                compact
                selected={values.preferred_contact === o.id}
                label={o.label}
                onClick={() => set({ preferred_contact: o.id })}
              />
            ))}
          </div>
        </div>

        <Field label="Anything I should know?" optional>
          <textarea
            rows={3}
            data-field="notes"
            value={values.notes ?? ""}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder="Anything that would help me prepare."
            className={inputClass() + " h-auto py-3 resize-y"}
          />
        </Field>

        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              data-field="consent"
              checked={Boolean(values.consent)}
              onChange={(e) => set({ consent: e.target.checked })}
              className="mt-0.5 size-6 shrink-0 rounded border-[1.5px] border-warm-300 accent-teal-600"
            />
            <span className="text-body text-warm-900">
              I'm happy for Thushara to contact me about this enquiry.{" "}
              <a href="/privacy" className="text-teal-600 underline underline-offset-2">
                Privacy
              </a>
            </span>
          </label>
          <FieldError message={errors.consent} />
        </div>
      </div>
    </fieldset>
  );
}

/* ============================================================ states */

/**
 * The failure that will actually happen, on Sri Lankan mobile data.
 * Nothing is lost, the tone does not blame them, and WhatsApp is
 * offered pre-written with everything they entered.
 */
function SubmissionFailed({
  values,
  whatsappNumber,
  phoneDisplay,
  phoneHref,
  onRetry,
}: {
  values: Values;
  whatsappNumber: string | null;
  phoneDisplay: string;
  phoneHref: string | null;
  onRetry: () => void;
}) {
  const summary = [
    values.profession_role || values.profession_other,
    (values.services ?? []).join(", "),
    [values.preferred_date && formatLongDayLabel(values.preferred_date), values.preferred_time && formatTime(values.preferred_time)].filter(Boolean).join(", "),
    values.name,
  ]
    .filter(Boolean)
    .join(" · ");

  const waText = encodeURIComponent(
    `Hello Thushara, I tried to book a consultation on your website but it didn't send.\n\n` +
      `Name: ${values.name ?? ""}\n` +
      `Work: ${values.profession_role || values.profession_other || values.profession_category || ""}\n` +
      `Interested in: ${(values.services ?? []).join(", ")}\n` +
      `Preferred: ${values.preferred_date ?? ""} ${values.preferred_time ?? ""}\n` +
      `Email: ${values.email ?? ""}` +
      (values.notes ? `\nNote: ${values.notes}` : ""),
  );

  return (
    <div className="rounded-xl border border-gold-300 bg-gold-100 p-6" role="alert">
      <span aria-hidden="true" className="mb-3 flex size-9 items-center justify-center rounded-full border-[1.5px] border-gold-600 text-h4 font-bold text-gold-600">!</span>
      <h2 className="font-display text-h3 font-extrabold text-ink-900">That didn't send.</h2>
      <p className="mt-2 text-body text-warm-700">
        Your connection dropped — not your fault, and nothing has been lost.{" "}
        <strong className="text-warm-900">Everything you typed is still here.</strong>
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 flex min-h-14 w-full items-center justify-center rounded-full bg-teal-600 text-[17px] font-bold text-cream-50 hover:bg-teal-500"
      >
        Try again
      </button>

      {whatsappNumber && (
        <>
          <a
            href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${waText}`}
            className="mt-3 flex min-h-14 w-full items-center justify-center rounded-full bg-whatsapp text-[17px] font-bold text-white"
          >
            Send it to me on WhatsApp
          </a>
          <p className="mt-2 text-small text-warm-700">
            The WhatsApp message comes pre-written with everything you entered — you just press send.
          </p>
        </>
      )}

      {summary && (
        <div className="mt-5 rounded-lg bg-cream-50/70 p-4">
          <p className="overline text-warm-500">Your answers, saved</p>
          <p className="mt-1 text-small text-warm-900">{summary}</p>
        </div>
      )}

      {phoneHref && (
        <p className="mt-4 text-small text-warm-700">
          Or call me directly —{" "}
          <a href={phoneHref} className="font-bold text-teal-600 underline underline-offset-2">
            {phoneDisplay}
          </a>
        </p>
      )}
    </div>
  );
}

function Confirmed({
  values,
  whatsappNumber,
  phoneDisplay,
  phoneHref,
  topRef,
}: {
  values: Values;
  whatsappNumber: string | null;
  phoneDisplay: string;
  phoneHref: string | null;
  topRef: React.RefObject<HTMLDivElement | null>;
}) {
  const first = (values.name ?? "").split(" ")[0];
  const when = values.preferred_date ? formatLongDayLabel(values.preferred_date) : "";
  const method = meetingMethods.find((m) => m.id === values.meeting_method)?.label ?? "";
  // Never lowercase this — it produces "whatsapp call".

  return (
    <div ref={topRef} className="scroll-mt-20">
      <span aria-hidden="true" className="mb-5 flex size-14 items-center justify-center rounded-full bg-teal-600 text-h2 text-cream-50">
        ✓
      </span>
      <h1 className="font-display text-h1 font-extrabold text-ink-900">
        Thanks, {first}.<br />I'll be in touch.
      </h1>
      <p className="mt-3 text-body-lg text-warm-700">
        {when} at {formatTime(values.preferred_time)}, by {method}.
      </p>

      <h2 className="overline mt-9 text-teal-400">What happens next</h2>
      <ol className="mt-4 space-y-4">
        {[
          "A confirmation reaches you by email within a few minutes.",
          "I confirm the time — usually within a few hours.",
          `We talk on ${when} at ${formatTime(values.preferred_time)}.`,
        ].map((t, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-50 font-display font-extrabold text-teal-600">
              {i + 1}
            </span>
            <span className="text-body text-warm-900">{t}</span>
          </li>
        ))}
      </ol>

      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
          className="mt-8 flex min-h-14 w-full items-center justify-center rounded-full bg-whatsapp text-[17px] font-bold text-white"
        >
          Message me on WhatsApp
        </a>
      )}
      {phoneHref && (
        <p className="mt-4 text-center text-small text-warm-500">
          Anything urgent before then?{" "}
          <a href={phoneHref} className="font-bold text-teal-600">
            {phoneDisplay}
          </a>
        </p>
      )}
    </div>
  );
}

function Paused({
  whatsappNumber,
  phoneDisplay,
  phoneHref,
}: {
  whatsappNumber: string | null;
  phoneDisplay: string;
  phoneHref: string | null;
}) {
  return (
    <div className="rounded-xl border border-warm-200 bg-cream-100 p-7 text-center">
      <h2 className="font-display text-h3 font-extrabold text-ink-900">I'm away at the moment</h2>
      <p className="mx-auto mt-3 max-w-[46ch] text-body text-warm-700">
        Online booking is paused, but do send me a message — I'll get back to you as soon as I'm back.
      </p>
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
          className="mt-6 inline-flex min-h-14 items-center justify-center rounded-full bg-whatsapp px-8 text-[17px] font-bold text-white"
        >
          Message me on WhatsApp
        </a>
      )}
      {phoneHref && (
        <p className="mt-4 text-small text-warm-700">
          Or call —{" "}
          <a href={phoneHref} className="font-bold text-teal-600">
            {phoneDisplay}
          </a>
        </p>
      )}
    </div>
  );
}

/* ============================================================ primitives */

const inputClass = (error?: string) =>
  `h-13 w-full rounded-md border bg-warm-100 px-4 text-body text-warm-900 placeholder:text-warm-500 transition-colors focus:bg-white ${
    error ? "border-[1.5px] border-danger" : "border-warm-200 focus:border-teal-400"
  }`;

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-small font-bold text-warm-800">{children}</p>;
}

function Field({
  label,
  error,
  valid,
  optional,
  children,
}: {
  label: string;
  error?: string;
  valid?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-baseline gap-2 text-small font-bold text-warm-800">
        {label}
        {optional && <span className="font-normal text-warm-500">Optional</span>}
        {valid && !error && (
          <span aria-hidden="true" className="ml-auto text-success">
            ✓
          </span>
        )}
      </label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 flex items-start gap-2 text-small text-danger">
      <span aria-hidden="true" className="mt-px font-bold">!</span>
      {message}
    </p>
  );
}

function Reveal({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 animate-[reveal_260ms_cubic-bezier(0.2,0,0,1)]">
      <Label>{label}</Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

function ChoiceCard({
  label,
  selected,
  onClick,
  compact,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex items-center justify-center rounded-lg border-[1.5px] text-center font-bold transition-colors ${
        compact ? "min-h-13 px-3 text-small" : "min-h-[104px] px-4 text-body"
      } ${
        selected
          ? "border-teal-400 bg-teal-600 text-cream-50"
          : "border-warm-200 bg-white text-warm-900 hover:border-teal-300"
      }`}
    >
      {label}
    </button>
  );
}

function Chip({
  label,
  selected,
  onClick,
  disabled,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-12 rounded-full border px-5 text-small font-bold transition-colors ${
        disabled
          ? "cursor-not-allowed border-warm-100 bg-warm-100 text-warm-400 line-through"
          : selected
            ? "border-teal-400 bg-teal-600 text-cream-50"
            : "border-warm-200 bg-white text-warm-900 hover:border-teal-300"
      }`}
    >
      {label}
    </button>
  );
}

function PillGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: readonly string[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" data-field={name} tabIndex={-1}>
      {options.map((o) => (
        <Chip key={o} label={o} selected={value === o} onClick={() => onChange(o)} />
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-4 animate-spin rounded-full border-2 border-cream-50/40 border-t-cream-50"
    />
  );
}
