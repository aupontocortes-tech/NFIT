"use client";

import { Button, Card } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useEffect, useState } from "react";

export function inviteUrl() {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/convite`;
}

export function AlunoInviteLink() {
  const { toast } = useToast();
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(inviteUrl());
  }, []);

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copiado. Envie no WhatsApp do aluno.");
    } catch {
      toast("Não foi possível copiar. Selecione o link e copie.", "error");
    }
  }

  return (
    <Card className="mb-4 max-w-2xl space-y-3">
      <div>
        <h2 className="text-subtitle">Link para o aluno se cadastrar</h2>
        <p className="text-caption">
          Você envia no WhatsApp. O aluno coloca nome, e-mail, telefone e uma nota. O cadastro entra na sua lista e ele já segue para a avaliação.
        </p>
      </div>
      <p className="break-all rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm">{url || "Carregando o link…"}</p>
      <Button type="button" onClick={copy} disabled={!url}>
        Copiar link
      </Button>
    </Card>
  );
}
