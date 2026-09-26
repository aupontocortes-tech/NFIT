"use client";

import { Button } from "@/components/ui";
import type { EventItem } from "@/lib/mocks";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

type View = "day" | "week" | "month";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function mondayOf(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(x, diff);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function shift(date: Date, hours: number, minutes: number) {
  const x = new Date(date);
  x.setHours(hours, minutes, 0, 0);
  return x;
}

export function ClassCalendar({
  events,
  readOnly,
  onCreateDay,
  onMove,
}: {
  events: EventItem[];
  readOnly?: boolean;
  onCreateDay?: (day: Date) => void;
  onMove?: (event: EventItem, startsAt: Date, endsAt: Date) => Promise<void>;
}) {
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [view, setView] = useState<View>("week");
  const [moving, setMoving] = useState<EventItem | null>(null);
  const [busy, setBusy] = useState(false);

  const visible = useMemo(() => events.filter((e) => e.status !== "cancelled"), [events]);

  const title =
    view === "day"
      ? cursor.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
      : view === "week"
        ? `${dayLabel(mondayOf(cursor))} – ${dayLabel(addDays(mondayOf(cursor), 6))}`
        : cursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  function step(dir: number) {
    if (view === "day") setCursor(addDays(cursor, dir));
    else if (view === "week") setCursor(addDays(cursor, dir * 7));
    else setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1));
  }

  function eventsOn(day: Date) {
    return visible
      .filter((e) => sameDay(new Date(e.startsAt), day))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  async function dropOn(day: Date) {
    if (!moving || !onMove) {
      onCreateDay?.(day);
      return;
    }
    const from = new Date(moving.startsAt);
    const to = new Date(moving.endsAt);
    const duration = Math.max(to.getTime() - from.getTime(), 60 * 60 * 1000);
    const next = shift(day, from.getHours(), from.getMinutes());
    const end = new Date(next.getTime() + duration);
    setBusy(true);
    try {
      await onMove(moving, next, end);
      setMoving(null);
      setCursor(startOfDay(day));
    } finally {
      setBusy(false);
    }
  }

  const week = Array.from({ length: 7 }, (_, i) => addDays(mondayOf(cursor), i));
  const monthStart = mondayOf(new Date(cursor.getFullYear(), cursor.getMonth(), 1));
  const monthCells = Array.from({ length: 42 }, (_, i) => addDays(monthStart, i));

  function Chip({ event }: { event: EventItem }) {
    const selected = moving?.id === event.id;
    return (
      <button
        type="button"
        disabled={readOnly || busy}
        onClick={(ev) => {
          ev.stopPropagation();
          if (readOnly) return;
          setMoving(selected ? null : event);
        }}
        className={cn(
          "w-full truncate rounded-[var(--radius-sm)] px-1.5 py-1 text-left text-xs font-medium",
          selected ? "bg-brand text-text-inverse" : "bg-fill text-text",
        )}
      >
        {timeLabel(event.startsAt)} {event.studentName}
      </button>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={() => step(-1)}>
            Anterior
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => setCursor(startOfDay(new Date()))}>
            Hoje
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => step(1)}>
            Próximo
          </Button>
        </div>
        <p className="text-base font-semibold capitalize">{title}</p>
        <div className="flex gap-2">
          {(
            [
              ["day", "Dia"],
              ["week", "Semana"],
              ["month", "Mês"],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={view === id ? "primary" : "secondary"}
              onClick={() => setView(id)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {moving ? (
        <p className="mb-3 rounded-[var(--radius-md)] bg-brand-muted px-3 py-2 text-sm text-brand-hover">
          Remarcando a aula de {moving.studentName}. Toque no novo dia. O horário {timeLabel(moving.startsAt)} permanece.
        </p>
      ) : !readOnly ? (
        <p className="mb-3 text-sm text-text-muted">
          Toque numa aula para remarcar, ou num dia vazio para marcar outra.
        </p>
      ) : null}

      {view === "month" ? (
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <p key={d} className="px-1 py-1 text-center text-caption">
              {d}
            </p>
          ))}
          {monthCells.map((day) => {
            const inMonth = day.getMonth() === cursor.getMonth();
            const list = eventsOn(day);
            return (
              <div
                key={day.toISOString()}
                onClick={() => dropOn(day)}
                className={cn(
                  "min-h-24 cursor-pointer rounded-[var(--radius-md)] border border-border p-1 text-left",
                  inMonth ? "bg-surface" : "opacity-40",
                  sameDay(day, new Date()) && "ring-1 ring-brand",
                )}
              >
                <span className="text-xs font-semibold">{day.getDate()}</span>
                <div className="mt-1 space-y-1">
                  {list.slice(0, 3).map((e) => (
                    <Chip key={e.id} event={e} />
                  ))}
                  {list.length > 3 ? <span className="text-caption">+{list.length - 3}</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {view === "week" ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
          {week.map((day) => (
            <div
              key={day.toISOString()}
              onClick={() => dropOn(day)}
              className={cn(
                "min-h-40 cursor-pointer rounded-[var(--radius-md)] border border-border p-2 text-left",
                sameDay(day, new Date()) && "ring-1 ring-brand",
              )}
            >
              <p className="text-sm font-semibold">
                {WEEKDAYS[(day.getDay() + 6) % 7]} {day.getDate()}
              </p>
              <div className="mt-2 space-y-1">
                {eventsOn(day).map((e) => (
                  <Chip key={e.id} event={e} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {view === "day" ? (
        <div className="space-y-2">
          {eventsOn(cursor).length === 0 ? (
            <button
              type="button"
              onClick={() => dropOn(cursor)}
              className="w-full rounded-[var(--radius-md)] border border-border px-4 py-8 text-text-muted"
            >
              Nenhuma aula neste dia.
            </button>
          ) : (
            eventsOn(cursor).map((e) => (
              <div key={e.id} className="rounded-[var(--radius-md)] border border-border p-3">
                <Chip event={e} />
                <p className="mt-2 font-medium">{e.title}</p>
                <p className="text-caption">
                  {timeLabel(e.startsAt)} – {timeLabel(e.endsAt)}
                  {e.status === "rescheduled" ? " · Remarcada" : ""}
                </p>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
