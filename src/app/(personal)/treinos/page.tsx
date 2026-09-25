"use client";

import {
  Badge,
  Button,
  Empty,
  PageHeader,
  SkeletonList,
} from "@/components/ui";
import { api } from "@/lib/api";
import type { Workout } from "@/lib/mocks";
import { formatDate } from "@/lib/utils";
import { Dumbbell, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TreinosPage() {
  const [result, setResult] = useState<{ key: string; items: Workout[] } | null>(null);
  const [status, setStatus] = useState("");

  // Busca de novo quando o filtro muda; ignora respostas antigas
  const key = status;
  useEffect(() => {
    let alive = true;
    api
      .listWorkouts({ status: status || undefined })
      .then((r) => alive && setResult({ key, items: r.items }));
    return () => {
      alive = false;
    };
  }, [key, status]);
  const items = result?.key === key ? result.items : null;

  return (
    <div>
      <PageHeader
        title="Treinos"
        action={
          <>
            <Link href="/treinos/gerar">
              <Button variant="ai" size="sm">
                <Sparkles className="h-4 w-4" />
                Gerar com IA
              </Button>
            </Link>
            <Link href="/treinos/novo">
              <Button size="sm">Novo treino</Button>
            </Link>
          </>
        }
      />
      <div className="mb-4">
        <select
          className="h-11 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="draft">Rascunhos</option>
          <option value="template">Templates</option>
          <option value="archived">Arquivados</option>
        </select>
      </div>
      {!items ? (
        <SkeletonList />
      ) : items.length === 0 ? (
        <Empty
          icon={Dumbbell}
          title="Nenhum treino"
          description="Crie manualmente ou gere um rascunho com IA."
          action={
            <Link href="/treinos/gerar">
              <Button variant="ai">
                <Sparkles className="h-4 w-4" />
                Gerar com IA
              </Button>
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((w) => (
            <li key={w.id}>
              <Link
                href={`/treinos/${w.id}`}
                className="block rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm transition hover:bg-hover"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{w.title}</p>
                  <Badge
                    tone={
                      w.status === "draft"
                        ? "draft"
                        : w.status === "archived"
                          ? "paused"
                          : "active"
                    }
                  />
                  {w.generatedByAi ? <Badge tone="ai" /> : null}
                </div>
                <p className="mt-1 text-caption">
                  {w.goal ?? "Sem objetivo"} · {w.exerciseCount} exercícios ·{" "}
                  {formatDate(w.updatedAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
