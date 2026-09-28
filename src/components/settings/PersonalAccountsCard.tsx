"use client";

import { Button, Card, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { isEmail, passwordProblem } from "@/lib/validators";
import { useEffect, useState } from "react";

type Item = { email: string; name: string | null };

export function PersonalAccountsCard() {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function reload() {
    const res = await fetch("/api/auth/personals");
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      toast(data?.error?.message ?? "Não foi possível carregar as professoras", "error");
      return;
    }
    setItems(data.items ?? []);
    setMe(data.me ?? null);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/auth/personals");
      const data = await res.json().catch(() => null);
      if (cancelled) return;
      if (!res.ok) {
        toast(data?.error?.message ?? "Não foi possível carregar as professoras", "error");
        return;
      }
      setItems(data.items ?? []);
      setMe(data.me ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  async function add() {
    if (!isEmail(email)) {
      toast("E-mail inválido", "error");
      return;
    }
    const problem = passwordProblem(password);
    if (problem) {
      toast(problem, "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/personals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast(data?.error?.message ?? "Não foi possível adicionar", "error");
        return;
      }
      setEmail("");
      setName("");
      setPassword("");
      toast("Professora adicionada");
      await reload();
    } finally {
      setLoading(false);
    }
  }

  async function remove(target: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/personals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast(data?.error?.message ?? "Não foi possível remover", "error");
        return;
      }
      toast("Acesso removido");
      await reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mt-6 max-w-lg space-y-4">
      <div>
        <h2 className="text-subtitle">Professoras com acesso</h2>
        <p className="text-sm text-text-muted">
          Adicione outro e-mail de professora com senha inicial. Todas veem os mesmos alunos e treinos.
        </p>
      </div>
      <ul className="space-y-2">
        {items.map((a) => (
          <li
            key={a.email}
            className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {a.name || a.email}
                {me === a.email ? (
                  <span className="ml-2 text-caption text-text-muted">(você)</span>
                ) : null}
              </p>
              {a.name ? <p className="truncate text-caption">{a.email}</p> : null}
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={loading || me === a.email || items.length <= 1}
              onClick={() => remove(a.email)}
            >
              Remover
            </Button>
          </li>
        ))}
      </ul>
      <div className="space-y-3 border-t border-border pt-3">
        <p className="text-sm font-medium">Adicionar professora</p>
        <Input
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Opcional"
        />
        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Senha inicial"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helper="Mínimo 8 caracteres, com letras e números."
        />
        <Button type="button" size="sm" loading={loading} onClick={add}>
          Adicionar acesso
        </Button>
      </div>
    </Card>
  );
}
