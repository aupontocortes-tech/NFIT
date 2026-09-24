"use client";

import { Badge, Button, Card, Empty, PageHeader, Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Dumbbell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AlunoInicioPage() {
  const [home, setHome] = useState<Awaited<
    ReturnType<typeof api.getStudentHome>
  > | null>(null);

  useEffect(() => {
    api.getStudentHome().then(setHome);
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

      {home.nextEvents.length > 0 ? (
        <div>
          <h3 className="text-subtitle mb-3">Próximos eventos</h3>
          <ul className="space-y-2">
            {home.nextEvents.map((e) => (
              <li key={e.id}>
                <Card>
                  <p className="font-medium">{e.title}</p>
                  <p className="text-caption">{formatDate(e.startsAt)}</p>
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
