"use client";

import { useRef } from "react";
import { MapPin } from "lucide-react";
import { experience, formatMonth, formatTenure, monthsSince } from "@/lib/data";
import { emitSignal, uiStore, useUi } from "@/lib/ui-store";

export function ExperienceTabs() {
  const activeId = useUi((s) => s.activeExperience);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, experience.findIndex((e) => e.id === activeId));
  const job = experience[index];

  const select = (i: number, focus = false) => {
    const next = experience[(i + experience.length) % experience.length];
    uiStore.setState({ activeExperience: next.id });
    emitSignal("experience:select", { id: next.id });
    if (focus) tabs.current[(i + experience.length) % experience.length]?.focus();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-10">
      <div
        role="tablist"
        aria-label="Companies"
        aria-orientation="vertical"
        className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:flex-col lg:gap-1"
      >
        {experience.map((e, i) => {
          const selected = e.id === job.id;
          return (
            <button
              key={e.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${e.id}`}
              data-testid={`exp-tab-${e.id}`}
              aria-selected={selected}
              aria-controls={`panel-${e.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(i)}
              onKeyDown={(ev) => {
                if (ev.key === "ArrowDown" || ev.key === "ArrowRight") {
                  ev.preventDefault();
                  select(i + 1, true);
                } else if (ev.key === "ArrowUp" || ev.key === "ArrowLeft") {
                  ev.preventDefault();
                  select(i - 1, true);
                }
              }}
              className={`group relative shrink-0 rounded-xl border px-4 py-3 text-left transition lg:border-transparent lg:pl-5 ${
                selected ? "border-line-strong bg-surface lg:bg-surface" : "border-line text-muted hover:bg-surface/60 hover:text-fg"
              }`}
            >
              <span
                aria-hidden
                className={`absolute left-0 top-3 bottom-3 hidden w-0.5 rounded-full transition lg:block ${selected ? "bg-accent" : "bg-line"}`}
              />
              <span className="flex items-center gap-2 text-sm font-medium">
                {e.company}
                {e.current && (
                  <span className="relative flex size-1.5">
                    <span className="ping-soft absolute inline-flex size-full rounded-full bg-ok" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-ok" />
                  </span>
                )}
              </span>
              <span className="mt-0.5 block font-mono text-[11px] text-subtle">
                {e.start.slice(0, 4)} – {e.end ? e.end.slice(0, 4) : "now"}
              </span>
            </button>
          );
        })}
      </div>

      <div
        key={job.id}
        role="tabpanel"
        id={`panel-${job.id}`}
        aria-labelledby={`tab-${job.id}`}
        data-testid="exp-panel"
        data-spotlight
        className="fade-up rounded-2xl border border-line bg-elev p-5 sm:p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {job.role} <span className="text-accent">@ {job.company}</span>
            </h3>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span>{job.companyFull}</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {job.location}
              </span>
            </p>
            <p className="mt-1 font-mono text-xs text-subtle">
              {formatMonth(job.start)} – {job.end ? formatMonth(job.end) : "Present"} · {formatTenure(monthsSince(job.start, job.end))}
            </p>
          </div>
          {job.metric && (
            <div className="shrink-0 rounded-xl border border-line bg-surface px-4 py-3 sm:text-right">
              <div className="text-2xl font-semibold tracking-tight text-accent">{job.metric.value}</div>
              <div className="text-xs text-muted">{job.metric.label}</div>
            </div>
          )}
        </div>

        <p className="mt-5 text-pretty text-[15px] leading-relaxed text-fg/90">{job.summary}</p>

        <ul className="mt-5 space-y-3">
          {job.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-[15px] leading-relaxed text-muted">
              <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent" />
              <span className="text-pretty">{h}</span>
            </li>
          ))}
        </ul>

        <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Stack">
          {job.stack.map((s) => (
            <li key={s} className="rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[11px] text-muted">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
