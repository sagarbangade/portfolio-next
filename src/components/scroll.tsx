"use client";

import { useEffect, useRef } from "react";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Counts the last number in `value` up from zero (or from the first number, for "16 → 19") the
 * first time it scrolls into view. The server renders the final value, so crawlers and no-JS
 * visitors always see the real figure; the text is driven directly so React never re-renders.
 */
export function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const m = value.match(/^(.*?)([\d,]+)(\D*)$/);
    if (!el || !m || reducedMotion()) return;
    const [, prefix, raw, suffix] = m;
    const target = Number(raw.replace(/,/g, ""));
    const from = Number(prefix.match(/\d+/)?.[0] ?? 0);
    const fmt = (n: number) => `${prefix}${Math.round(n).toLocaleString("en-US")}${suffix}`;

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - t0) / duration);
          el.textContent = fmt(from + (target - from) * (1 - Math.pow(1 - t, 4)));
          if (t < 1) raf = requestAnimationFrame(step);
        };
        el.textContent = fmt(from);
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = value;
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}

/**
 * A list of sticky cards that stack like a deck: as each next card slides up over the one before,
 * the one underneath shrinks back and dims. Only on screens where a whole card fits (see the
 * `deck` variant in globals.css); elsewhere it's a normal list. Work happens on scroll only.
 */
export function StackDeck({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const deck = window.matchMedia("(min-width: 1024px) and (min-height: 720px)");
    let raf = 0;

    const update = () => {
      raf = 0;
      const items = [...list.children] as HTMLElement[];
      items.forEach((li, i) => {
        const card = li.firstElementChild as HTMLElement | null;
        if (!card) return;
        const next = items[i + 1];
        let p = 0;
        if (deck.matches && next && !reducedMotion()) {
          const a = li.getBoundingClientRect();
          const b = next.getBoundingClientRect();
          p = Math.min(1, Math.max(0, (a.bottom - b.top) / Math.max(1, a.height - 24)));
        }
        card.style.transform = p ? `scale(${1 - p * 0.06})` : "";
        card.style.setProperty("--dim", String(p));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    deck.addEventListener("change", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      deck.removeEventListener("change", onScroll);
    };
  }, []);

  return (
    <ol ref={ref} className={className}>
      {children}
    </ol>
  );
}
