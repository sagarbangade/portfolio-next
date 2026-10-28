"use client";

import { ArrowUpRight } from "lucide-react";
import { projectFilters, projects, sponsoredProjects, type Project } from "@/lib/data";
import { emitSignal, uiStore, useUi } from "@/lib/ui-store";
import { GitHubIcon } from "./icons";

export function ProjectGrid() {
  const filter = useUi((s) => s.projectFilter);
  const shown = filter === "all" ? projects : projects.filter((p) => p.categories.includes(filter));

  return (
    <div>
      <div role="group" aria-label="Filter projects" className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {projectFilters.map((f) => {
          const count = f.id === "all" ? projects.length : projects.filter((p) => p.categories.includes(f.id as never)).length;
          if (!count) return null;
          const on = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              data-testid={`filter-${f.id}`}
              aria-pressed={on}
              onClick={() => {
                uiStore.setState({ projectFilter: f.id });
                emitSignal("projects:filter", { filter: f.id, count });
              }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition ${
                on ? "border-fg bg-fg text-bg" : "border-line text-muted hover:border-line-strong hover:text-fg"
              }`}
            >
              {f.label}
              <span className={`font-mono text-[11px] ${on ? "text-bg/70" : "text-subtle"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <ul data-testid="project-grid" data-count={shown.length} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <ProjectCard key={p.name} project={p} />
        ))}
      </ul>
    </div>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  const primary = p.live ?? p.repo;
  return (
    <li
      data-spotlight
      data-testid="project-card"
      className="fade-up group relative flex flex-col rounded-2xl border border-line bg-elev p-5 transition hover:-translate-y-0.5 hover:border-line-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight">
          <a href={primary} target="_blank" rel="noreferrer" className="after:absolute after:inset-0 after:rounded-2xl">
            {p.name}
          </a>
        </h3>
        <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] text-subtle">
          {sponsoredProjects.has(p.name) && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent">♥ sponsored</span>}
          {p.year}
        </span>
      </div>
      <p className="mt-2 flex-1 text-pretty text-sm leading-relaxed text-muted">{p.blurb}</p>
      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Stack">
        {p.stack.slice(0, 5).map((s) => (
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
            {p.liveLabel ?? "Live"} <ArrowUpRight className="size-3.5" />
          </a>
        )}
        <ArrowUpRight className="ml-auto size-4 text-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
      </div>
    </li>
  );
}
