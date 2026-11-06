"use client";

import { useSyncExternalStore } from "react";
import type { SectionId } from "./data";

export type Theme = "dark" | "light";

export type UiState = {
  theme: Theme;
  paletteOpen: boolean;
  menuOpen: boolean;
  activeSection: SectionId | "top";
  emailCopied: boolean;
};

type Listener = (state: UiState, prev: UiState) => void;

let state: UiState = {
  theme: "dark",
  paletteOpen: false,
  menuOpen: false,
  activeSection: "top",
  emailCopied: false,
};

const listeners = new Set<Listener>();

/** Tiny Zustand-shaped store so UI state is shared across islands and readable by Reticle in dev. */
export const uiStore = {
  getState: () => state,
  setState(patch: Partial<UiState>) {
    const prev = state;
    const next = { ...state, ...patch };
    if (Object.keys(patch).every((k) => Object.is(prev[k as keyof UiState], next[k as keyof UiState]))) return;
    state = next;
    listeners.forEach((l) => l(state, prev));
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useUi<T>(selector: (s: UiState) => T): T {
  return useSyncExternalStore(
    (cb) => uiStore.subscribe(cb),
    () => selector(uiStore.getState()),
    () => selector(uiStore.getState()),
  );
}

/** Fire-and-forget event the dev-only Reticle bridge forwards as a signal. No-op in production. */
export function emitSignal(name: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("portfolio:signal", { detail: { name, data } }));
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {}
  uiStore.setState({ theme });
  emitSignal("theme:changed", { theme });
}

export function toggleTheme() {
  setTheme(uiStore.getState().theme === "dark" ? "light" : "dark");
}

export function scrollToSection(id: string) {
  const el = id === "top" ? document.body : document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (id === "top") window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", id === "top" ? location.pathname : `#${id}`);
}

export async function copyEmail(email: string) {
  try {
    await navigator.clipboard.writeText(email);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = email;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  uiStore.setState({ emailCopied: true });
  emitSignal("email:copied", { email });
  window.setTimeout(() => uiStore.setState({ emailCopied: false }), 2200);
}
