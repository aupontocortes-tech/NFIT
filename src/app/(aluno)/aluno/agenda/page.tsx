"use client";

import { ClassCalendar } from "@/components/agenda/ClassCalendar";
import { PageHeader, Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import type { EventItem } from "@/lib/mocks";
import { useEffect, useState } from "react";

export default function AlunoAgendaPage() {
  const [items, setItems] = useState<EventItem[] | null>(null);
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("nfit_aluno_id") ?? "";
    setStudentId(id);
    api.listEvents().then((r) => setItems(r.items)).catch(() => setItems([]));
  }, []);

  const mine = studentId ? (items ?? []).filter((e) => e.studentId === studentId) : [];

  return (
    <div>
      <PageHeader title="Minhas aulas" description="Dia, semana e mês" />
      {!items ? <Skeleton className="h-80 w-full" /> : <ClassCalendar events={mine} readOnly />}
    </div>
  );
}
