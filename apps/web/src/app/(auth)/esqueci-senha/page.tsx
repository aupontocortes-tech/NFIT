"use client";

import { Button, Card, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import Link from "next/link";
import { useState } from "react";

export default function EsqueciSenhaPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
      toast("Se o e-mail existir, enviamos o link", "info");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h1 className="text-title mb-2">Esqueci a senha</h1>
      <p className="mb-6 text-body-sm text-text-muted">
        Enviaremos um link para redefinir sua senha.
      </p>
      {sent ? (
        <p className="text-body-sm text-success">
          Verifique sua caixa de entrada (e spam).
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" loading={loading} size="lg">
            Enviar link
          </Button>
        </form>
      )}
      <Link href="/login" className="mt-4 block text-center text-sm text-brand">
        Voltar ao login
      </Link>
    </Card>
  );
}
