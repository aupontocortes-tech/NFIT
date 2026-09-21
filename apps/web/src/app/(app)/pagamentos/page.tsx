"use client";

import { getPayments } from "@/lib/api";
import { formatDate, formatMoney, paymentLabel } from "@/lib/format";
import { useAsync } from "@/lib/use-async";
import { Badge, Card, Empty } from "@/components/ui";

const tone = {
  paid: "ok",
  pending: "warn",
  overdue: "danger",
} as const;

export default function PaymentsPage() {
  const { data, error, loading } = useAsync(() => getPayments(), []);

  if (loading) return <p className="text-sm text-zinc-400">Carregando pagamentos…</p>;
  if (error || !data) return <p className="text-sm text-rose-300">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Pagamentos</h1>
        <p className="mt-1 text-sm text-zinc-400">Mensalidades da Fase 1.</p>
      </div>
      {data.length === 0 ? (
        <Empty title="Sem lançamentos" />
      ) : (
        <div className="space-y-2">
          {data.map((payment) => (
            <Card key={payment.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">
                  {payment.studentName} · {formatMoney(payment.amount)}
                </p>
                <p className="text-sm text-zinc-400">
                  Vence {formatDate(payment.dueDate)}
                  {payment.paidAt ? ` · pago em ${formatDate(payment.paidAt)}` : ""}
                </p>
              </div>
              <Badge tone={tone[payment.status]}>{paymentLabel[payment.status]}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
