"use client";

import { Button, Card, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useEffect, useState } from "react";

export function OpenAiKeyCard() {
  const { toast } = useToast();
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/config/openai")
      .then((r) => r.json())
      .then((d) => setSaved(Boolean(d?.configured)))
      .catch(() => setSaved(false));
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/config/openai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast(data?.error?.message ?? "Não foi possível salvar", "error");
        return;
      }
      setSaved(true);
      setKey("");
      toast("Chave da OpenAI salva");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mb-4 max-w-lg space-y-4">
      <div>
        <h2 className="text-subtitle">OpenAI</h2>
        <p className="text-caption">
          {saved
            ? "Chave salva. Cole outra só se quiser trocar."
            : "Cole aqui a chave para o Gerar com IA funcionar."}
        </p>
      </div>
      <form onSubmit={onSave} className="flex flex-col gap-3">
        <Input
          label="Chave da OpenAI"
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-..."
          autoComplete="off"
        />
        <Button type="submit" loading={loading} disabled={key.trim().length < 20}>
          Salvar chave
        </Button>
      </form>
    </Card>
  );
}
