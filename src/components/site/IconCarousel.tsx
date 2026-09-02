/**
 * Hero icon carousel.
 *
 * Eight icons drift continuously right to left through a centre slot,
 * growing and brightening as they pass it. The design file stepped one
 * slot every 2s; continuous motion at the same pace reads as a carousel
 * rather than a slideshow, which is what it is.
 *
 * Position, scale and opacity are written straight to the elements in a
 * rAF loop rather than through state — at 60fps a React render per
 * frame would be absurd for eight images. The only state here is the
 * caption, which changes eight times a minute.
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
  /** Slot spacing and icon size. Tightened under 1280px. */
  spacing?: number;
  size?: number;
  /** Time to travel one slot. */
  intervalMs?: number;
}

/** Distance from centre, in slots -> scale / opacity. From the design. */
const SCALE = [1, 0.68, 0.44, 0.24];
const ALPHA = [1, 0.75, 0.4, 0];

/** Piecewise-linear read of the curves above at a fractional distance. */
function at(curve: number[], d: number) {
  if (d >= curve.length - 1) return curve[curve.length - 1];
  const i = Math.floor(d);
  return curve[i] + (curve[i + 1] - curve[i]) * (d - i);
}

/** Signed distance from the centre slot, wrapped the short way round. */
function slot(i: number, offset: number, n: number) {
  let p = (((i - offset) % n) + n) % n;
  if (p > n / 2) p -= n;
  return p;
}

export default function IconCarousel({
  icons,
  spacing = 150,
  size = 140,
  intervalMs = 2000,
}: Props) {
  const [centre, setCentre] = useState(0);
  const [compact, setCompact] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLImageElement | null)[]>([]);
  const caption = useRef<HTMLParagraphElement>(null);
  const offset = useRef(0);
  const shown = useRef(0);
  const onscreen = useRef(true);

  // Narrow viewports get a tighter orbit so five slots still fit.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1279px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const n = icons.length;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sp = compact ? spacing * 0.62 : spacing;

    // Lay the icons out for a given offset, measured in slots travelled.
    const paint = (o: number) => {
      for (let i = 0; i < n; i++) {
        const el = items.current[i];
        if (!el) continue;

        // Wrapped, so an icon leaving on the left reappears on the
        // right rather than flying back across the whole row.
        const p = slot(i, o, n);
        const d = Math.abs(p);
        const near = Math.max(0, 1 - d); // 1 at dead centre, 0 a slot out
        el.style.transform = `translate3d(${p * sp}px,0,0) scale(${at(SCALE, d)})`;
        el.style.opacity = `${at(ALPHA, d)}`;
        el.style.filter = `drop-shadow(0 0 ${16 + near * 18}px rgba(7,164,207,${0.35 + near * 0.25}))`;
      }

      // The caption belongs to whichever icon is nearest the centre, and
      // fades out through the handover so it never appears to mislabel.
      const nearest = Math.round(o);
      const frac = Math.abs(o - nearest);
      if (caption.current) {
        caption.current.style.opacity = `${Math.max(0, 1 - frac * 2.4)}`;
      }
      const c = ((nearest % n) + n) % n;
      if (c !== shown.current) {
        shown.current = c;
        setCentre(c);
      }
    };

    paint(offset.current);
    if (still) return;

    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
      if (last) offset.current = (offset.current + (now - last) / intervalMs) % n;
      last = now;
      paint(offset.current);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf) return;
      last = 0; // don't jump by however long we were paused
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const evaluate = () => (onscreen.current && !document.hidden ? start() : stop());

    const el = wrap.current;
    const io = el
      ? new IntersectionObserver(
          ([e]) => {
            onscreen.current = e.isIntersecting;
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
  }, [icons.length, spacing, intervalMs, compact]);

  const sz = compact ? size * 0.62 : size;

  /**
   * Headroom for the glow. The row has to keep `overflow: hidden` so an
   * icon fading in at the far edge doesn't drift across the hero — CSS
   * can't clip one axis and not the other. So instead the box grows by
   * GLOW on all four sides and pulls the same amount back in as
   * negative margin: the glow gets room to fall off naturally, and the
   * surrounding layout sits exactly where it did before.
   */
  const GLOW = 44;
  // The whole block is pointer-events-none: the taller box reaches up
  // behind the CTA button above it, and this row is decorative.

  return (
    <div ref={wrap} aria-hidden="true" className="pointer-events-none select-none">
      <div
        className="relative overflow-hidden"
        style={{ height: sz + 10 + GLOW * 2, marginTop: -GLOW, marginBottom: -GLOW }}
      >
        {icons.map((item, i) => (
          <img
            key={item.icon}
            ref={(el) => {
              items.current[i] = el;
            }}
            src={`/icons/cut-${item.icon}.png`}
            alt=""
            width={Math.round(sz)}
            height={Math.round(sz)}
            decoding="async"
            className="pointer-events-none absolute left-1/2 top-1/2 object-contain will-change-transform"
            style={{
              width: `${sz}px`,
              height: `${sz}px`,
              marginLeft: `${-sz / 2}px`,
              marginTop: `${-sz / 2}px`,
              // The first frame, rendered on the server so the row is
              // never blank before the island hydrates. From here the
              // rAF loop writes these three directly; React leaves them
              // alone because this object doesn't change between
              // renders.
              transform: `translate3d(${slot(i, 0, icons.length) * (compact ? spacing * 0.62 : spacing)}px,0,0) scale(${at(SCALE, Math.abs(slot(i, 0, icons.length)))})`,
              opacity: at(ALPHA, Math.abs(slot(i, 0, icons.length))),
              filter: `drop-shadow(0 0 ${i === 0 ? 34 : 16}px rgba(7,164,207,${i === 0 ? 0.6 : 0.35}))`,
            }}
          />
        ))}
      </div>

      <p
        ref={caption}
        className="mt-1.5 h-8 text-center font-display text-h4 font-semibold tracking-[-0.02em] text-cyan-500/50"
      >
        {icons[centre].label}
      </p>
    </div>
  );
}
