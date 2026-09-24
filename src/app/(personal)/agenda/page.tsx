"use client";

import {
  Badge,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  PageHeader,
  Select,
  SkeletonList,
  Textarea,
} from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { EventItem, Student } from "@/lib/mocks";
import { formatDate } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

export default function AgendaPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<EventItem[] | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    type: "workout",
    title: "",
    startsAt: "",
    endsAt: "",
    location: "",
    notes: "",
  });

  useEffect(() => {
    api.listEvents().then((r) => setItems(r.items));
    api.listStudents().then((r) => setStudents(r.items));
  }, []);

  async function create() {
    await api.createEvent({
      ...form,
      type: form.type as EventItem["type"],
      studentName: students.find((s) => s.id === form.studentId)?.name,
    });
    toast("Evento criado");
    setOpen(false);
    const r = await api.listEvents();
    setItems(r.items);
  }

  return (
    <div>
      <PageHeader
        title="Agenda"
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            Novo evento
          </Button>
        }
      />
      {!items ? (
        <SkeletonList />
      ) : items.length === 0 ? (
        <Empty icon={Calendar} title="Nenhum evento" />
      ) : (
        <ul className="space-y-3">
          {items.map((e) => (
            <li key={e.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{e.title}</p>
                    <p className="text-caption">
                      {e.studentName} · {formatDate(e.startsAt)}
                    </p>
                    {e.location ? (
                      <p className="text-caption">{e.location}</p>
                    ) : null}
                  </div>
                  <Badge tone="default" className="capitalize">
                    {e.type}
                  </Badge>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Novo evento"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={create} disabled={!form.title || !form.studentId}>
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
          <Select
            label="Tipo"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="workout">Treino presencial</option>
            <option value="assessment">Avaliação</option>
            <option value="call">Call</option>
            <option value="other">Outro</option>
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
