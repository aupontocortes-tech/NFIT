"use client";

import { AssessmentCompare } from "@/components/assessments/AssessmentCompare";
import { Empty, PageHeader, Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import type { Assessment } from "@/lib/mocks";
import { LineChart } from "lucide-react";
import { useEffect, useState } from "react";

export default function EvolucaoPage() {
  const [items, setItems] = useState<Assessment[] | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("nfit_aluno_id") ?? "";
    if (!id) {
      setItems([]);
      return;
    }
    api.listAssessments(id).then((r) => setItems(r.items)).catch(() => setItems([]));
  }, []);

  if (!items) return <Skeleton className="h-48 w-full" />;

  return (
    <div>
      <PageHeader title="Evolução" description="Fotos das avaliações, da mais antiga para a mais nova" />
      {items.length === 0 ? (
        <Empty
          icon={LineChart}
          title="Sem avaliações ainda"
          description="Quando houver fotos da avaliação física, a comparação aparece aqui."
        />
      ) : (
        <AssessmentCompare items={items} />
      )}
    </div>
  );
}
