"use client";

import { Button, Card } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Por enquanto sem e-mail/senha — um toque e entra. */
export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function entrar() {
    setLoading(true);
    try {
      await api.login("personal@nfit.local", "senha12345");
      toast("Pronto");
      router.push("/dashboard");
    } catch {
      toast("Não foi possível entrar", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h1 className="text-title mb-1">nfit</h1>
      <p className="mb-6 text-body-sm text-text-muted">
        Acesso liberado — sem e-mail nem senha por enquanto.
      </p>
      <Button onClick={entrar} loading={loading} size="lg" className="w-full">
        Entrar
      </Button>
    </Card>
  );
}
