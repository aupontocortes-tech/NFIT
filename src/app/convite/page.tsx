"use client";

import { AppName } from "@/components/ui/AppName";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { hasErrors, validateStudent } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ConvitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const errors = submitted ? validateStudent(form) : {};

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setError("");
    if (hasErrors(validateStudent(form))) return;
    setLoading(true);
    try {
      const res = await fetch("/api/convite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          notes: form.notes.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.evaluationPath || !data?.id) {
        setError(data?.error?.message ?? "Não foi possível salvar o cadastro.");
        return;
      }
      localStorage.setItem("nfit_aluno_id", data.id);
      router.push(data.evaluationPath);
    } catch {
      setError("Não foi possível salvar o cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 py-8">
      <AppName />
      <form onSubmit={onSubmit} noValidate className="mt-8">
        <Card className="space-y-4">
          <div>
            <h1 className="text-title">Seu cadastro</h1>
            <p className="mt-1 text-sm text-text-muted">
              Coloque seus dados. Em seguida você preenche a avaliação. Tudo fica salvo para a sua personal.
            </p>
          </div>
          <Input
            label="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            autoComplete="name"
          />
          <Input
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Telefone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="(11) 99999-9999"
            inputMode="tel"
            error={errors.phone}
            autoComplete="tel"
          />
          <Textarea
            label="Nota"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Algo que a personal precise saber. Pode deixar em branco."
          />
          {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
          <Button type="submit" loading={loading}>
            Salvar e fazer a avaliação
          </Button>
        </Card>
      </form>
    </div>
  );
}
