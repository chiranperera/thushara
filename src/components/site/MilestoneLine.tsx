/**
 * The Milestone Line — the site's signature component.
 *
 * Layout follows "03 Home.dc.html" exactly: ages and milestone labels
 * sit ABOVE the rule, the nodes sit ON it, product links BELOW, and the
 * expanded card is offset beneath the active node rather than running
 * full width.
 *
 * Horizontal on desktop; a vertical spine on mobile, because
 * compressing six nodes into 390px would be unreadable.
 */

import { useEffect, useRef, useState } from "react";

export interface Node {
  age: number;
  milestone: string;
  note?: string;
  linkLabel: string;
  href: string;
}

interface Props {
  nodes: Node[];
  initialActive?: number;
}

export default function MilestoneLine({ nodes, initialActive = 1 }: Props) {
  const [active, setActive] = useState(initialActive);
  const [drawn, setDrawn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Draw once on first view; never re-trigger on scroll back.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setDrawn(true);
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setDrawn(true), io.disconnect()),
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const n = nodes.length;
  const activeNode = nodes[active];

  // The gold fill stops at the CENTRE OF THE NODE, and the nodes sit at
  // the start of their grid cells, not the middle. So it is
  // (column width x index) + (gaps so far) + half the node, where the
  // active node is 24px wide and the rest 16px.
  const fillWidth = drawn
    ? `calc((100% - ${(n - 1) * 16}px) / ${n} * ${active} + ${active * 16 + 12}px)`
    : "0px";

  return (
    <div ref={ref}>
      {/* ---------------- desktop ---------------- */}
      <div className="hidden md:block">
        {/* ages + milestones */}
        <div className="grid items-end gap-4" style={{ gridTemplateColumns: `repeat(${n},minmax(0,1fr))`, minHeight: 96 }}>
          {nodes.map((node, i) => {
            const on = i <= active;
            return (
              <button
                key={node.age}
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                aria-pressed={i === active}
                className="text-left outline-offset-4"
              >
                <span
                  className={`block font-display text-[26px] font-extrabold tabular transition-colors ${
                    on ? "text-gold-400" : "text-cream-50/55"
                  }`}
                >
                  {node.age}
                </span>
                <span className={`mt-1 block text-body font-bold transition-colors ${on ? "text-cream-50" : "text-cream-50/80"}`}>
                  {node.milestone}
                </span>
              </button>
            );
          })}
        </div>

        {/* the rule + nodes */}
        <div className="relative mt-6 h-6">
          <span className="absolute inset-x-0 top-[11px] h-0.5 bg-teal-500/40" aria-hidden="true" />
          <span
            className="absolute left-0 top-[11px] h-0.5 bg-gold-500 transition-[width] duration-700 ease-out"
            style={{ width: fillWidth }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 grid items-center gap-4" style={{ gridTemplateColumns: `repeat(${n},minmax(0,1fr))` }} aria-hidden="true">
            {nodes.map((node, i) => (
              <span key={node.age} className="block">
                {i === active ? (
                  <span className="block size-6 rounded-full bg-gold-500 shadow-[0_0_0_6px_rgba(201,150,47,0.18)] transition-all" />
                ) : i < active ? (
                  <span className="block size-4 rounded-full bg-gold-500 transition-all" />
                ) : (
                  <span className="block size-4 rounded-full border-2 border-teal-500 bg-ink-900 transition-all" />
                )}
              </span>
            ))}
          </div>
        </div>

        {/* product links */}
        <div className="mt-6 grid items-start gap-4" style={{ gridTemplateColumns: `repeat(${n},minmax(0,1fr))` }}>
          {nodes.map((node, i) => (
            <a
              key={node.age}
              href={node.href}
              className={`text-small transition-colors ${i === active ? "font-bold text-gold-400" : "text-teal-300 hover:text-gold-400"}`}
            >
              {node.linkLabel} →
            </a>
          ))}
        </div>

        {/* expanded card, offset under the active node */}
        <div className="mt-7 grid gap-4" style={{ gridTemplateColumns: `repeat(${n},minmax(0,1fr))` }}>
          <div
            className="rounded-[20px] border border-cyan-300/14 bg-cream-50/5 p-7"
            style={{ gridColumn: `${Math.min(active + 1, n - 1)} / span 2` }}
          >
            <p className="overline text-gold-400">
              Age {activeNode.age} · Active
            </p>
            <p className="mt-2 font-display text-h4 font-bold text-cream-50">{activeNode.milestone}</p>
            {activeNode.note && (
              <p className="mt-2.5 text-body leading-relaxed text-cream-50/70">{activeNode.note}</p>
            )}
            <a href={activeNode.href} className="mt-4 inline-block text-body font-bold text-gold-400 hover:text-gold-300">
              Read more →
            </a>
          </div>
        </div>
      </div>

      {/* ---------------- mobile: vertical spine ---------------- */}
      <ul className="relative md:hidden">
        <span className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-teal-500/40" aria-hidden="true" />
        {nodes.map((node, i) => (
          <li key={node.age} className="relative pb-8 pl-8 last:pb-0">
            <span
              className={`absolute left-0 top-1.5 block size-4 rounded-full ${
                i <= active ? "bg-gold-500" : "border-2 border-teal-500 bg-ink-900"
              }`}
              aria-hidden="true"
            />
            <span className="font-display text-[22px] font-extrabold tabular text-gold-400">{node.age}</span>
            <p className="mt-0.5 text-body font-bold text-cream-50">{node.milestone}</p>
            {node.note && <p className="mt-2 text-small leading-relaxed text-cream-50/65">{node.note}</p>}
            <a href={node.href} className="mt-2.5 inline-block text-small font-bold text-teal-300">
              {node.linkLabel} →
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
