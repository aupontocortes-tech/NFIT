"use client";

import { Button, Card, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { passwordProblem } from "@/lib/validators";
import { useEffect, useState } from "react";

export function AnotherPersonalCard() {
  const { toast } = useToast();
  const [emails, setEmails] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/equipe")
      .then((res) => (res.ok ? res.json() : { emails: [] }))
      .then((data) => setEmails(data.emails ?? []))
      .catch(() => setEmails([]));
  }, []);

  async function save() {
    const problem = passwordProblem(password);
    if (name.trim().length < 2) {
      toast("Informe o nome.", "error");
      return;
    }
    if (problem) {
      toast(problem, "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/equipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast(data?.error?.message ?? "Não foi possível cadastrar", "error");
        return;
      }
      setEmails((current) => [...current, email.trim().toLowerCase()]);
      setName("");
      setEmail("");
      setPassword("");
      toast("Salvamento concluído. Ela já pode entrar como personal.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-6 max-w-lg space-y-4">
      <h2 className="text-subtitle">Outra personal</h2>
      <p className="text-sm text-text-muted">
        Ela entra em Login, na aba Personal, com o e-mail e a senha daqui. Vê os mesmos alunos, treinos e agenda.
      </p>
      {emails.length > 0 ? (
        <ul className="space-y-1 text-sm">
          {emails.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input
        label="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        helper="Mínimo 8 caracteres, com letras e números."
      />
      <Button type="button" size="sm" loading={saving} onClick={save}>
        Cadastrar personal
      </Button>
    </Card>
  );
}
