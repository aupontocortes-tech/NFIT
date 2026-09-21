"use client";

import { Button, Card, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login(email, password);
      toast("Login realizado");
      router.push(res.user.role === "aluno" ? "/aluno/inicio" : "/dashboard");
    } catch {
      setError("E-mail ou senha incorretos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h1 className="text-title mb-1">Entrar</h1>
      <p className="mb-6 text-body-sm text-text-muted">
        personal@nfit.local / aluno@nfit.local — senha12345
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="E-mail"
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Senha"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          error={error}
        />
        <Button type="submit" loading={loading} size="lg">
          Entrar
        </Button>
      </form>
      <div className="mt-4 flex flex-col gap-2 text-center text-sm">
        <Link href="/esqueci-senha" className="text-brand hover:underline">
          Esqueci a senha
        </Link>
        <Link href="/cadastro" className="text-text-muted hover:text-text">
          Criar conta Personal
        </Link>
      </div>
    </Card>
  );
}
