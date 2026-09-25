"use client";

import {
  Avatar,
  Badge,
  Button,
  Empty,
  Input,
  PageHeader,
  SkeletonList,
} from "@/components/ui";
import { api } from "@/lib/api";
import type { Student } from "@/lib/mocks";
import { Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const statusTone = {
  active: "active",
  paused: "paused",
  invite_pending: "invite",
} as const;

export default function AlunosPage() {
  const [result, setResult] = useState<{ key: string; items: Student[] } | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  // Busca de novo quando o filtro muda; ignora respostas antigas
  const key = JSON.stringify({ q, status });
  useEffect(() => {
    let alive = true;
    api
      .listStudents({ q: q || undefined, status: status || undefined })
      .then((r) => alive && setResult({ key, items: r.items }));
    return () => {
      alive = false;
    };
  }, [key, q, status]);
  const items = result?.key === key ? result.items : null;

  return (
    <div>
      <PageHeader
        title="Alunos"
        action={
          <Link href="/alunos/novo">
            <Button>Novo aluno</Button>
          </Link>
        }
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Buscar por nome ou e-mail"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1"
        />
        <select
          className="h-11 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="active">Ativos</option>
          <option value="paused">Pausados</option>
          <option value="invite_pending">Convite pendente</option>
        </select>
      </div>
      {!items ? (
        <SkeletonList />
      ) : items.length === 0 ? (
        <Empty
          icon={Users}
          title="Nenhum aluno encontrado"
          description="Adicione seu primeiro aluno para começar."
          action={
            <Link href="/alunos/novo">
              <Button>Adicionar aluno</Button>
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((s) => (
            <li key={s.id}>
              <Link
                href={`/alunos/${s.id}`}
                className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm transition hover:bg-hover"
              >
                <Avatar name={s.name} src={s.avatarUrl} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.name}</p>
                  <p className="truncate text-caption">{s.email}</p>
                </div>
                <Badge tone={statusTone[s.status]} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
