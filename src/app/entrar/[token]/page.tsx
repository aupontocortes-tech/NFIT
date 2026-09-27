"use client";

import { AppName } from "@/components/ui/AppName";
import { Card } from "@/components/ui";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EntrarAlunoPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [missing, setMissing] = useState(false);

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
        localStorage.setItem("nfit_aluno_id", data.id);
        router.replace("/aluno");
      })
      .catch(() => setMissing(true));
  }, [token, router]);

  if (!missing) {
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
      <Card className="mt-8">
        <h1 className="text-title">Link inválido</h1>
        <p className="mt-2 text-sm text-text-muted">Peça um novo link para a sua personal.</p>
      </Card>
    </div>
  );
}
