"use client";

import { Badge, Card, Empty, PageHeader, SkeletonList } from "@/components/ui";
import { api } from "@/lib/api";
import type { Invoice } from "@/lib/mocks";
import { formatDate, formatMoney } from "@/lib/utils";
import { CreditCard } from "lucide-react";
import { useEffect, useState } from "react";

export default function PagamentosPage() {
  const [items, setItems] = useState<Invoice[] | null>(null);

  useEffect(() => {
    api.getStudentInvoices().then(setItems);
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
              <Card className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{inv.description}</p>
                  <p className="text-caption">
                    Vence {formatDate(inv.dueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">
                    {formatMoney(inv.amount.amount)}
                  </p>
                  <Badge tone={inv.status} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
