"use client";

import { use } from "react";
import Link from "next/link";
import { getStudent } from "@/lib/api";
import { formatMoney, paymentLabel } from "@/lib/format";
import { useAsync } from "@/lib/use-async";
import { Badge, Card } from "@/components/ui";

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading } = useAsync(() => getStudent(id), [id]);

  if (loading) return <p className="text-sm text-zinc-400">Carregando aluno…</p>;
  if (error || !data) return <p className="text-sm text-rose-300">{error}</p>;

  return (
    <div className="space-y-6">
      <Link href="/alunos" className="text-sm text-zinc-400 hover:text-white">
        ← Alunos
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">{data.name}</h1>
          <p className="mt-1 text-zinc-400">{data.email}</p>
        </div>
        <Badge tone={data.status === "paid" ? "ok" : data.status === "pending" ? "warn" : "danger"}>
          {paymentLabel[data.status]}
        </Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Plano</p>
          <p className="mt-2 text-lg">{data.plan}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Mensalidade</p>
          <p className="mt-2 text-lg">{formatMoney(data.monthlyValue)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Vencimento</p>
          <p className="mt-2 text-lg">Dia {data.dueDay}</p>
        </Card>
      </div>
      <Card>
        <p className="text-sm text-zinc-400">Telefone</p>
        <p className="mt-1">{data.phone}</p>
        <p className="mt-4 text-sm text-zinc-400">Início</p>
        <p className="mt-1">{new Date(data.startedAt).toLocaleDateString("pt-BR")}</p>
      </Card>
    </div>
  );
}
