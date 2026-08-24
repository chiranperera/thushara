/**
 * The Milestone Line — the site's signature component.
 *
 * Thushara's business is not eight products; it is one relationship
 * entered at different points. Showing a 29-year-old buying motor cover
 * that five more decisions are coming, and that this is the person who
 * will be there for them, *is* the pitch — made visual instead of said.
 *
 * Horizontal on desktop. Rotates to vertical on mobile: compressing the
 * horizontal version would make it unreadable.
 */

import { useEffect, useRef, useState } from "react";

export interface Node {
  age: number;
  milestone: string;
  note?: string;
  links: { label: string; href: string }[];
}

interface Props {
  nodes: Node[];
  /** Preselects the node matching a chosen life stage. */
  initialActive?: number;
}

export default function MilestoneLine({ nodes, initialActive = 1 }: Props) {
  const [active, setActive] = useState(initialActive);
  const [drawn, setDrawn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Draw once on first view. Never re-trigger on scroll back.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const activeNode = nodes[active];

  return (
    <div ref={ref}>
      {/* ---------------- desktop ---------------- */}
      <div className="hidden md:block">
        <div className="relative">
          {/* the line */}
          <div className="absolute left-0 right-0 top-6 h-px bg-teal-500/40" aria-hidden="true" />
          <div
            className="absolute left-0 top-6 h-px bg-gold-500 transition-[width] duration-700 ease-out"
            style={{ width: drawn ? `${(active / (nodes.length - 1)) * 100}%` : "0%" }}
            aria-hidden="true"
          />

          <ul className="relative grid" style={{ gridTemplateColumns: `repeat(${nodes.length}, minmax(0,1fr))` }}>
            {nodes.map((n, i) => {
              const isActive = i === active;
              return (
                <li key={n.age} className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    aria-pressed={isActive}
                    className="group flex flex-col items-center outline-offset-4"
                  >
                    <span className="font-display text-h4 font-extrabold tabular text-cream-50">{n.age}</span>
                    <span
                      className={`mt-2.5 block rounded-full border-2 transition-all duration-200 ${
                        isActive
                          ? "size-4 border-gold-500 bg-gold-500"
                          : "size-3 border-gold-500/60 bg-ink-900 group-hover:border-gold-400"
                      }`}
                      style={{
                        opacity: drawn ? 1 : 0,
                        transitionDelay: drawn ? `${i * 80}ms` : "0ms",
                      }}
                    />
                    <span
                      className={`mt-3.5 max-w-[15ch] text-center text-small leading-snug transition-colors ${
                        isActive ? "font-bold text-cream-50" : "text-cream-50/60"
                      }`}
                    >
                      {n.milestone}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* expanded card for the active node */}
        <div className="mt-10 rounded-xl border border-cream-50/12 bg-cream-50/5 p-8">
          <p className="overline text-gold-400">Age {activeNode.age}</p>
          <p className="mt-2.5 font-display text-h3 font-extrabold text-cream-50">{activeNode.milestone}</p>
          {activeNode.note && (
            <p className="mt-3 max-w-[62ch] text-body leading-relaxed text-cream-50/78">{activeNode.note}</p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            {activeNode.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="inline-flex min-h-12 items-center rounded-full border-[1.5px] border-cream-50/25 px-6 text-body font-bold text-cream-50 transition-colors hover:border-gold-400 hover:text-gold-400"
              >
                {l.label} →
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- mobile: vertical spine ---------------- */}
      <ul className="relative md:hidden">
        <span className="absolute left-[7px] top-2 bottom-2 w-px bg-teal-500/40" aria-hidden="true" />
        {nodes.map((n, i) => (
          <li key={n.age} className="relative pl-8 pb-8 last:pb-0">
            <span
              className={`absolute left-0 top-1.5 block rounded-full border-2 ${
                i <= active ? "size-4 border-gold-500 bg-gold-500" : "size-4 border-gold-500/50 bg-ink-900"
              }`}
              aria-hidden="true"
            />
            <p className="font-display text-h4 font-extrabold tabular text-cream-50">
              {n.age}
              <span className="ml-2.5 font-sans text-body font-bold text-cream-50/80">{n.milestone}</span>
            </p>
            {n.note && <p className="mt-2 text-small leading-relaxed text-cream-50/65">{n.note}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {n.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="inline-flex min-h-11 items-center rounded-full border border-cream-50/25 px-4 text-small font-bold text-cream-50"
                >
                  {l.label} →
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
