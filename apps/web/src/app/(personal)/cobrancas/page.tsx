"use client";

import {
  Badge,
  Button,
  Empty,
  PageHeader,
  SkeletonList,
} from "@/components/ui";
import { api } from "@/lib/api";
import type { Invoice } from "@/lib/mocks";
import { formatDate, formatMoney } from "@/lib/utils";
import { CreditCard } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CobrancasPage() {
  const [items, setItems] = useState<Invoice[] | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setItems(null);
    api
      .listInvoices({ status: status || undefined })
      .then((r) => setItems(r.items));
  }, [status]);

  return (
    <div>
      <PageHeader
        title="Cobranças"
        action={
          <Link href="/cobrancas/nova">
            <Button size="sm">Nova cobrança</Button>
          </Link>
        }
      />
      <select
        className="mb-4 h-11 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">Todas</option>
        <option value="pending">Pendentes</option>
        <option value="paid">Pagas</option>
        <option value="overdue">Atrasadas</option>
      </select>
      {!items ? (
        <SkeletonList />
      ) : items.length === 0 ? (
        <Empty icon={CreditCard} title="Nenhuma cobrança" />
      ) : (
        <ul className="space-y-3">
          {items.map((inv) => (
            <li key={inv.id}>
              <Link
                href={`/cobrancas/${inv.id}`}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{inv.studentName}</p>
                  <p className="text-caption">
                    {inv.description} · vence {formatDate(inv.dueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">
                    {formatMoney(inv.amount.amount)}
                  </p>
                  <Badge tone={inv.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
