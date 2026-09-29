"use client";

import { Badge, Button, Card, Empty } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api";
import type { Assignment } from "@/lib/mocks";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export function StudentWorkoutList({
  items,
  onDeleted,
}: {
  items: Assignment[];
  onDeleted: (id: string) => void;
}) {
  const { toast } = useToast();
  const [ask, setAsk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const visible = items.filter((item) => item.status !== "cancelled");

  async function remove(id: string) {
    setBusy(true);
    try {
      await api.deleteAssignment(id);
      onDeleted(id);
      setAsk(null);
      toast("Treino excluído");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Não foi possível excluir o treino", "error");
    } finally {
      setBusy(false);
    }
  }

  if (visible.length === 0) {
    return (
      <Empty
        title="Nenhum treino deste aluno"
        description="Quando um treino for salvo para este aluno, ele aparece aqui."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {visible.map((item) => {
        const count = item.workout?.exerciseCount ?? item.workout?.blocks.reduce((total, block) => total + (block.exercises?.length ?? 0), 0) ?? 0;
        return (
          <li key={item.id}>
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <Link href={`/treinos/${item.workoutId}`} className="min-w-0">
                  <p className="font-medium">{item.workoutTitle || "Treino"}</p>
                  <p className="text-caption">
                    Início {formatDate(item.startDate)}
                    {count > 0 ? ` · ${count} exercícios` : ""}
                    {item.workout?.level ? ` · ${item.workout.level}` : ""}
                  </p>
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="active">{item.status === "completed" ? "Feito" : "Ativo"}</Badge>
                  {ask === item.id ? (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => setAsk(null)}>
                        Cancelar
                      </Button>
                      <Button size="sm" variant="danger" loading={busy} onClick={() => remove(item.id)}>
                        Confirmar
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => setAsk(item.id)}>
                      Excluir
                    </Button>
                  )}
                </div>
              </div>
              {ask === item.id ? (
                <p className="mt-2 text-sm text-text-muted">
                  Este treino sai da área deste aluno. O aluno deixa de vê-lo.
                </p>
              ) : null}
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
