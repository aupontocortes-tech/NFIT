"use client";

import { PixPayment } from "@/components/payments/PixPayment";
import { Badge, Button, Card, Empty, Modal, PageHeader, SkeletonList } from "@/components/ui";
import { api } from "@/lib/api";
import type { Invoice } from "@/lib/mocks";
import type { PixConfig } from "@/lib/pix";
import { formatDate, formatMoney } from "@/lib/utils";
import { CreditCard, QrCode } from "lucide-react";
import { useEffect, useState } from "react";

export default function PagamentosPage() {
  const [items, setItems] = useState<Invoice[] | null>(null);
  const [pix, setPix] = useState<PixConfig | null>(null);
  const [paying, setPaying] = useState<Invoice | null>(null);

  useEffect(() => {
    api.getStudentInvoices().then(setItems);
    api.getPaymentInfo().then((r) => setPix(r.pix)).catch(() => setPix(null));
  }, []);

  return (
    <div>
      <PageHeader title="Pagamentos" description="Suas cobranças" />
      {!items ? (
        <SkeletonList rows={3} />
      ) : items.length === 0 ? (
        <Empty icon={CreditCard} title="Nenhuma cobrança" />
      ) : (
        <ul className="space-y-3">
          {items.map((inv) => (
            <li key={inv.id}>
              <Card className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{inv.description}</p>
                    <p className="text-caption">Vence {formatDate(inv.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">{formatMoney(inv.amount.amount)}</p>
                    <Badge tone={inv.status} />
                  </div>
                </div>
                {inv.status !== "paid" ? (
                  pix ? (
                    <Button className="w-full" onClick={() => setPaying(inv)}>
                      <QrCode className="h-4 w-4" />
                      Pagar com PIX
                    </Button>
                  ) : (
                    <p className="text-caption">
                      Seu personal ainda não cadastrou a chave PIX.
                    </p>
                  )
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!paying} onClose={() => setPaying(null)} title="Pagar com PIX">
        {paying && pix ? (
          <PixPayment
            config={pix}
            amount={paying.amount.amount}
            txid={paying.id}
            description={paying.description}
          />
        ) : null}
      </Modal>
    </div>
  );
}
