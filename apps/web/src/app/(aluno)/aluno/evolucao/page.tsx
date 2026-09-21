"use client";

import { Button, Card, Empty, Input, PageHeader, Skeleton } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { LineChart } from "lucide-react";
import { useEffect, useState } from "react";

export default function EvolucaoPage() {
  const { toast } = useToast();
  const [data, setData] = useState<Awaited<
    ReturnType<typeof api.getStudentEvolution>
  > | null>(null);
  const [weight, setWeight] = useState("");

  useEffect(() => {
    api.getStudentEvolution().then(setData);
  }, []);

  if (!data) return <Skeleton className="h-48 w-full" />;

  const max = Math.max(...data.weights.map((w) => w.weightKg), 1);
  const min = Math.min(...data.weights.map((w) => w.weightKg), max - 1);

  return (
    <div>
      <PageHeader title="Evolução" description="Peso e medidas ao longo do tempo" />
      {data.weights.length === 0 ? (
        <Empty icon={LineChart} title="Sem dados ainda" />
      ) : (
        <Card className="mb-6">
          <p className="mb-4 text-sm font-medium">Peso (kg)</p>
          <div className="flex h-40 items-end gap-3">
            {data.weights.map((w) => {
              const h =
                ((w.weightKg - min) / (max - min || 1)) * 100 + 20;
              return (
                <div
                  key={w.date}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <span className="text-caption tabular-nums">{w.weightKg}</span>
                  <div
                    className="w-full rounded-t bg-brand"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[10px] text-text-muted">
                    {formatDate(w.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card>
        <p className="mb-3 text-sm font-medium">Registrar peso rápido</p>
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.1"
            placeholder="kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => {
              toast("Peso registrado");
              setWeight("");
            }}
            disabled={!weight}
          >
            Salvar
          </Button>
        </div>
      </Card>
    </div>
  );
}
