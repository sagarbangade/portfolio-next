"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { skills } from "@/lib/data";
import { emitSignal } from "@/lib/ui-store";

export function SkillsMatrix() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const total = skills.reduce((n, g) => n + g.items.length, 0);
  const matches = q ? skills.reduce((n, g) => n + g.items.filter((s) => s.toLowerCase().includes(q)).length, 0) : total;

  return (
    <div>
      <label className="flex max-w-md items-center gap-3 rounded-xl border border-line bg-elev px-4 transition focus-within:border-accent">
        <Search className="size-4 text-subtle" />
        <span className="sr-only">Filter skills</span>
        <input
          data-testid="skills-search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            emitSignal("skills:search", { query: e.target.value });
          }}
          placeholder="Try “aws”, “react” or “python”"
          className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-subtle"
        />
        <span className="shrink-0 font-mono text-[11px] text-subtle" data-testid="skills-count">
          {matches}/{total}
        </span>
      </label>

      <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((group) => {
          const hits = group.items.filter((s) => !q || s.toLowerCase().includes(q));
          return (
            <div key={group.id} data-spotlight className={`bg-elev p-5 transition-opacity sm:p-6 ${q && hits.length === 0 ? "opacity-40" : ""}`}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold">{group.label}</h3>
                <span className="font-mono text-[11px] text-subtle">{group.items.length}</span>
              </div>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {group.items.map((s) => {
                  const hit = !q || s.toLowerCase().includes(q);
                  return (
                    <li
                      key={s}
                      className={`rounded-full border px-2.5 py-1 text-xs transition ${
                        q && hit ? "border-accent bg-accent-soft text-fg" : hit ? "border-line text-muted" : "border-transparent text-subtle/50"
                      }`}
                    >
                      {s}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
