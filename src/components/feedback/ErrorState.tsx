"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";

/** Tela amigável de erro com botão de tentar novamente. */
export function ErrorState({
  error,
  retry,
  homeHref = "/",
}: {
  error: Error & { digest?: string };
  retry: () => void;
  homeHref?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-16 text-center"
    >
      <div className="rounded-full bg-red-50 p-4 text-error">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold text-text">Algo deu errado</p>
        <p className="text-sm text-text-muted">
          Não conseguimos carregar esta tela. Verifique sua conexão e tente de novo.
        </p>
        {error.digest ? (
          <p className="text-xs text-text-muted">Código: {error.digest}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={() => retry()}>
          <RotateCcw className="h-4 w-4" />
          Tentar novamente
        </Button>
        <Link href={homeHref}>
          <Button variant="secondary">Voltar ao início</Button>
        </Link>
      </div>
    </div>
  );
}
