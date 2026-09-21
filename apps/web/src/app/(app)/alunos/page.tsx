"use client";

import Link from "next/link";
import { getStudents } from "@/lib/api";
import { formatMoney, paymentLabel } from "@/lib/format";
import { useAsync } from "@/lib/use-async";
import { useAuth } from "@/components/auth-provider";
import { Badge, Card, Empty } from "@/components/ui";

const tone = {
  paid: "ok",
  pending: "warn",
  overdue: "danger",
} as const;

export default function StudentsPage() {
  const { user } = useAuth();
  const { data, error, loading } = useAsync(() => getStudents(), []);

  if (user?.role === "ALUNO") {
    return <p className="text-sm text-zinc-400">A lista de alunos é exclusiva do personal.</p>;
  }
  if (loading) return <p className="text-sm text-zinc-400">Carregando alunos…</p>;
  if (error || !data) return <p className="text-sm text-rose-300">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Alunos</h1>
        <p className="mt-1 text-sm text-zinc-400">{data.length} cadastros na base da Fase 1.</p>
      </div>
      {data.length === 0 ? (
        <Empty title="Nenhum aluno" />
      ) : (
        <div className="grid gap-3">
          {data.map((student) => (
            <Link key={student.id} href={`/alunos/${student.id}`}>
              <Card className="flex flex-wrap items-center justify-between gap-4 transition hover:border-lime-300/25">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-zinc-400">
                    {student.plan} · {formatMoney(student.monthlyValue)} · vence dia {student.dueDay}
                  </p>
                </div>
                <Badge tone={tone[student.status]}>{paymentLabel[student.status]}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
