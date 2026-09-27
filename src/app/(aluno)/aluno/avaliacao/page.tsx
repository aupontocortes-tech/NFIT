"use client";

import { Card, Empty, PageHeader, Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import type { Assessment } from "@/lib/mocks";
import { formatDate } from "@/lib/utils";
import { ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";

const photoLabels = ["Frente", "Lado direito", "Lado esquerdo", "Costas"];

export default function AlunoAvaliacaoPage() {
  const [items, setItems] = useState<Assessment[] | null>(null);
  const [when, setWhen] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("nfit_aluno_id") ?? "";
    if (!id) {
      setItems([]);
      return;
    }
    api.getStudent(id).then((s) => setWhen(s.nextAssessmentAt ?? null)).catch(() => setWhen(null));
    api.listAssessments(id).then((r) => setItems(r.items)).catch(() => setItems([]));
  }, []);

  if (!items) return <Skeleton className="h-48 w-full" />;

  return (
    <div>
      <PageHeader title="Sua avaliação" />
      {when ? (
        <Card className="mb-4">
          <p className="text-sm font-semibold">Próxima avaliação</p>
          <p className="mt-1 text-sm text-text-muted">
            {new Date(when).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
          </p>
        </Card>
      ) : null}
      {items.length === 0 ? (
        <Empty
          icon={ClipboardList}
          title="Nenhuma avaliação ainda"
          description="Quando você enviar a avaliação, as fotos e os resultados aparecem aqui."
        />
      ) : (
        <ul className="space-y-4">
          {items.map((a) => (
            <li key={a.id}>
              <Card className="space-y-3">
                <p className="font-semibold">{formatDate(a.date.length === 10 ? `${a.date}T12:00:00` : a.date)}</p>
                <p className="text-sm">{weightLine(a.bmiLabel)}</p>
                {a.whrLabel ? <p className="text-sm text-text-muted">{waistLine(a.whrLabel)}</p> : null}
                <p className="text-caption tabular-nums">
                  {[
                    a.weightKg != null ? `Peso ${a.weightKg.toLocaleString("pt-BR")} kg` : "",
                    a.bodyFatPercent != null ? `Gordura ${a.bodyFatPercent.toLocaleString("pt-BR")}%` : "",
                    a.leanMassKg != null ? `Massa magra ${a.leanMassKg.toLocaleString("pt-BR")} kg` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="text-caption tabular-nums">
                  {[
                    side("Braço", a.measurements.bicepsRight, a.measurements.bicepsLeft, a.measurements.biceps),
                    side("Antebraço", a.measurements.forearmRight, a.measurements.forearmLeft, a.measurements.forearm),
                    side("Coxa", a.measurements.thighRight, a.measurements.thighLeft, a.measurements.thigh),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {a.photoUrls.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {a.photoUrls.map((url, i) => (
                      <figure key={url}>
                        <img src={url} alt={photoLabels[i] ?? "Foto da avaliação"} className="aspect-[3/4] w-full rounded-[var(--radius-md)] object-cover" />
                        <figcaption className="mt-1 text-caption">{photoLabels[i] ?? "Foto"}</figcaption>
                      </figure>
                    ))}
                  </div>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function weightLine(label?: string) {
  if (label === "Abaixo do peso") return "Seu peso está um pouco abaixo do esperado para a sua altura.";
  if (label === "Peso normal") return "Seu peso está normal para a sua altura.";
  if (label === "Sobrepeso") return "Seu peso está um pouco acima do esperado para a sua altura.";
  if (!label) return "Avaliação registrada.";
  return "Seu peso está acima do esperado para a sua altura.";
}

function waistLine(label: string) {
  if (label === "Baixo") return "Sua cintura está baixa em relação ao quadril.";
  if (label === "Moderado") return "Sua cintura está no meio em relação ao quadril.";
  return "Sua cintura está alta em relação ao quadril.";
}

function side(label: string, right?: number, left?: number, single?: number) {
  if (right != null || left != null) return `${label} D ${right ?? "—"} · E ${left ?? "—"} cm`;
  if (single != null) return `${label} ${single} cm`;
  return "";
}
