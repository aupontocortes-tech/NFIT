"use client";

import { Button, Card, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
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
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("As senhas não coincidem");
      return;
    }
    setLoading(true);
    try {
      await api.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      toast("Conta criada");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h1 className="text-title mb-6">Criar conta Personal</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="E-mail"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Senha"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          helper="Mínimo 8 caracteres"
        />
        <Input
          label="Confirmar senha"
          type="password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          required
          error={error}
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
