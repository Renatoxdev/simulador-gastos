"use client";

import { useSyncExternalStore } from "react";

const THEME_KEY = "gastos_theme_v1";

type Theme = "dark" | "light";

function getTheme(): Theme {
  if (typeof document === "undefined") return "dark";

  return document.documentElement.dataset.theme === "light"
    ? "light"
    : "dark";
}

function subscribeTheme(callback: () => void) {
  window.addEventListener("themechange", callback);

  return () => window.removeEventListener("themechange", callback);
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getTheme,
    () => "dark"
  );

  const applyTheme = (next: Theme) => {
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
    window.dispatchEvent(new Event("themechange"));

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", next === "dark" ? "#0b1020" : "#f6f7fb");
    }
  };

  const toggle = () => applyTheme(theme === "dark" ? "light" : "dark");

  return (
    <button type="button" onClick={toggle} aria-label="Alternar tema">
      {theme === "dark" ? "Modo escuro" : "Modo claro"}
    </button>
  );
}
