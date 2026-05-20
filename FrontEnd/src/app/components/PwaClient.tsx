"use client";

import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaClient() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const canInstall = useMemo(() => deferredPrompt !== null, [deferredPrompt]);

  useEffect(() => {
    // Registrar Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch(() => {
        // sem throw: só não registra
      });
    }

    // Capturar evento de instalação (Chrome/Edge/Android)
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => setDeferredPrompt(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    // opcional: você pode ler deferredPrompt.userChoice
    setDeferredPrompt(null);
  };

  return (
    <div style={{ display: "contents" }}>
      {canInstall ? (
        <button className="installBtn" onClick={handleInstall} type="button">
          Instalar app
        </button>
      ) : null}
    </div>
  );
}
