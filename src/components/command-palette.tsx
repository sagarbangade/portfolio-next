"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, CornerDownLeft, Copy, FileText, Hash, Moon, Search } from "lucide-react";
import { profile, projects, sections } from "@/lib/data";
import { copyEmail, emitSignal, scrollToSection, toggleTheme, uiStore, useUi } from "@/lib/ui-store";
import { GitHubIcon, LinkedInIcon } from "./icons";

type Item = { id: string; label: string; hint: string; group: string; icon: React.ReactNode; run: () => void; keywords?: string };

export function CommandPalette({ hasResume }: { hasResume: boolean }) {
  const open = useUi((s) => s.paletteOpen);
  // Remounting on every open gives a fresh query and cursor without resetting state in an effect.
  return open ? <PaletteDialog hasResume={hasResume} /> : null;
}

function PaletteDialog({ hasResume }: { hasResume: boolean }) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const close = () => uiStore.setState({ paletteOpen: false });

  const items = useMemo<Item[]>(() => {
    const nav: Item[] = [{ id: "top", label: "Home" }, ...sections].map((s) => ({
      id: `go-${s.id}`,
      label: s.label,
      hint: "Jump to section",
      group: "Navigate",
      icon: <Hash className="size-4" />,
      run: () => scrollToSection(s.id),
    }));
    const actions: Item[] = [
      { id: "copy-email", label: "Copy email address", hint: profile.email, group: "Actions", icon: <Copy className="size-4" />, run: () => copyEmail(profile.email) },
      { id: "theme", label: "Toggle light / dark theme", hint: "Appearance", group: "Actions", icon: <Moon className="size-4" />, run: toggleTheme, keywords: "dark light mode" },
      ...(hasResume
        ? [{ id: "resume", label: "Download resume (PDF)", hint: "Download", group: "Actions", icon: <FileText className="size-4" />, run: () => window.open(profile.resume, "_blank"), keywords: "cv resume" }]
        : []),
      { id: "github", label: "GitHub", hint: "github.com/sagarbangade", group: "Links", icon: <GitHubIcon className="size-4" />, run: () => window.open(profile.github, "_blank") },
      { id: "linkedin", label: "LinkedIn", hint: "in/sagar-bangade", group: "Links", icon: <LinkedInIcon className="size-4" />, run: () => window.open(profile.linkedin, "_blank") },
    ];
    const work: Item[] = projects.map((p) => ({
      id: `project-${p.name}`,
      label: p.name,
      hint: p.stack.slice(0, 3).join(" · "),
      group: "Projects",
      icon: <ArrowUpRight className="size-4" />,
      run: () => window.open(p.live ?? p.repo, "_blank"),
      keywords: p.stack.join(" "),
    }));
    return [...nav, ...actions, ...work];
  }, [hasResume]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.filter((i) => i.group !== "Projects").concat(items.filter((i) => i.group === "Projects").slice(0, 4));
    return items.filter((i) => `${i.label} ${i.hint} ${i.group} ${i.keywords ?? ""}`.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => input.current?.focus(), 10);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, []);

  useEffect(() => {
    list.current?.querySelector(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const run = (item: Item) => {
    close();
    emitSignal("palette:run", { id: item.id });
    window.setTimeout(item.run, 30);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (filtered.length ? (c + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (filtered.length ? (c - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === "Enter" && filtered[cursor]) {
      e.preventDefault();
      run(filtered[cursor]);
    }
  };

  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-3 pt-[12vh] sm:px-4" onKeyDown={onKeyDown}>
      <button type="button" aria-label="Close command palette" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        data-testid="command-palette"
        className="pop-in relative w-full max-w-xl overflow-hidden rounded-2xl border border-line-strong bg-elev shadow-2xl shadow-black/50"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-4 shrink-0 text-subtle" />
          <input
            ref={input}
            data-testid="palette-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            placeholder="Search sections, projects, actions…"
            className="h-14 w-full bg-transparent text-[15px] text-fg outline-none placeholder:text-subtle"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={filtered[cursor] ? `opt-${cursor}` : undefined}
          />
          <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 font-mono text-[11px] text-subtle sm:block">esc</kbd>
        </div>
        <ul ref={list} id="palette-list" role="listbox" className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
          {filtered.length === 0 && <li className="px-3 py-8 text-center text-sm text-subtle">No results for “{query}”</li>}
          {filtered.map((item, i) => {
            const header = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            return (
              <li key={item.id} role="presentation">
                {header && <div className="px-3 pb-1 pt-3 font-mono text-[11px] uppercase tracking-wider text-subtle">{header}</div>}
                <div
                  id={`opt-${i}`}
                  role="option"
                  aria-selected={i === cursor}
                  data-index={i}
                  data-testid={`palette-item-${item.id}`}
                  onMouseMove={() => setCursor(i)}
                  onClick={() => run(item)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    i === cursor ? "bg-surface-2 text-fg" : "text-muted"
                  }`}
                >
                  <span className={i === cursor ? "text-accent" : "text-subtle"}>{item.icon}</span>
                  <span className="flex-1 truncate">{item.label}</span>
                  <span className="hidden max-w-[45%] truncate text-xs text-subtle sm:block">{item.hint}</span>
                  {i === cursor && <CornerDownLeft className="size-3.5 text-subtle" />}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-[11px] text-subtle">
          <span>↑↓ navigate · ↵ select</span>
          <span>{filtered.length} results</span>
        </div>
      </div>
    </div>
  );
}
