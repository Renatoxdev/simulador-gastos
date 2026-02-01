import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simulador de Gastos",
  description: "Entradas, saídas e saldo com persistência local (PWA)."
};

const THEME_KEY = "gastos_theme_v1";

const themeInitScript = `
(() => {
  try {
    const key = "${THEME_KEY}";
    const saved = localStorage.getItem(key);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = (saved === 'light' || saved === 'dark') ? saved : (prefersDark ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;

    // Atualiza meta theme-color (opcional)
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1020' : '#f6f7fb');
  } catch {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0b1020" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
