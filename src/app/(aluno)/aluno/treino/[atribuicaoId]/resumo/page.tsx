"use client";

import { Button, Card, PageHeader } from "@/components/ui";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ResumoTreinoPage() {
  const { atribuicaoId } = useParams<{ atribuicaoId: string }>();

  return (
    <div>
      <PageHeader title="Treino concluído" />
      <Card className="mb-6 text-center">
        <p className="text-4xl mb-2">✓</p>
        <p className="text-title text-success">Parabéns!</p>
        <p className="mt-2 text-body-sm text-text-muted">
          Sua sessão foi registrada. Seu personal verá o progresso.
        </p>
        <p className="mt-4 text-caption">Atribuição {atribuicaoId}</p>
      </Card>
      <Link href="/aluno">
        <Button size="lg">Voltar ao início</Button>
      </Link>
    </div>
  );
}
