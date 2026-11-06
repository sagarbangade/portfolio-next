"use client";

import { useState } from "react";
import { ArrowUpRight, Briefcase, Building2, Cloud, FolderGit2 } from "lucide-react";
import { coreStack } from "@/lib/data";
import { skillIndex, type Evidence } from "@/lib/skills";
import { emitSignal } from "@/lib/ui-store";
import { BrandIcon, brandHex } from "./brand-icons";

const AWS_ORANGE = "#FF9900";
const kindMeta = {
  client: { label: "Client work", icon: Briefcase },
  job: { label: "Role", icon: Building2 },
  project: { label: "Open source", icon: FolderGit2 },
} as const;

const allSkills = skillIndex.flatMap((g) => g.items.map((s) => ({ ...s, group: g.label })));
const find = (name: string) => allSkills.find((s) => s.name === name) ?? allSkills[0];

export function SkillsExplorer() {
  const [selected, setSelected] = useState(coreStack[0].skill);
  const skill = find(selected);

  const select = (name: string) => {
    setSelected(name);
    emitSignal("skills:select", { skill: name, uses: find(name).evidence.length });
  };

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" aria-label="Core stack">
        {coreStack.map((c) => {
          const on = selected === c.skill;
          // The Next.js mark is black, which would disappear on the dark theme.
          const color = c.id === "aws" ? AWS_ORANGE : c.id === "nextjs" ? "var(--fg)" : brandHex(c.id);
          return (
            <li key={c.id} className="sd-card" style={{ "--col": coreStack.indexOf(c) % 6 * 0.5, "--tilt": "0deg" } as React.CSSProperties}>
              <button
                type="button"
                data-testid={`core-${c.id}`}
                aria-pressed={on}
                onClick={() => select(c.skill)}
                style={{ "--brand": color } as React.CSSProperties}
                className={`group relative flex h-full w-full flex-col items-start overflow-hidden rounded-2xl border p-4 text-left transition duration-300 sm:p-5 ${
                  on ? "border-accent/50 bg-surface" : "border-line bg-elev hover:-translate-y-0.5 hover:border-line-strong"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute -right-6 -top-6 size-24 rounded-full blur-2xl transition-opacity duration-500 ${on ? "opacity-30" : "opacity-0 group-hover:opacity-20"}`}
                  style={{ background: "var(--brand)" }}
                />
                <span
                  className={`relative grid size-10 place-items-center rounded-xl border border-line bg-bg/60 transition-colors duration-300 ${
                    on ? "text-[var(--brand)]" : "text-fg/80 group-hover:text-[var(--brand)]"
                  }`}
                >
                  {c.id === "aws" ? <Cloud className="size-5" /> : <BrandIcon id={c.id} className="size-5" />}
                </span>
                <span className="relative mt-4 text-base font-semibold tracking-tight">{c.name}</span>
                <span className="relative mt-1 text-pretty text-xs leading-snug text-muted">{c.proof}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div data-reveal className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {skillIndex.map((group) => {
            const holdsSelected = group.items.some((s) => s.name === selected);
            return (
              <div key={group.id} className="min-w-0 bg-elev p-5 sm:p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-semibold">{group.label}</h3>
                  <span className="font-mono text-[11px] text-subtle">{group.items.length}</span>
                </div>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {group.items.map((s) => {
                    const on = s.name === selected;
                    const uses = s.evidence.length;
                    return (
                      <li key={s.name}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => select(s.name)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
                            on
                              ? "border-accent bg-accent text-[#0a0a0b]"
                              : uses
                                ? "border-line-strong text-fg/90 hover:border-accent/60 hover:text-fg"
                                : "border-line text-muted hover:border-line-strong hover:text-fg"
                          }`}
                        >
                          {s.name}
                          {uses > 0 && (
                            <span className={`font-mono text-[10px] ${on ? "text-[#0a0a0b]/70" : "text-accent"}`} aria-label={`used in ${uses} places`}>
                              {uses}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {holdsSelected && (
                  <div className="mt-5 lg:hidden">
                    <EvidencePanel name={skill.name} group={skill.group} evidence={skill.evidence} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <aside className="hidden self-start lg:sticky lg:top-24 lg:block" aria-live="polite">
          <div className="rounded-2xl border border-line bg-elev p-6">
            <EvidencePanel name={skill.name} group={skill.group} evidence={skill.evidence} />
          </div>
        </aside>
      </div>
      <p className="mt-4 text-sm text-subtle">
        Numbers show how many places on this page use a skill. Click one to see where.
      </p>
    </div>
  );
}

function EvidencePanel({ name, group, evidence }: { name: string; group: string; evidence: Evidence[] }) {
  return (
    <div key={name} className="fade-up" data-testid="skill-evidence">
      <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Where I used it · {group}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{name}</p>
      {evidence.length ? (
        <>
          <p className="mt-1 text-sm text-muted">
            Used in {evidence.length} {evidence.length === 1 ? "place" : "places"} on this page.
          </p>
          <ul className="mt-5 space-y-2">
            {evidence.map((e) => {
              const Icon = kindMeta[e.kind].icon;
              return (
                <li key={`${e.kind}-${e.label}`}>
                  <a
                    href={e.href}
                    {...(e.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="group flex items-center gap-3 rounded-xl border border-line bg-bg/40 p-3 transition hover:border-line-strong hover:bg-surface"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-surface text-accent">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{e.label}</span>
                      <span className="block truncate text-xs text-muted">
                        {kindMeta[e.kind].label} · {e.sub}
                      </span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-subtle transition group-hover:text-fg" />
                  </a>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted">
          On my resume, but not part of a project shown here yet. Happy to talk through how I&apos;ve used it.
        </p>
      )}
    </div>
  );
}
