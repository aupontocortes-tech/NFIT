"use client";

import { Button, Card, Input } from "@/components/ui";
import { AppName } from "@/components/ui/AppName";
import { passwordProblem } from "@/lib/validators";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EntrarAlunoPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [missing, setMissing] = useState(false);
  const [name, setName] = useState("");
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/entrar/${token}`)
      .then(async (r) => {
        if (!r.ok) {
          setMissing(true);
          return;
        }
        const data = await r.json();
        if (!data?.id) {
          setMissing(true);
          return;
        }
        setName(data.name ?? "");
        setHasPassword(Boolean(data.hasPassword));
      })
      .catch(() => setMissing(true));
  }, [token]);

  async function enter() {
    setError("");
    if (!hasPassword) {
      const problem = passwordProblem(password);
      if (problem) {
        setError(problem);
        return;
      }
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/entrar/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.id) {
        setError(data?.error?.message ?? "Não foi possível entrar");
        return;
      }
      localStorage.setItem("nfit_aluno_id", data.id);
      router.replace("/aluno");
    } finally {
      setLoading(false);
    }
  }

  if (missing) {
    return (
      <div className="mx-auto min-h-dvh max-w-lg px-4 py-8">
        <AppName />
        <Card className="mt-8">
          <h1 className="text-title">Link inválido</h1>
          <p className="mt-2 text-sm text-text-muted">Peça um novo link para a sua personal.</p>
        </Card>
      </div>
    );
  }

  if (hasPassword === null) {
    return (
      <div className="mx-auto min-h-dvh max-w-lg px-4 py-8">
        <AppName />
        <p className="mt-6 text-sm text-text-muted">Abrindo o seu aplicativo…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 py-8">
      <AppName />
      <Card className="mt-8 space-y-4">
        <h1 className="text-title">{hasPassword ? `Olá, ${name.split(" ")[0]}` : "Crie sua senha"}</h1>
        <p className="text-sm text-text-muted">
          {hasPassword
            ? "Digite a senha deste aplicativo. O link continua exclusivo seu."
            : "Este link é só seu. A senha fica neste aplicativo e precisa de letras e números."}
        </p>
        <Input
          label="Senha"
          type="password"
          value={password}
          error={error}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button size="lg" className="w-full" loading={loading} onClick={enter}>
          Entrar
        </Button>
      </Card>
    </div>
  );
}
