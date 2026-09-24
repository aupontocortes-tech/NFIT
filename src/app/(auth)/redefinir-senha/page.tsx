"use client";

import { Button, Card, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("As senhas não coincidem");
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(params.get("token") ?? "mock", password);
      toast("Senha atualizada");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h1 className="text-title mb-6">Nova senha</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          label="Confirmar senha"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          error={error}
        />
        <Button type="submit" loading={loading} size="lg">
          Salvar
        </Button>
      </form>
      <Link href="/login" className="mt-4 block text-center text-sm text-brand">
        Voltar ao login
      </Link>
    </Card>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense>
      <Form />
    </Suspense>
  );
}
