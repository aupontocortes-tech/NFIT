"use client";

import { PixPayment } from "@/components/payments/PixPayment";
import { Badge, Button, Card, PageHeader, Skeleton } from "@/components/ui";
import { useProfile } from "@/lib/profile";
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
  const profile = useProfile();

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
      {inv.status !== "paid" ? (
        <Card className="mt-4 max-w-lg">
          <h2 className="text-subtitle mb-3">PIX desta cobrança</h2>
          {profile?.pix ? (
            <PixPayment
              config={profile.pix}
              amount={inv.amount.amount}
              txid={inv.id}
              description={inv.description}
            />
          ) : (
            <p className="text-sm text-text-muted">
              Cadastre sua chave PIX em{" "}
              <Link href="/configuracoes" className="text-brand underline">
                Configurações
              </Link>{" "}
              para gerar o QR Code.
            </p>
          )}
        </Card>
      ) : null}
    </div>
  );
}
