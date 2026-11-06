"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { profile, projects, type Project } from "@/lib/data";
import { GitHubIcon } from "./icons";

/** A hue per card so the gallery reads as a set rather than six identical boxes. */
const tints = ["#ff5a1f", "#ffb020", "#3ddc84", "#4f9dff", "#b57bff", "#ff4f8b"];

/**
 * Side projects as a horizontal gallery. On desktop the section pins and vertical scroll slides
 * the track sideways; on phones (or with reduced motion) it's a native swipe carousel with snapping.
 * Work only happens while scrolling.
 */
export function ProjectGrid() {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const o = outer.current;
    const t = track.current;
    if (!o || !t) return;
    const desktop = window.matchMedia("(min-width: 1024px) and (min-height: 640px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let distance = 0;
    let raf = 0;

    const layout = () => {
      if (desktop.matches && !reduced.matches) {
        distance = Math.max(0, t.scrollWidth - window.innerWidth);
        o.style.height = `${distance + window.innerHeight}px`;
      } else {
        distance = 0;
        o.style.height = "";
        t.style.transform = "";
      }
      update();
    };
    const update = () => {
      raf = 0;
      if (!distance) return;
      const r = o.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
      t.style.transform = `translate3d(${(-p * distance).toFixed(1)}px,0,0)`;
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(3)})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(t);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", layout);
    desktop.addEventListener("change", layout);
    reduced.addEventListener("change", layout);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", layout);
      desktop.removeEventListener("change", layout);
      reduced.removeEventListener("change", layout);
    };
  }, []);

  return (
    <div ref={outer} className="relative mx-[calc(50%-50vw)]">
      <div className="overflow-hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center">
        <div
          ref={track}
          data-testid="project-grid"
          data-count={projects.length}
          className="hide-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-4 sm:scroll-px-6 overflow-x-auto px-4 pb-2 will-change-transform sm:gap-5 sm:px-6 lg:snap-none lg:overflow-visible lg:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] lg:pt-16"
        >
          {projects.map((p, i) => (
            <ProjectCard key={p.name} project={p} index={i} tint={tints[i % tints.length]} />
          ))}
          <a
            href={`${profile.github}?tab=repositories`}
            target="_blank"
            rel="noreferrer"
            className="group flex w-[78vw] max-w-[20rem] shrink-0 snap-start flex-col justify-between rounded-3xl border border-dashed border-line-strong p-7 transition hover:border-accent sm:w-[20rem]"
          >
            <GitHubIcon className="size-8 text-subtle transition group-hover:text-accent" />
            <span>
              <span className="block text-2xl font-semibold tracking-tight">More on GitHub</span>
              <span className="mt-2 block text-sm text-muted">Experiments, forks and everything else I&apos;m tinkering with.</span>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent">
                @{profile.githubUser} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </span>
            </span>
          </a>
        </div>

        <div className="mx-auto mt-8 hidden w-full max-w-6xl items-center gap-4 px-6 lg:flex">
          <span className="font-mono text-[11px] uppercase tracking-wider text-subtle">Scroll</span>
          <span className="h-px flex-1 overflow-hidden bg-line">
            <span ref={bar} className="block h-full w-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
          </span>
          <span className="font-mono text-[11px] text-subtle">{String(projects.length).padStart(2, "0")} projects</span>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project: p, index, tint }: { project: Project; index: number; tint: string }) {
  const primary = p.live ?? p.repo;
  const initials = p.name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <article
      data-spotlight
      data-testid="project-card"
      style={{ "--tint": tint } as React.CSSProperties}
      className="group relative flex w-[82vw] max-w-[25rem] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-line bg-elev transition duration-300 hover:-translate-y-1 hover:border-line-strong sm:w-[25rem]"
    >
      <div
        aria-hidden
        className="relative h-36 overflow-hidden border-b border-line"
        style={{ background: `radial-gradient(120% 120% at 15% 0%, color-mix(in srgb, ${tint} 38%, transparent), transparent 65%), var(--surface)` }}
      >
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <span className="absolute left-6 top-5 font-mono text-[11px] text-fg/60">{String(index + 1).padStart(2, "0")}</span>
        <span className="absolute right-6 top-5 font-mono text-[11px] text-fg/60">{p.year}</span>
        <span
          className="absolute -bottom-5 right-5 font-serif text-[6.5rem] italic leading-none transition duration-500 group-hover:-translate-y-1"
          style={{ color: tint, opacity: 0.85 }}
        >
          {initials}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-semibold tracking-tight">
          <a href={primary} target="_blank" rel="noreferrer" className="after:absolute after:inset-0 after:rounded-3xl">
            {p.name}
          </a>
        </h3>
        <p className="mt-2 flex-1 text-pretty text-sm leading-relaxed text-muted">{p.blurb}</p>
        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tech stack">
          {p.stack.map((s) => (
            <li key={s} className="rounded-full border border-line bg-surface px-2.5 py-0.5 font-mono text-[11px] text-muted">
              {s}
            </li>
          ))}
        </ul>
        <div className="relative z-10 mt-5 flex items-center gap-2 border-t border-line pt-4 text-xs">
          {p.repo && (
            <a href={p.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-muted transition hover:border-line-strong hover:text-fg">
              <GitHubIcon className="size-3.5" /> Code
            </a>
          )}
          {p.live && (
            <a
              href={p.live}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-medium text-[#0a0a0b] transition hover:brightness-110"
              style={{ background: tint }}
            >
              {p.liveLabel ?? "Live demo"} <ArrowUpRight className="size-3.5" />
            </a>
          )}
          <ArrowUpRight className="ml-auto size-5 text-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
        </div>
      </div>
    </article>
  );
}
