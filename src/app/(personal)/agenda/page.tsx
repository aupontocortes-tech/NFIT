"use client";

import { ClassCalendar } from "@/components/agenda/ClassCalendar";
import {
  Button,
  Card,
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
import { useEffect, useRef, useState } from "react";

function overlaps(start: Date, end: Date, otherStart: Date, otherEnd: Date) {
  return start < otherEnd && otherStart < end;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function nextWeekday(from: Date, weekday: number) {
  const x = new Date(from);
  x.setHours(0, 0, 0, 0);
  const diff = (weekday - x.getDay() + 7) % 7;
  x.setDate(x.getDate() + diff);
  return x;
}

function endOfThisWeek(from: Date) {
  const x = new Date(from);
  x.setHours(23, 59, 59, 999);
  const toSunday = x.getDay() === 0 ? 0 : 7 - x.getDay();
  x.setDate(x.getDate() + toSunday);
  return x;
}

const WEEK_DAYS = [
  { id: 1, label: "Seg" },
  { id: 2, label: "Ter" },
  { id: 3, label: "Qua" },
  { id: 4, label: "Qui" },
  { id: 5, label: "Sex" },
  { id: 6, label: "Sáb" },
  { id: 0, label: "Dom" },
];

export default function AgendaPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<EventItem[] | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [plan, setPlan] = useState({
    studentId: "",
    days: [] as number[],
    time: "18:00",
    dayTimes: {} as Record<number, string>,
    weeks: 1 as 1 | 4,
  });
  const loadedStudent = useRef("");
  const [planning, setPlanning] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
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

  function openAt(start: Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const stamp = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setForm((f) => ({ ...f, startsAt: stamp(start), endsAt: stamp(end), title: f.title || "Aula presencial" }));
    setOpen(true);
  }

  function openOn(day: Date) {
    const start = new Date(day);
    start.setHours(8, 0, 0, 0);
    openAt(start);
  }

  function clash(start: Date, end: Date, studentId: string, ignoreId?: string) {
    return (items ?? []).find((event) => {
      if (event.status === "cancelled" || event.studentId === studentId) return false;
      if (ignoreId && event.id === ignoreId) return false;
      return overlaps(start, end, new Date(event.startsAt), new Date(event.endsAt));
    });
  }

  async function markWeek() {
    const student = students.find((s) => s.id === plan.studentId);
    if (!student) {
      toast("Escolha o aluno", "error");
      return;
    }
    if (plan.days.length === 0) {
      toast("Toque nos dias da semana", "error");
      return;
    }
    const existing = (items ?? []).filter((e) => e.studentId === student.id && e.status !== "cancelled");
    const weekEnd = endOfThisWeek(new Date());
    const blocked = new Set<string>();
    const slots: Date[] = [];
    let changed = 0;
    for (const weekday of plan.days) {
      const first = nextWeekday(new Date(), weekday);
      const clock = plan.dayTimes[weekday] || plan.time;
      const [hour, minute] = clock.split(":").map(Number);
      for (let week = 0; week < plan.weeks; week += 1) {
        const day = new Date(first);
        day.setDate(first.getDate() + week * 7);
        if (plan.weeks === 1 && day.getTime() > weekEnd.getTime()) continue;
        day.setHours(hour, minute, 0, 0);
        const end = new Date(day.getTime() + 60 * 60 * 1000);
        const other = clash(day, end, student.id);
        if (other) {
          blocked.add(`${WEEK_DAYS.find((item) => item.id === weekday)?.label} ${clock} atrapalha ${other.studentName.split(" ")[0]}`);
          continue;
        }
        const same = existing.find((e) => sameDay(new Date(e.startsAt), day));
        if (!same) slots.push(day);
        else if (new Date(same.startsAt).getHours() !== hour || new Date(same.startsAt).getMinutes() !== minute) {
          await api.updateEvent(same.id, { startsAt: day.toISOString(), endsAt: end.toISOString(), status: "rescheduled" });
          changed += 1;
        }
      }
    }
    if (blocked.size > 0) {
      toast(`Horário ocupado. Não marquei: ${[...blocked].join(". ")}.`, "error");
    }
    if (slots.length === 0 && blocked.size > 0) return;
    if (slots.length === 0 && changed === 0 && plan.weeks === 1) {
      toast("Esses dias desta semana já passaram. Escolha 4 semanas para marcar os próximos.", "error");
      return;
    }
    if (slots.length === 0 && plan.days.length > 0) {
      await savePlan(student.id);
      toast("Dias e horários salvos para esse aluno");
      setPlannerOpen(false);
      await reload();
      return;
    }
    setPlanning(true);
    try {
      for (const start of slots) {
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        await api.createEvent({
          studentId: student.id,
          studentName: student.name,
          title: "Aula presencial",
          type: "workout",
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
        });
      }
      toast(`${slots.length} aula${slots.length > 1 ? "s" : ""} marcada${slots.length > 1 ? "s" : ""} para ${student.name.split(" ")[0]}`);
      await savePlan(student.id);
      setPlannerOpen(false);
      await reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível marcar", "error");
    } finally {
      setPlanning(false);
    }
  }

  async function savePlan(studentId: string) {
    const times: Record<string, string> = {};
    for (const day of plan.days) times[String(day)] = plan.dayTimes[day] || plan.time;
    await fetch(`/api/alunos/${studentId}/semana`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ times }),
    });
  }

  function applyTimes(studentId: string, times: Record<string, string>) {
    const days = Object.keys(times).map(Number).filter((n) => n >= 0 && n <= 6);
    const clocks = days.map((day) => times[String(day)]).filter(Boolean);
    setPlan((current) => ({
      ...current,
      studentId,
      days,
      time: clocks[0] || current.time,
      dayTimes: Object.fromEntries(days.map((day) => [day, times[String(day)] || current.time])),
    }));
  }

  async function chooseStudent(studentId: string) {
    if (!studentId) {
      setPlan((current) => ({ ...current, studentId: "", days: [], dayTimes: {} }));
      return;
    }
    const fromEvents: Record<string, string> = {};
    for (const event of items ?? []) {
      if (event.studentId !== studentId || event.status === "cancelled") continue;
      const date = new Date(event.startsAt);
      const hh = String(date.getHours()).padStart(2, "0");
      const mm = String(date.getMinutes()).padStart(2, "0");
      fromEvents[String(date.getDay())] = `${hh}:${mm}`;
    }
    try {
      const res = await fetch(`/api/alunos/${studentId}/semana`);
      const data = await res.json().catch(() => null);
      const saved = (data?.times ?? {}) as Record<string, string>;
      applyTimes(studentId, Object.keys(saved).length ? saved : fromEvents);
    } catch {
      applyTimes(studentId, fromEvents);
    }
  }

  useEffect(() => {
    if (!plan.studentId || !items) return;
    if (loadedStudent.current === plan.studentId) return;
    loadedStudent.current = plan.studentId;
    void chooseStudent(plan.studentId);
  }, [plan.studentId, items]);
  function togglePlanDay(day: number) {
    setPlan((current) => {
      if (current.days.includes(day)) {
        const dayTimes = { ...current.dayTimes };
        delete dayTimes[day];
        return { ...current, days: current.days.filter((d) => d !== day), dayTimes };
      }
      return {
        ...current,
        days: [...current.days, day],
        dayTimes: { ...current.dayTimes, [day]: current.time },
      };
    });
  }

  function setDayTime(day: number, time: string) {
    setPlan((current) => ({ ...current, dayTimes: { ...current.dayTimes, [day]: time } }));
  }

  function setDefaultTime(time: string) {
    setPlan((current) => ({
      ...current,
      time,
      dayTimes: Object.fromEntries(
        Object.entries(current.dayTimes).map(([day, value]) => [day, value === current.time ? time : value]),
      ),
    }));
  }
  function openAdjust(event: EventItem) {
    const start = new Date(event.startsAt);
    const end = new Date(event.endsAt);
    const pad = (n: number) => String(n).padStart(2, "0");
    const stamp = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setEditing(event);
    setForm({
      studentId: event.studentId,
      type: event.type,
      title: event.title,
      startsAt: stamp(start),
      endsAt: stamp(end),
      location: event.location ?? "",
      notes: event.notes ?? "",
    });
    setOpen(true);
  }

  async function create() {
    const student = students.find((s) => s.id === form.studentId);
    if (!student) return;
    const start = new Date(form.startsAt);
    const end = form.endsAt ? new Date(form.endsAt) : new Date(start.getTime() + 60 * 60 * 1000);
    const other = clash(start, end, student.id);
    if (other) {
      toast(`Esse horário atrapalha ${other.studentName.split(" ")[0]}. A aula não foi marcada.`, "error");
      return;
    }
    try {
      await api.createEvent({
        studentId: student.id,
        studentName: student.name,
        title: form.title || "Aula",
        type: form.type as EventItem["type"],
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
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

  async function saveAdjust() {
    if (!editing) return;
    const start = new Date(form.startsAt);
    const end = form.endsAt ? new Date(form.endsAt) : new Date(start.getTime() + 60 * 60 * 1000);
    try {
      await move(editing, start, end);
      setEditing(null);
      setOpen(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível ajustar", "error");
    }
  }

  async function move(event: EventItem, startsAt: Date, endsAt: Date) {
    const other = clash(startsAt, endsAt, event.studentId, event.id);
    if (other) {
      toast(`Esse horário atrapalha ${other.studentName.split(" ")[0]}. A aula não foi remarcada.`, "error");
      return;
    }
    await api.updateEvent(event.id, {
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      status: "rescheduled",
    });
    toast(`Aula de ${event.studentName} remarcada`);
    await reload();
  }

  async function markGiven(event: EventItem) {
    const given = event.status !== "given";
    try {
      await api.updateEvent(event.id, {
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        status: given ? "given" : "scheduled",
      });
      toast(given ? `Aula de ${event.studentName.split(" ")[0]} dada` : `Aula de ${event.studentName.split(" ")[0]} voltou para marcada`);
      await reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível marcar a aula", "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Agenda presencial"
        description="As aulas que você dá pessoalmente para cada aluno"
        action={
          <Button type="button" size="sm" onClick={() => setPlannerOpen((v) => !v)}>
            {plannerOpen ? "Fechar" : "Configurar aulas"}
          </Button>
        }
      />
      {!items ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
          {plannerOpen ? (
          <Card className="mb-4 space-y-4">
            <div>
              <h2 className="text-subtitle">Marcar aulas presenciais</h2>
              <p className="text-caption">
                Cada aula dura 1 hora. O horário vale para todos os dias. Se um dia for diferente, mude só o horário dele.
              </p>
            </div>
            <Select
              label="Aluno"
              value={plan.studentId}
              onChange={(e) => void chooseStudent(e.target.value)}
            >
              <option value="">Selecione</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <div>
              <p className="mb-2 text-sm font-semibold">Dias da semana deste aluno</p>
              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map((day) => (
                  <Button
                    key={day.id}
                    type="button"
                    size="sm"
                    variant={plan.days.includes(day.id) ? "primary" : "secondary"}
                    aria-pressed={plan.days.includes(day.id)}
                    onClick={() => togglePlanDay(day.id)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
              <p className="mt-2 text-caption">
                {plan.days.length === 0
                  ? "Nenhum dia salvo ainda. Toque nos dias que ele vai à academia."
                  : plan.days.map((day) => `${WEEK_DAYS.find((item) => item.id === day)?.label} ${plan.dayTimes[day] || plan.time}`).join(" · ")}
              </p>
              {plan.days.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-3">
                  {WEEK_DAYS.filter((day) => plan.days.includes(day.id)).map((day) => (
                    <Input
                      key={day.id}
                      label={day.label}
                      type="time"
                      value={plan.dayTimes[day.id] ?? plan.time}
                      onChange={(e) => setDayTime(day.id, e.target.value)}
                      className="w-28"
                    />
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <Input
                label="Horário"
                type="time"
                value={plan.time}
                onChange={(e) => setDefaultTime(e.target.value)}
                className="w-36"
              />
              <div>
                <p className="mb-2 text-sm font-semibold">Até quando</p>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant={plan.weeks === 1 ? "primary" : "secondary"} onClick={() => setPlan({ ...plan, weeks: 1 })}>
                    Esta semana
                  </Button>
                  <Button type="button" size="sm" variant={plan.weeks === 4 ? "primary" : "secondary"} onClick={() => setPlan({ ...plan, weeks: 4 })}>
                    4 semanas
                  </Button>
                </div>
              </div>
            </div>
            <Button type="button" loading={planning} onClick={markWeek} disabled={!plan.studentId || plan.days.length === 0}>
              Marcar aulas
            </Button>
          </Card>
          ) : null}
          <ClassCalendar events={items} onCreateDay={openOn} onCreateHour={openAt} onMove={move} onAdjust={openAdjust} onGive={markGiven} />
        </>
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? "Ajustar horário" : "Nova aula"}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setOpen(false);
                setEditing(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={editing ? saveAdjust : create} disabled={!form.startsAt || (!editing && !form.studentId)}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {editing ? (
            <p className="text-sm font-semibold">{editing.studentName}</p>
          ) : (
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
          )}
          {editing ? null : (
            <Input
              label="Título"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          )}
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
          {editing ? null : (
            <>
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
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
