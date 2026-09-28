"use client";

import { Button, Card, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { isEmail, passwordProblem } from "@/lib/validators";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "";
  const { toast } = useToast();
  const [ready, setReady] = useState<boolean | null>(null);
  const [role, setRole] = useState<"personal" | "aluno">(next.startsWith("/aluno") ? "aluno" : "personal");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) => setReady(Boolean(d.ready)))
      .catch(() => setReady(true));
  }, []);

  const creating = ready === false && role === "personal";

  async function submit() {
    if (!isEmail(email)) {
      toast("E-mail inválido", "error");
      return;
    }
    if (creating) {
      const problem = passwordProblem(password);
      if (problem) {
        toast(problem, "error");
        return;
      }
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: creating ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
          ...(creating && name.trim() ? { name: name.trim() } : {}),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast(data?.error?.message ?? "Não foi possível entrar", "error");
        return;
      }
      if (data?.role === "aluno" && data.id) localStorage.setItem("nfit_aluno_id", data.id);
      toast(creating ? "Senha criada" : "Pronto");
      const dest = data?.role === "aluno" ? "/aluno" : next.startsWith("/") && !next.startsWith("/aluno") ? next : "/dashboard";
      router.push(data?.role === "aluno" && next.startsWith("/aluno") ? next : dest);
    } finally {
      setLoading(false);
    }
  }

  if (ready === null) return <Card><p className="text-sm text-text-muted">Carregando…</p></Card>;

  return (
    <Card className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" size="sm" variant={role === "personal" ? "primary" : "secondary"} onClick={() => setRole("personal")}>
          Personal
        </Button>
        <Button type="button" size="sm" variant={role === "aluno" ? "primary" : "secondary"} onClick={() => setRole("aluno")}>
          Aluno
        </Button>
      </div>
      <p className="text-body-sm text-text-muted">
        {creating
          ? "Primeira vez. Crie o e-mail e a senha da área profissional. Depois, só entra quem souber essa senha."
          : role === "aluno"
            ? "Entre com o e-mail do cadastro e a senha que você criou no link."
            : "Área da personal. E-mail e senha."}
      </p>
      {creating ? (
        <Input label="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
      ) : null}
      <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
      <Input label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={creating ? "new-password" : "current-password"} />
      <Button onClick={submit} loading={loading} size="lg" className="w-full">
        {creating ? "Criar senha e entrar" : "Entrar"}
      </Button>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Card><p className="text-sm text-text-muted">Carregando…</p></Card>}>
      <LoginForm />
    </Suspense>
  );
}
