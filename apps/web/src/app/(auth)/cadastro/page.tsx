"use client";

import { Button, Card, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api";
import { hasErrors, validateSignup } from "@/lib/validators";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CadastroPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validateSignup(form) : {};

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors(validateSignup(form))) return;
    setLoading(true);
    try {
      await api.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      toast("Conta criada");
      router.push("/dashboard");
    } catch (err) {
      toast(
        err instanceof ApiError && err.status === 409
          ? "Esse e-mail já tem conta"
          : "Não foi possível criar a conta",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h1 className="text-title mb-6">Criar conta Personal</h1>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
        />
        <Input
          label="E-mail"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
        />
        <Input
          label="Senha"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          helper="Mínimo 8 caracteres, com letras e números"
        />
        <Input
          label="Confirmar senha"
          type="password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          error={errors.confirm}
        />
        <Button type="submit" loading={loading} size="lg">
          Criar conta
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="text-brand hover:underline">
          Entrar
        </Link>
      </p>
    </Card>
  );
}
