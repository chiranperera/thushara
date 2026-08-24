/**
 * Hero icon carousel.
 *
 * Ported from the `Component` class in "03 Home.dc.html": eight icons
 * orbit a centre slot, advancing every 2s, with scale and opacity
 * falling away by distance and the centre one glowing.
 *
 * Additions the design file didn't need but a real page does:
 *  - stops when scrolled out of view or the tab is hidden, so it isn't
 *    burning a timer and repaints on a phone nobody is looking at
 *  - honours prefers-reduced-motion by holding still
 *  - decorative, so aria-hidden; every service is reachable from the
 *    grid below.
 */

import { useEffect, useRef, useState } from "react";

export interface CarouselIcon {
  icon: string;
  label: string;
}

interface Props {
  icons: CarouselIcon[];
  /** Slot spacing and icon size. Halved under 1280px. */
  spacing?: number;
  size?: number;
  intervalMs?: number;
}

// Distance from centre -> scale / opacity. Straight from the design.
const SCALE = [1, 0.68, 0.44];
const ALPHA = [1, 0.75, 0.4];

export default function IconCarousel({
  icons,
  spacing = 150,
  size = 140,
  intervalMs = 2000,
}: Props) {
  const [index, setIndex] = useState(0);
  const [compact, setCompact] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useRef(true);

  // Narrow viewports get a tighter orbit so five slots still fit.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1279px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer) return;
      timer = setInterval(() => setIndex((i) => i + 1), intervalMs);
    };
    const stop = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    };

    const evaluate = () => (visible.current && !document.hidden ? start() : stop());

    const io = el
      ? new IntersectionObserver(
          ([e]) => {
            visible.current = e.isIntersecting;
            evaluate();
          },
          { threshold: 0.1 },
        )
      : null;
    io?.observe(el!);

    document.addEventListener("visibilitychange", evaluate);
    evaluate();

    return () => {
      stop();
      io?.disconnect();
      document.removeEventListener("visibilitychange", evaluate);
    };
  }, [intervalMs]);

  const n = icons.length;
  const sp = compact ? spacing * 0.62 : spacing;
  const sz = compact ? size * 0.62 : size;
  const centre = icons[((index % n) + n) % n];

  return (
    <div ref={ref} aria-hidden="true" className="select-none">
      <div className="relative h-[150px] overflow-hidden" style={{ height: sz + 10 }}>
        {icons.map((item, i) => {
          // Shortest signed distance from the active index, wrapped.
          let p = (((i - index) % n) + n) % n;
          if (p > n / 2) p -= n;
          const a = Math.abs(p);
          const shown = a <= 2;

          return (
            <img
              key={item.icon}
              src={`/icons/cut-${item.icon}.png`}
              alt=""
              width={Math.round(sz)}
              height={Math.round(sz)}
              loading="lazy"
              decoding="async"
              className="pointer-events-none absolute left-1/2 top-1/2 object-contain"
              style={{
                width: `${sz}px`,
                height: `${sz}px`,
                marginLeft: `${-sz / 2}px`,
                marginTop: `${-sz / 2}px`,
                transform: `translateX(${p * sp}px) scale(${shown ? SCALE[a] : 0.3})`,
                opacity: shown ? ALPHA[a] : 0,
                filter: `drop-shadow(0 0 ${a === 0 ? 34 : 16}px rgba(46,214,196,${a === 0 ? 0.6 : 0.35}))`,
                // Icons wrapping round the back must not animate across
                // the whole width — they teleport instead.
                transition:
                  a <= 3
                    ? "transform 480ms cubic-bezier(.4,0,.2,1), opacity 480ms ease, filter 480ms ease"
                    : "none",
              }}
            />
          );
        })}
      </div>

      <p
        className="mt-1.5 h-8 text-center font-display text-h4 font-semibold tracking-[-0.02em] text-cyan-500/50"
        style={{ transition: "opacity 240ms ease" }}
      >
        {centre.label}
      </p>
    </div>
  );
}
