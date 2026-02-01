"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "gastos_theme_v1";

type Theme = "dark" | "light";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const current = (document.documentElement.dataset.theme as Theme) || "dark";
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  const applyTheme = (next: Theme) => {
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);

    // opcional: atualizar a cor da UI do browser
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "dark" ? "#0b1020" : "#f6f7fb");
  };

  const toggle = () => applyTheme(theme === "dark" ? "light" : "dark");

  return (
    <button type="button" onClick={toggle} aria-label="Alternar tema">
      {theme === "dark" ? "🌙 Modo escuro" : "☀️ Modo claro"}
    </button>
  );
}
