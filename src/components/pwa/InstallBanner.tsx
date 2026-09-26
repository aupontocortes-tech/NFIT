"use client";

import { Button } from "@/components/ui";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const HIDE_KEY = "nfit_install_hidden";

type Kind = "ios" | "android" | "desktop";

type BeforeInstall = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const steps: Record<Kind, string[]> = {
  ios: [
    "Abra esta página no Safari.",
    "Toque em Compartilhar, o quadrado com a seta para cima.",
    "Role a lista e toque em Adicionar à Tela de Início.",
    "Toque em Adicionar. O ícone vermelho do NFIT fica na tela do celular e abre como aplicativo.",
  ],
  android: [
    "Use o Chrome.",
    "Toque em Baixar agora e confirme em Instalar.",
    "Se o botão não aparecer, abra o menu ⋮ e toque em Instalar app ou Adicionar à tela inicial.",
    "O ícone vermelho fica na tela inicial e o NFIT abre sem a barra do navegador.",
  ],
  desktop: [
    "Use o Chrome ou o Edge.",
    "Toque em Baixar agora e confirme em Instalar.",
    "Se o botão não aparecer, olhe o ícone de instalar à direita do endereço, ou abra o menu e escolha Instalar NFIT.",
    "O aplicativo abre numa janela própria e o ícone fica na área de trabalho ou no menu Iniciar.",
  ],
};

function kindFromUa(): Kind {
  const ua = navigator.userAgent;
  const iPad = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  if (/iPad|iPhone|iPod/.test(ua) || iPad) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function installed() {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export function InstallBanner() {
  const pathname = usePathname();
  const onCheckin = pathname.startsWith("/avaliacao/");
  const [kind, setKind] = useState<Kind | null>(null);
  const [promptEvent, setPromptEvent] = useState<BeforeInstall | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (installed() || localStorage.getItem(HIDE_KEY) === "1") return;
    setKind(kindFromUa());
    setHidden(false);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstall);
    };
    const onInstalled = () => setHidden(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hidden || !kind) return null;

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    if (choice.outcome === "accepted") setHidden(true);
  }

  function dismiss() {
    localStorage.setItem(HIDE_KEY, "1");
    setHidden(true);
  }

  const title = onCheckin
    ? "Baixar a avaliação no celular"
    : kind === "desktop"
      ? "Baixar o NFIT no computador"
      : "Baixar o NFIT no celular";
  const hint = onCheckin
    ? "O ícone vermelho fica na tela do celular e abre esta página para enviar as fotos."
    : "O ícone vermelho entra na tela e o NFIT abre como aplicativo.";

  return (
    <aside className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-md rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-lg md:inset-x-auto md:bottom-6 md:right-6">
      <div className="mb-3 flex items-center gap-3">
        <img src="/icons/icon-192.png" alt="" width={48} height={48} className="rounded-[22%]" />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-caption">{hint}</p>
        </div>
      </div>
      <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm">
        {steps[kind].map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        {promptEvent ? (
          <Button size="sm" onClick={install}>
            Baixar agora
          </Button>
        ) : null}
        <Button size="sm" variant="secondary" onClick={dismiss}>
          Agora não
        </Button>
      </div>
    </aside>
  );
}
