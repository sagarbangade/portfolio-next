"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Award, BadgeCheck, Clock, GraduationCap, MapPin, ScrollText } from "lucide-react";
import type { Education } from "@/lib/data";
import { emitSignal } from "@/lib/ui-store";

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const kindMeta = {
  degree: { label: "Degree", icon: GraduationCap },
  diploma: { label: "Diploma", icon: Award },
  course: { label: "Course", icon: ScrollText },
} as const;

/**
 * Education as a scroll story: a pinned photo panel where each school's image wipes up over the
 * last and settles out of a slow zoom, while its card scrolls past alongside. Progress p runs from
 * 0 (before the first card) to n (arrived at the last); frames only run while p is still moving.
 */
export function EducationJourney({ items }: { items: Education[] }) {
  const n = items.length;
  const panelRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const measure = () => {
      const centers = cardRefs.current.map((c) => {
        if (!c) return 0;
        const r = c.getBoundingClientRect();
        return r.top + r.height / 2;
      });
      const vh = window.innerHeight;
      const pr = panel.getBoundingClientRect();
      const focus = desktop.matches ? vh * 0.5 : pr.bottom + (vh - pr.bottom) * 0.42;
      if (focus <= centers[0]) return clamp(1 - (centers[0] - focus) / (n > 1 ? centers[1] - centers[0] : vh));
      if (focus >= centers[n - 1]) return n;
      for (let i = 0; i < n - 1; i++) {
        if (focus < centers[i + 1]) return i + 1 + (focus - centers[i]) / (centers[i + 1] - centers[i]);
      }
      return n;
    };

    let p = -1;
    let shown = -1;
    let raf = 0;
    let last = 0;

    const paint = () => {
      layerRefs.current.forEach((layer, i) => {
        if (!layer) return;
        // Image i is fully in at p = i + 1. It wipes up from the bottom during the scroll before that.
        const reveal = i === 0 ? 1 : smooth(0.08, 0.92, p - i);
        const leave = smooth(0.08, 0.92, p - (i + 1));
        // Zoomed in while it arrives (the first image zooms as the section scrolls in), settles at 1.04,
        // then eases back slightly as the next one covers it.
        const arriving = i === 0 ? clamp(1 - p) : 1 - reveal;
        const scale = reduced ? 1 : 1.04 + 0.16 * arriving + 0.05 * leave;
        layer.style.clipPath = `inset(${((1 - reveal) * 100).toFixed(2)}% 0 0 0)`;
        layer.style.transform = `scale(${scale.toFixed(4)}) translateY(${(leave * -3).toFixed(2)}%)`;
        const shade = shadeRefs.current[i];
        if (shade) shade.style.opacity = String((leave * 0.6).toFixed(3));
      });
      barRefs.current.forEach((b, i) => {
        if (b) b.style.transform = `scaleX(${clamp(p - i).toFixed(3)})`;
      });
      const nearest = clamp(Math.round(p) - 1, 0, n - 1);
      const idx = shown === -1 || Math.abs(p - (shown + 1)) > 0.62 ? nearest : shown;
      if (idx !== shown) {
        shown = idx;
        setActive(idx);
        emitSignal("education:step", { id: items[idx].id });
      }
    };

    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const target = measure();
      p = p < 0 || reduced ? target : p + (target - p) * (1 - Math.exp(-dt * 7));
      paint();
      // Keep going only while catching up with the scroll; stop once settled.
      if (Math.abs(target - p) > 0.0005) raf = requestAnimationFrame(frame);
      else {
        raf = 0;
        last = 0;
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    kick();
    setReady(true);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, [items, n]);

  const current = items[active];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
      <div ref={panelRef} className="sticky top-[4.75rem] z-10 h-[42vh] min-w-0 self-start sm:h-[50vh] lg:top-24 lg:h-[calc(100vh-8rem)] lg:max-h-[760px]">
        <div className="relative h-full overflow-hidden rounded-3xl border border-line bg-elev shadow-2xl shadow-black/25" data-testid="education-panel">
          {items.map((e, i) => (
            <div
              key={e.id}
              ref={(el) => {
                layerRefs.current[i] = el;
              }}
              className="absolute inset-0 will-change-transform"
              style={{ clipPath: i === 0 ? "inset(0 0 0 0)" : "inset(100% 0 0 0)", zIndex: i }}
            >
              <Visual item={e} priority={i === 0} />
              <div
                ref={(el) => {
                  shadeRefs.current[i] = el;
                }}
                className="absolute inset-0 bg-black opacity-0"
              />
            </div>
          ))}

          <div aria-hidden className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/20 to-black/45" />

          <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between p-4 sm:p-5">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white/90 backdrop-blur">
              <MapPin className="size-3.5" /> {placeLabel(current)}
            </p>
            <div className="text-right">
              <p className="font-mono text-[11px] text-white/70">
                <span className="text-white">{String(active + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
              </p>
              <div className="mt-2 flex justify-end gap-1">
                {items.map((e, i) => (
                  <span key={e.id} className="h-0.5 w-6 overflow-hidden rounded-full bg-white/25">
                    <span
                      ref={(el) => {
                        barRefs.current[i] = el;
                      }}
                      className="block h-full w-full origin-left bg-accent"
                      style={{ transform: i === 0 ? "scaleX(1)" : "scaleX(0)" }}
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 p-4 sm:p-6">
            <div key={current.id} className="fade-up">
              <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
                {current.period} · {current.location}
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-3xl">{current.school}</p>
              <p className="mt-0.5 text-sm text-white/75">{current.title}</p>
            </div>
          </div>
        </div>
        {current.visual.type === "photo" && current.visual.credit && (
          <p className="mt-2 hidden truncate px-1 text-[11px] text-subtle lg:block">
            Photo:{" "}
            <a href={current.visual.credit.url} target="_blank" rel="noreferrer" className="underline-offset-2 hover:text-fg hover:underline">
              {current.visual.credit.label}
            </a>
          </p>
        )}
      </div>

      <ol className="relative min-w-0 lg:py-[10vh]">
        {items.map((e, i) => {
          const on = active === i;
          const Kind = kindMeta[e.kind];
          return (
            <li
              key={e.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              data-testid={`edu-${e.id}`}
              className="flex min-h-[64vh] items-center py-6 lg:min-h-[72vh]"
            >
              <article
                aria-labelledby={`edu-title-${e.id}`}
                className={`w-full rounded-2xl border bg-elev p-6 transition duration-500 sm:p-8 ${
                  !ready || on ? "border-line-strong opacity-100" : "border-line opacity-45"
                } ${on ? "shadow-2xl shadow-black/20 lg:-translate-x-1" : ""}`}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-subtle">
                  <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-0.5 text-muted">
                    <Kind.icon className="size-3.5 text-accent" /> {Kind.label}
                  </span>
                  <span>{e.period}</span>
                </div>
                <h3 id={`edu-title-${e.id}`} className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
                  {e.title}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <MapPin className="size-3.5 shrink-0" /> {e.school} · {e.location}
                </p>
                <p className="mt-4 text-pretty text-[15px] leading-relaxed text-fg/85">{e.summary}</p>

                <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                  <div className="flex items-start gap-2 rounded-xl border border-line bg-surface/60 px-3 py-2.5">
                    <BadgeCheck className="mt-0.5 size-4 shrink-0 text-accent" />
                    <div className="min-w-0">
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-subtle">Awarded by</dt>
                      <dd className="mt-0.5 text-pretty text-[13px] leading-snug text-fg/90">{e.awardedBy}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl border border-line bg-surface/60 px-3 py-2.5">
                    <Clock className="mt-0.5 size-4 shrink-0 text-accent" />
                    <div className="min-w-0">
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-subtle">Format</dt>
                      <dd className="mt-0.5 text-pretty text-[13px] leading-snug text-fg/90">{e.format}</dd>
                    </div>
                  </div>
                </dl>

                <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-subtle">What it covered</p>
                <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`Topics in ${e.title}`}>
                  {e.topics.map((t) => (
                    <li key={t} className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-muted">
                      {t}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  {e.kind !== "course" ? (
                    <p className="inline-flex items-baseline gap-2 rounded-xl border border-accent/30 bg-accent-soft px-3 py-1.5">
                      <span className="text-lg font-semibold tracking-tight text-accent">{e.note}</span>
                      <span className="text-xs text-muted">{e.kind === "degree" ? "final CGPA" : "final score"}</span>
                    </p>
                  ) : (
                    <span className="font-mono text-xs text-subtle">Certificate course</span>
                  )}
                  {e.link && (
                    <a
                      href={e.link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-accent"
                    >
                      {e.link.label} <ArrowUpRight className="size-4" />
                    </a>
                  )}
                </div>
                {e.visual.type === "photo" && e.visual.credit && (
                  <p className="mt-5 text-[11px] leading-relaxed text-subtle lg:hidden">
                    Photo:{" "}
                    <a href={e.visual.credit.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                      {e.visual.credit.label}
                    </a>
                  </p>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function placeLabel(e: Education) {
  if (e.visual.type === "photo") return e.visual.caption;
  if (e.visual.type === "remote") return "Remote · online";
  return `${e.school.length > 24 ? e.visual.mark : e.school}, ${e.location}`;
}

function Visual({ item, priority }: { item: Education; priority: boolean }) {
  const v = item.visual;
  if (v.type === "photo") {
    // The desktop panel is tall and campus photos are wide, so show the whole photo there over a
    // blurred copy of itself instead of cropping signage off the sides.
    return (
      <>
        <Image src={v.src} alt="" aria-hidden fill sizes="640px" className="hidden scale-110 object-cover opacity-70 blur-2xl lg:block" />
        <Image
          src={v.src}
          alt={v.alt}
          fill
          sizes="(min-width: 1024px) 640px, 100vw"
          className="object-cover lg:object-contain"
          style={{ objectPosition: v.position }}
          priority={priority}
        />
      </>
    );
  }
  if (v.type === "remote") return <RemoteScreen />;
  return <BrandPanel mark={v.mark} logo={v.logo} color={v.color} name={item.school} />;
}

/**
 * For schools with no accurate campus photo online: the institute's own logo (when it publishes
 * one) or its name, set large on a grid lit in its colour. Accurate, rather than a stand-in building.
 */
function BrandPanel({ mark, logo, color, name }: { mark: string; logo?: string; color: string; name: string }) {
  return (
    <div
      className="absolute inset-0 grid place-items-center overflow-hidden bg-[#0b0b0d]"
      style={{ backgroundImage: `radial-gradient(ellipse 80% 60% at 50% 35%, ${color}38, transparent 70%)` }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "44px 44px" }}
      />
      <div className="relative -mt-16 flex flex-col items-center px-6 text-center">
        {logo ? (
          <span className="grid size-28 place-items-center rounded-3xl border border-white/10 bg-white/95 p-4 shadow-2xl shadow-black/50 sm:size-36">
            <Image src={logo} alt={`${name} logo`} width={120} height={134} className="h-full w-auto object-contain" />
          </span>
        ) : (
          <span className="font-semibold leading-none tracking-[-0.05em] text-white/95" style={{ fontSize: "clamp(3.5rem, 11vw, 8rem)" }}>
            {mark}
          </span>
        )}
        <span className="mt-5 h-px w-16" style={{ background: color }} />
        <span className="mt-4 max-w-xs font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">{name}</span>
      </div>
    </div>
  );
}

/** Masai School was remote, so instead of a campus photo it gets the screen it happened on. */
function RemoteScreen() {
  const lines: [string, string][] = [
    ["const", " stack = ["],
    ["", '  "MongoDB", "Express",'],
    ["", '  "React", "Node.js",'],
    ["", "];"],
    ["", ""],
    ["await", " ship(stack, { remote: true });"],
  ];
  return (
    <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_top,#2a1a12,transparent_60%),linear-gradient(#0d0d0f,#0a0a0b)] p-6">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#111113] font-mono text-[12px] shadow-2xl shadow-black/60 sm:text-[13px]">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-[11px] text-white/45">masai/mern-stack.ts</span>
        </div>
        <div className="space-y-1 p-4 text-white/80">
          {lines.map(([kw, rest], i) => (
            <p key={i} className="flex gap-4 whitespace-pre">
              <span className="w-4 select-none text-right text-white/25">{i + 1}</span>
              <span>
                <span className="text-[#ff7a45]">{kw}</span>
                {rest}
              </span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
