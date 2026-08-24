/**
 * Life-stage selector + the services grid it filters.
 *
 * One site cannot shout at three audiences at once. This resolves the
 * 60/30/10 weighting: the default visual language is calibrated to
 * newly qualified professionals, but every visitor gets a site that
 * feels made for them within one tap.
 *
 * Non-matching services are de-emphasised rather than removed —
 * nothing should feel hidden.
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
}

interface Props {
  stages: Stage[];
  services: ServiceCard[];
  iconBase?: string;
}

const STORAGE_KEY = "tr_life_stage";

export default function LifeStageServices({ stages, services, iconBase = "/icons" }: Props) {
  const [stage, setStage] = useState<string | null>(null);

  // Remember the choice for the session — the site should not forget
  // who someone said they were when they move between pages.
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

  // Matching services first, but everything stays on the page.
  const ordered = stage
    ? [...services].sort((a, b) => Number(b.lifeStage === stage) - Number(a.lifeStage === stage))
    : services;

  return (
    <>
      {/* ---------- selector ---------- */}
      <section className="bg-cream-100 py-16 md:py-24" id="where-are-you">
        <div className="container-default px-5">
          <p className="overline text-teal-400">Where are you right now?</p>
          <h2 className="mt-3 max-w-[20ch] font-display text-h2 font-extrabold text-ink-900">
            Everyone needs something different. Let's start with you.
          </h2>

          <ul className="mt-9 grid gap-4 md:grid-cols-3">
            {stages.map((s) => {
              const on = stage === s.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => choose(s.id)}
                    aria-pressed={on}
                    className={`flex h-full w-full flex-col items-start rounded-xl border-[1.5px] p-7 text-left transition-colors ${
                      on
                        ? "border-teal-400 bg-teal-100"
                        : "border-warm-200 bg-cream-50 hover:border-teal-300"
                    }`}
                  >
                    <span className="font-display text-h4 font-extrabold tabular text-gold-600">{s.ageRange}</span>
                    <span className="mt-2 font-display text-h3 font-extrabold text-ink-900">{s.label}</span>
                    <span className="mt-2 text-body leading-relaxed text-warm-700">{s.description}</span>
                    <span className={`mt-5 text-body font-bold ${on ? "text-teal-600" : "text-teal-600"}`}>
                      {on ? "Showing these first ✓" : "Start here →"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------- services ---------- */}
      <section className="bg-cream-50 py-16 md:py-24" id="services">
        <div className="container-default px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="overline text-teal-400">What I help with</p>
              <h2 className="mt-3 font-display text-h2 font-extrabold text-ink-900">
                Eight ways to protect what you're building
              </h2>
            </div>
            {activeStage && (
              <p className="text-small text-warm-500">
                Ordered for <strong className="text-warm-900">{activeStage.label}</strong>.{" "}
                <button type="button" onClick={() => choose(activeStage.id)} className="font-bold text-teal-600 underline underline-offset-4">
                  Change
                </button>
              </p>
            )}
          </div>

          <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ordered.map((s) => {
              const dim = stage !== null && s.lifeStage !== stage;
              return (
                <li key={s.slug}>
                  <a
                    href={`/services/${s.slug}`}
                    className={`group flex h-full flex-col rounded-xl border border-warm-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-teal-400 ${
                      dim ? "opacity-55 hover:opacity-100" : ""
                    }`}
                  >
                    <img
                      src={`${iconBase}/cut-${s.icon}.png`}
                      alt=""
                      width="40" height="40" loading="lazy" decoding="async"
                      className="size-10 object-contain"
                    />
                    <span className="mt-4 font-display text-h4 font-bold text-ink-900">{s.title}</span>
                    <span className="mt-2 flex-1 text-small leading-relaxed text-warm-700">{s.short}</span>
                    <span className="mt-4 text-caption font-bold uppercase tracking-wider text-warm-500">
                      {stages.find((x) => x.id === s.lifeStage)?.label ?? "All stages"}
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
