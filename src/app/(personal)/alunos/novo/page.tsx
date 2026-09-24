"use client";

import { Button, Card, Input, PageHeader, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api";
import { hasErrors, validateStudent } from "@/lib/validators";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NovoAlunoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validateStudent(form) : {};

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors(validateStudent(form))) return;
    setLoading(true);
    try {
      const s = await api.createStudent({
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
      });
      toast("Aluno criado — convite enviado");
      router.push(`/alunos/${s.id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Não foi possível salvar o aluno", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Novo aluno" />
      <Card className="max-w-2xl">
        <form onSubmit={onSubmit} noValidate className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            className="md:col-span-2"
          />
          <Input
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            helper="Será enviado um convite"
          />
          <Input
            label="Telefone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="(11) 99999-9999"
            inputMode="tel"
            error={errors.phone}
          />
          <Textarea
            label="Notas"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="md:col-span-2"
          />
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" loading={loading}>
              Salvar
            </Button>
            <Link href="/alunos">
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
