"use client";

import { Button, Card, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.acceptInvite(params.get("token") ?? "mock", password, name);
      toast("Bem-vindo ao nfit");
      router.push("/aluno/inicio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h1 className="text-title mb-2">Aceitar convite</h1>
      <p className="mb-6 text-body-sm text-text-muted">
        Defina sua senha para começar.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome (opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" loading={loading} size="lg">
          Começar
        </Button>
      </form>
    </Card>
  );
}

export default function AceitarConvitePage() {
  return (
    <Suspense>
      <Form />
    </Suspense>
  );
}
