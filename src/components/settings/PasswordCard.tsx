"use client";

import { Button, Card, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { passwordProblem } from "@/lib/validators";
import { useState } from "react";

export function PasswordCard() {
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    const problem = passwordProblem(next);
    if (problem) {
      toast(problem, "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast(data?.error?.message ?? "Não foi possível trocar a senha", "error");
        return;
      }
      setCurrent("");
      setNext("");
      toast("Salvamento concluído. Senha trocada.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-6 max-w-lg space-y-4">
      <h2 className="text-subtitle">Senha da personal</h2>
      <p className="text-sm text-text-muted">Quem não souber essa senha não entra na área profissional.</p>
      <Input label="Senha atual" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      <Input label="Nova senha" type="password" value={next} onChange={(e) => setNext(e.target.value)} helper="Mínimo 8 caracteres, com letras e números." />
      <Button type="button" size="sm" loading={saving} onClick={save}>
        Trocar senha
      </Button>
    </Card>
  );
}
