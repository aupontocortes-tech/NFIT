"use client";

import { Button, Card, PageHeader } from "@/components/ui";
import Link from "next/link";

export default function ResumoTreinoPage() {
  return (
    <div>
      <PageHeader title="Treino concluído" />
      <Card className="mb-6 text-center">
        <p className="text-4xl mb-2">✓</p>
        <p className="text-title">Parabéns!</p>
        <p className="mt-2 text-body-sm text-text-muted">
          Treino feito. O cheque já está na sua lista.
        </p>
      </Card>
      <Link href="/aluno">
        <Button size="lg">Voltar ao início</Button>
      </Link>
    </div>
  );
}
