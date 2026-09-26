"use client";

import { ClassCalendar } from "@/components/agenda/ClassCalendar";
import {
  Button,
  Input,
  Modal,
  PageHeader,
  Select,
  Skeleton,
  Textarea,
} from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { EventItem, Student } from "@/lib/mocks";
import { useEffect, useState } from "react";

function localInput(day: Date) {
  const x = new Date(day);
  x.setHours(8, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
}

export default function AgendaPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<EventItem[] | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    type: "workout",
    title: "Aula",
    startsAt: "",
    endsAt: "",
    location: "",
    notes: "",
  });

  async function reload() {
    const r = await api.listEvents();
    setItems(r.items);
  }

  useEffect(() => {
    reload().catch(() => setItems([]));
    api.listStudents().then((r) => setStudents(r.items)).catch(() => setStudents([]));
  }, []);

  function openOn(day: Date) {
    const start = localInput(day);
    const endDate = new Date(day);
    endDate.setHours(9, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    const end = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}T09:00`;
    setForm((f) => ({ ...f, startsAt: start, endsAt: end, title: f.title || "Aula" }));
    setOpen(true);
  }

  async function create() {
    const student = students.find((s) => s.id === form.studentId);
    if (!student) return;
    try {
      await api.createEvent({
        studentId: student.id,
        studentName: student.name,
        title: form.title || "Aula",
        type: form.type as EventItem["type"],
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : new Date(new Date(form.startsAt).getTime() + 3600000).toISOString(),
        location: form.location,
        notes: form.notes,
      });
      toast("Aula marcada");
      setOpen(false);
      await reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível marcar", "error");
    }
  }

  async function move(event: EventItem, startsAt: Date, endsAt: Date) {
    await api.updateEvent(event.id, {
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      status: "rescheduled",
    });
    toast(`Aula de ${event.studentName} remarcada`);
    await reload();
  }

  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Aulas do dia, da semana e do mês"
        action={
          <Button size="sm" onClick={() => openOn(new Date())}>
            Nova aula
          </Button>
        }
      />
      {!items ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <ClassCalendar events={items} onCreateDay={openOn} onMove={move} />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nova aula"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={create} disabled={!form.studentId || !form.startsAt}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            label="Aluno"
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
          >
            <option value="">Selecione</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Input
            label="Título"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            label="Início"
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
          />
          <Input
            label="Fim"
            type="datetime-local"
            value={form.endsAt}
            onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
          />
          <Input
            label="Local"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <Textarea
            label="Notas"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
