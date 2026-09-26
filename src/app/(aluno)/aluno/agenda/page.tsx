"use client";

import { ClassCalendar } from "@/components/agenda/ClassCalendar";
import { PageHeader, Select, Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import type { EventItem, Student } from "@/lib/mocks";
import { useEffect, useState } from "react";

export default function AlunoAgendaPage() {
  const [items, setItems] = useState<EventItem[] | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    api.listEvents().then((r) => setItems(r.items)).catch(() => setItems([]));
    api.listStudents().then((r) => {
      setStudents(r.items);
      if (r.items.length === 1) setStudentId(r.items[0].id);
    });
  }, []);

  const mine = (items ?? []).filter((e) => !studentId || e.studentId === studentId);

  return (
    <div>
      <PageHeader title="Minhas aulas" description="Dia, semana e mês" />
      {students.length > 1 ? (
        <Select
          label="Aluno"
          className="mb-4"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      ) : null}
      {!items ? <Skeleton className="h-80 w-full" /> : <ClassCalendar events={mine} readOnly />}
    </div>
  );
}
