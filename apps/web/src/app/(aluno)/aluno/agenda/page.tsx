"use client";

import { Badge, Card, Empty, PageHeader, SkeletonList } from "@/components/ui";
import { api } from "@/lib/api";
import type { EventItem } from "@/lib/mocks";
import { formatDate } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

export default function AlunoAgendaPage() {
  const [items, setItems] = useState<EventItem[] | null>(null);

  useEffect(() => {
    api.listEvents().then((r) =>
      setItems(r.items.filter((e) => e.studentId === "s-001")),
    );
  }, []);

  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Somente leitura — remarque via chat"
      />
      {!items ? (
        <SkeletonList rows={3} />
      ) : items.length === 0 ? (
        <Empty icon={Calendar} title="Nenhum evento" />
      ) : (
        <ul className="space-y-3">
          {items.map((e) => (
            <li key={e.id}>
              <Card>
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="font-medium">{e.title}</p>
                    <p className="text-caption">{formatDate(e.startsAt)}</p>
                    {e.location ? (
                      <p className="text-caption">{e.location}</p>
                    ) : null}
                  </div>
                  <Badge tone="default" className="capitalize">
                    {e.type}
                  </Badge>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
