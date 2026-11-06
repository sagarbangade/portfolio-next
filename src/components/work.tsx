import { ArrowUpRight } from "lucide-react";
import { projects, type Project } from "@/lib/data";
import { GitHubIcon } from "./icons";

export function ProjectGrid() {
  return (
    <ul data-testid="project-grid" data-count={projects.length} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p, i) => (
        <ProjectCard key={p.name} project={p} index={i} />
      ))}
    </ul>
  );
}

function ProjectCard({ project: p, index }: { project: Project; index: number }) {
  const primary = p.live ?? p.repo;
  return (
    <li
      data-spotlight
      data-testid="project-card"
      style={{ "--col": index % 3, "--tilt": `${index % 2 ? 1.5 : -1.5}deg` } as React.CSSProperties}
      className="sd-card group relative flex flex-col rounded-2xl border border-line bg-elev p-5 transition hover:-translate-y-0.5 hover:border-line-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight">
          <a href={primary} target="_blank" rel="noreferrer" className="after:absolute after:inset-0 after:rounded-2xl">
            {p.name}
          </a>
        </h3>
        <span className="shrink-0 font-mono text-[11px] text-subtle">{p.year}</span>
      </div>
      <p className="mt-2 flex-1 text-pretty text-sm leading-relaxed text-muted">{p.blurb}</p>
      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tech stack">
        {p.stack.map((s) => (
          <li key={s} className="rounded-md bg-surface px-2 py-0.5 font-mono text-[11px] text-muted">
            {s}
          </li>
        ))}
      </ul>
      <div className="relative z-10 mt-4 flex items-center gap-2 border-t border-line pt-4 text-xs">
        {p.repo && (
          <a href={p.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-muted transition hover:bg-surface-2 hover:text-fg">
            <GitHubIcon className="size-3.5" /> Code
          </a>
        )}
        {p.live && (
          <a href={p.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-accent transition hover:bg-accent-soft">
            {p.liveLabel ?? "Live demo"} <ArrowUpRight className="size-3.5" />
          </a>
        )}
        <ArrowUpRight className="ml-auto size-4 text-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
      </div>
    </li>
  );
}
