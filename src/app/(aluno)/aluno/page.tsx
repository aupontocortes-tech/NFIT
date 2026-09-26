"use client";

import { Badge, Button, Card, Empty, PageHeader, Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import type { EventItem } from "@/lib/mocks";
import { formatDate } from "@/lib/utils";
import { Dumbbell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AlunoInicioPage() {
  const [home, setHome] = useState<Awaited<
    ReturnType<typeof api.getStudentHome>
  > | null>(null);
  const [classes, setClasses] = useState<EventItem[]>([]);

  useEffect(() => {
    api.listStudents({ status: "active" }).then(async (r) => {
      const saved = localStorage.getItem("nfit_aluno_id");
      const id = r.items.find((s) => s.id === saved)?.id ?? r.items[0]?.id ?? "";
      if (id) localStorage.setItem("nfit_aluno_id", id);
      const assigned = id ? await api.listAssignments({ studentId: id }) : [];
      const active = assigned.find((a) => a.status === "active") ?? null;
      setHome({
        todayAssignment: active
          ? {
              id: active.id,
              workoutTitle: active.workoutTitle ?? "Treino",
              startDate: active.startDate,
              status: active.status,
            }
          : null,
        nextEvents: [],
        unreadMessages: 0,
      });
      const events = await api.listEvents().catch(() => ({ items: [] as EventItem[] }));
      const now = Date.now();
      setClasses(
        events.items
          .filter((e) => e.status !== "cancelled" && new Date(e.startsAt).getTime() >= now)
          .filter((e) => !id || e.studentId === id)
          .slice(0, 4),
      );
    }).catch(() =>
      setHome({ todayAssignment: null, nextEvents: [], unreadMessages: 0 }),
    );
  }, []);

  if (!home) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div>
      <PageHeader title="Treino de hoje" />
      {home.todayAssignment ? (
        <Card className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <Badge tone="active">Ativo</Badge>
          </div>
          <h2 className="text-title mb-1">
            {home.todayAssignment.workoutTitle}
          </h2>
          <p className="mb-4 text-caption">
            Desde {formatDate(home.todayAssignment.startDate)}
          </p>
          <Link href={`/aluno/treino/${home.todayAssignment.id}`}>
            <Button size="lg">Iniciar treino</Button>
          </Link>
        </Card>
      ) : (
        <Empty
          icon={Dumbbell}
          title="Seu personal ainda não liberou um treino"
          description="Assim que um treino for atribuído, ele aparece aqui."
        />
      )}

      {classes.length > 0 ? (
        <div>
          <h3 className="text-subtitle mb-3">Próximas aulas</h3>
          <ul className="space-y-2">
            {classes.map((e) => (
              <li key={e.id}>
                <Card>
                  <p className="font-medium">{e.title}</p>
                  <p className="text-caption">
                    {formatDate(e.startsAt)} ·{" "}
                    {new Date(e.startsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {home.unreadMessages > 0 ? (
        <Link href="/aluno/chat" className="mt-4 block text-sm text-brand">
          Você tem {home.unreadMessages} mensagens não lidas →
        </Link>
      ) : null}
    </div>
  );
}
