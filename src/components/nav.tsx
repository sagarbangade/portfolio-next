"use client";

import { useEffect } from "react";
import { Command, Download, Heart, Menu, Moon, Sun, X } from "lucide-react";
import { profile, sections } from "@/lib/data";
import { emitSignal, scrollToSection, toggleTheme, uiStore, useUi } from "@/lib/ui-store";
import { GitHubIcon, LinkedInIcon, Monogram } from "./icons";

export function Nav() {
  const active = useUi((s) => s.activeSection);
  const menuOpen = useUi((s) => s.menuOpen);
  const theme = useUi((s) => s.theme);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && uiStore.setState({ menuOpen: false });
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    uiStore.setState({ menuOpen: false });
    scrollToSection(id);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-3 max-w-6xl px-3 sm:px-6">
        <nav
          aria-label="Primary"
          className="flex h-14 items-center justify-between gap-3 rounded-2xl border border-line bg-bg/70 px-2.5 pl-3 shadow-lg shadow-black/5 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/55"
        >
          <a href="#top" onClick={go("top")} className="flex items-center gap-2.5 rounded-lg" aria-label="Back to top">
            <Monogram />
            <span className="hidden whitespace-nowrap text-sm font-medium tracking-tight sm:inline lg:hidden 2xl:inline">{profile.shortName}</span>
          </a>

          <ul className="hidden items-center gap-0.5 lg:flex">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={go(s.id)}
                  aria-current={active === s.id ? "location" : undefined}
                  className={`relative rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    active === s.id ? "text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  {active === s.id && <span className="absolute inset-0 -z-10 rounded-lg bg-surface-2" aria-hidden />}
                  {s.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1">
            <button
              type="button"
              data-testid="open-palette"
              onClick={() => {
                uiStore.setState({ paletteOpen: true, menuOpen: false });
                emitSignal("palette:open", { via: "nav" });
              }}
              className="hidden items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted transition hover:border-line-strong hover:text-fg sm:inline-flex"
              aria-label="Open command palette"
            >
              <span>Search</span>
              <kbd className="inline-flex items-center gap-0.5 font-mono text-[11px]">
                <Command className="size-3" />K
              </kbd>
            </button>
            <button
              type="button"
              data-testid="theme-toggle"
              onClick={toggleTheme}
              className="grid size-9 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </button>
            <a
              href={profile.sponsors}
              target="_blank"
              rel="noreferrer"
              data-testid="nav-sponsor"
              className="group hidden h-9 items-center gap-1.5 rounded-lg border border-line px-2.5 text-sm text-muted transition hover:border-[#db61a2]/50 hover:bg-[#db61a2]/10 hover:text-fg md:inline-flex"
              aria-label="Sponsor my open-source work on GitHub"
            >
              <Heart className="size-4 text-[#db61a2] transition group-hover:scale-110 group-hover:fill-[#db61a2]" />
              <span className="hidden xl:inline">Sponsor</span>
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="hidden size-9 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg md:grid"
              aria-label="GitHub profile"
            >
              <GitHubIcon className="size-[18px]" />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="hidden size-9 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg md:grid"
              aria-label="LinkedIn profile"
            >
              <LinkedInIcon className="size-[18px]" />
            </a>
            <a
              href={profile.resume}
              download="Sagar_Eknath_Bangade_Resume.pdf"
              data-testid="nav-resume"
              className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-fg px-3 py-2 text-sm font-medium text-bg transition hover:opacity-90"
            >
              <Download className="size-4" /> <span>Resume</span>
            </a>
            <button
              type="button"
              data-testid="menu-toggle"
              onClick={() => {
                const open = !menuOpen;
                uiStore.setState({ menuOpen: open });
                emitSignal(open ? "menu:open" : "menu:close");
              }}
              className="grid size-9 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div
            id="mobile-menu"
            data-testid="mobile-menu"
            className="pop-in mt-2 rounded-2xl border border-line bg-elev/95 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl lg:hidden"
          >
            <ul className="grid gap-0.5">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={go(s.id)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-base transition ${
                      active === s.id ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface hover:text-fg"
                    }`}
                  >
                    <span>{s.label}</span>
                    <span className="font-mono text-xs text-subtle">0{i + 1}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center gap-2 border-t border-line p-2 pt-3">
              <a href="#contact" onClick={go("contact")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-sm text-muted hover:text-fg">
                Contact
              </a>
              <a href={profile.github} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-sm text-muted hover:text-fg">
                <GitHubIcon className="size-4" /> GitHub
              </a>
              <a href={profile.sponsors} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-sm text-muted hover:text-fg">
                <Heart className="size-4 text-[#db61a2]" /> Sponsor
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-sm text-muted hover:text-fg">
                <LinkedInIcon className="size-4" /> LinkedIn
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
