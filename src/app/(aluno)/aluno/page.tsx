"use client";

import { Button, Card, Empty, PageHeader, Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import type { Assignment, EventItem } from "@/lib/mocks";
import { formatDate } from "@/lib/utils";
import { Check, Dumbbell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AlunoInicioPage() {
  const [workouts, setWorkouts] = useState<Assignment[] | null>(null);
  const [classes, setClasses] = useState<EventItem[]>([]);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("nfit_aluno_id") ?? "";
    if (!id) {
      setRegistered(false);
      setWorkouts([]);
      setClasses([]);
      return;
    }
    setRegistered(true);
    api.listAssignments({ studentId: id }).then((assigned) => {
      setWorkouts(assigned.filter((a) => a.status !== "cancelled"));
    }).catch(() => setWorkouts([]));
    api.listEvents().then((r) => {
      const now = Date.now();
      setClasses(
        r.items
          .filter((e) => e.status !== "cancelled" && e.studentId === id && new Date(e.startsAt).getTime() >= now)
          .slice(0, 4),
      );
    }).catch(() => setClasses([]));
  }, []);

  if (!workouts) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div>
      <PageHeader title="Seus treinos" />
      {workouts.length === 0 ? (
        <Empty
          icon={Dumbbell}
          title={registered ? "Seu personal ainda não liberou um treino" : "Faça seu cadastro"}
          description={
            registered
              ? "Quando um treino for salvo para você, ele aparece aqui."
              : "Use o link que a personal enviou. O cadastro é só seu."
          }
          action={
            registered ? (
              <Link href="/aluno/agenda">
                <Button size="sm">Ver agenda</Button>
              </Link>
            ) : null
          }
        />
      ) : (
        <ul className="mb-6 space-y-3">
          {workouts.map((a) => (
            <li key={a.id}>
              <Card>
                <div className="mb-1 flex items-center gap-2">
                  {a.status === "completed" ? (
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-text-inverse" aria-label="Treino feito">
                      <Check className="h-5 w-5" />
                    </span>
                  ) : null}
                  <h2 className="text-title">{a.workoutTitle || "Treino"}</h2>
                </div>
                <p className="mb-4 text-caption">
                  {a.status === "completed" ? "Treino feito" : `Desde ${formatDate(a.startDate)}`}
                </p>
                <Link href={`/aluno/treino/${a.id}`}>
                  <Button size="lg">{a.status === "completed" ? "Fazer de novo" : "Iniciar treino"}</Button>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {registered && classes.length === 0 ? (
        <Empty
          title="Nenhuma aula marcada"
          description="Quando a personal marcar o horário, ele aparece aqui."
          action={
            <Link href="/aluno/agenda">
              <Button size="sm">Ver agenda</Button>
            </Link>
          }
        />
      ) : classes.length > 0 ? (
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
    </div>
  );
}
