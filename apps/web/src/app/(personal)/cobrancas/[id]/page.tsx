"use client";

import { Badge, Button, Card, PageHeader, Skeleton } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { Invoice } from "@/lib/mocks";
import { formatDate, formatMoney } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CobrancaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [inv, setInv] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getInvoice(id).then(setInv).catch(() => setInv(null));
  }, [id]);

  async function markPaid() {
    setLoading(true);
    try {
      const updated = await api.markInvoicePaid(id);
      setInv(updated);
      toast("Marcada como paga");
    } finally {
      setLoading(false);
    }
  }

  if (!inv) return <Skeleton className="h-40 w-full" />;

  return (
    <div>
      <PageHeader
        title={inv.description}
        action={
          inv.status !== "paid" ? (
            <Button size="sm" loading={loading} onClick={markPaid}>
              Marcar como pago
            </Button>
          ) : null
        }
      />
      <Card className="max-w-lg space-y-3">
        <div className="flex items-center justify-between">
          <Link href={`/alunos/${inv.studentId}`} className="font-medium text-brand">
            {inv.studentName}
          </Link>
          <Badge tone={inv.status} />
        </div>
        <p className="text-3xl font-bold tabular-nums">
          {formatMoney(inv.amount.amount)}
        </p>
        <p className="text-caption">Vencimento: {formatDate(inv.dueDate)}</p>
        {inv.paidAt ? (
          <p className="text-caption text-success">
            Pago em {formatDate(inv.paidAt)}
          </p>
        ) : null}
      </Card>
    </div>
  );
}
