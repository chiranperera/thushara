/**
 * Life-stage selector + the services grid it orders.
 *
 * Per "03 Home.dc.html": the stage cards are DARK, each carrying its
 * service icon as a large glowing watermark in the top-right. The
 * services grid below is light, with the icon in a rounded tile and the
 * life-stage as a pill at the foot of the card.
 *
 * Non-matching services are de-emphasised, never removed — nothing
 * should feel hidden.
 */

import { useEffect, useState } from "react";

export interface ServiceCard {
  slug: string;
  title: string;
  short: string;
  lifeStage: string;
  icon: string;
}

export interface Stage {
  id: string;
  label: string;
  ageRange: string;
  description: string;
  /** Icon used as the card watermark. */
  icon: string;
}

interface Props {
  stages: Stage[];
  services: ServiceCard[];
}

const STORAGE_KEY = "tr_life_stage";

export default function LifeStageServices({ stages, services }: Props) {
  const [stage, setStage] = useState<string | null>(null);

  // Remember the choice for the session — the site shouldn't forget who
  // someone said they were when they move between pages.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved && stages.some((s) => s.id === saved)) setStage(saved);
    } catch { /* private browsing */ }
  }, [stages]);

  const choose = (id: string) => {
    const next = stage === id ? null : id;
    setStage(next);
    try {
      next ? sessionStorage.setItem(STORAGE_KEY, next) : sessionStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  };

  const activeStage = stages.find((s) => s.id === stage);
  const stageLabel = (id: string) => stages.find((s) => s.id === id)?.label ?? "All stages";

  const ordered = stage
    ? [...services].sort((a, b) => Number(b.lifeStage === stage) - Number(a.lifeStage === stage))
    : services;

  return (
    <>
      {/* ---------------- stage selector ---------------- */}
      <section className="bg-cream-100 py-16 md:py-24" id="where-are-you">
        <div className="container-default px-5">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <p className="overline text-navy-600">Where are you right now?</p>
              <h2 className="mt-4 max-w-[20ch] font-display text-h2 font-extrabold text-navy-600">
                Everyone needs something different. Let's start with you.
              </h2>
            </div>
            <p className="text-body leading-relaxed text-warm-700 lg:pb-2">
              Three stages, three sets of decisions. Pick the one closest to your life and we'll
              work from there.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {stages.map((s) => {
              const on = stage === s.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => choose(s.id)}
                    aria-pressed={on}
                    className={`relative flex h-full w-full flex-col overflow-hidden rounded-[20px] border px-8 pb-8 pt-9 text-left transition-shadow ${
                      on ? "border-gold-400/50 shadow-[0_0_0_1px_rgba(224,180,87,0.35)]" : "border-cyan-300/14"
                    }`}
                    style={{ background: "linear-gradient(165deg,#0A2440 0%,#071A2E 70%,#04101F 100%)" }}
                  >
                    {/* icon watermark, glowing */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-[26px] -top-[26px] size-[170px] bg-contain bg-center bg-no-repeat"
                      style={{
                        backgroundImage: `url(/icons/cut-${s.icon}.png)`,
                        opacity: on ? 0.4 : 0.28,
                        filter: "drop-shadow(0 0 26px rgba(7,164,207,0.45))",
                      }}
                    />
                    <span
                      className={`relative font-display text-small font-extrabold tabular tracking-wide ${
                        on ? "text-gold-400" : "text-cyan-300/85"
                      }`}
                    >
                      {s.ageRange}
                    </span>
                    <span className="relative mt-[76px] font-display text-h3 font-extrabold leading-tight text-cream-50">
                      {s.label}
                    </span>
                    <span className="relative mt-3.5 max-w-[26ch] text-body leading-relaxed text-cream-50/68">
                      {s.description}
                    </span>
                    <span
                      className={`relative mt-6 flex items-center gap-2.5 text-small font-bold ${
                        on ? "text-gold-400" : "text-cream-50/60"
                      }`}
                    >
                      {on ? "Showing these first" : "Start here"} <span aria-hidden="true" className="text-body">→</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------------- services ---------------- */}
      <section className="bg-cream-50 py-16 md:py-24" id="services">
        <div className="container-default px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="overline text-navy-600">What I help with</p>
              <h2 className="mt-4 font-display text-h2 font-extrabold text-navy-600">
                Eight ways to protect what you're building
              </h2>
            </div>
            {activeStage && (
              <p className="text-small text-warm-500">
                Ordered for <strong className="text-warm-900">{activeStage.label}</strong>.{" "}
                <button type="button" onClick={() => choose(activeStage.id)} className="font-bold text-navy-600 underline underline-offset-4">
                  Change
                </button>
              </p>
            )}
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ordered.map((s) => {
              const dim = stage !== null && s.lifeStage !== stage;
              return (
                <li key={s.slug}>
                  <a
                    href={`/services/${s.slug}`}
                    className={`group flex h-full flex-col rounded-[20px] border bg-white p-7 transition-all hover:-translate-y-0.5 hover:border-navy-400 ${
                      dim ? "border-warm-200 opacity-55 hover:opacity-100" : "border-warm-200"
                    }`}
                  >
                    <span className="flex size-11 items-center justify-center rounded-[10px] bg-cream-100">
                      <img
                        src={`/icons/cut-${s.icon}.png`}
                        alt="" width="28" height="28" loading="lazy" decoding="async"
                        className="size-7 object-contain"
                      />
                    </span>
                    <span className="mt-5 font-display text-h4 font-bold leading-snug text-ink-900">{s.title}</span>
                    <span className="mt-2.5 flex-1 text-small leading-relaxed text-warm-700">{s.short}</span>
                    <span className="mt-6 flex items-center justify-between gap-3">
                      <span className="rounded-md bg-navy-50 px-3 py-1.5 text-caption font-bold text-navy-600">
                        {stageLabel(s.lifeStage)}
                      </span>
                      <span aria-hidden="true" className="text-h4 text-warm-500 transition-transform group-hover:translate-x-0.5 group-hover:text-navy-600">
                        →
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
