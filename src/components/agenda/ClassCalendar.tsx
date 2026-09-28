"use client";

import { Button } from "@/components/ui";
import type { EventItem } from "@/lib/mocks";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useMemo, useRef, useState } from "react";

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

const STUDENT_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#eab308", "#06b6d4", "#a855f7", "#ec4899", "#14b8a6"];

function colorFor(name: string) {
  let n = 0;
  for (const char of name) n = (n + char.charCodeAt(0) * 17) % STUDENT_COLORS.length;
  return STUDENT_COLORS[n];
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
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
  onCreateHour,
  onMove,
  onAdjust,
  onGive,
}: {
  events: EventItem[];
  readOnly?: boolean;
  onCreateDay?: (day: Date) => void;
  onCreateHour?: (start: Date) => void;
  onMove?: (event: EventItem, startsAt: Date, endsAt: Date) => Promise<void>;
  onAdjust?: (event: EventItem) => void;
  onGive?: (event: EventItem) => void;
}) {
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [view, setView] = useState<View>("week");
  const [busy, setBusy] = useState(false);
  const [ghost, setGhost] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);

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

  function openEmpty(day: Date, hour?: number) {
    if (hour != null) onCreateHour?.(shift(day, hour, 0));
    else onCreateDay?.(day);
  }

  function dayKey(day: Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
  }

  function parseDayKey(key: string) {
    const [year, month, date] = key.split("-").map(Number);
    return new Date(year, month - 1, date);
  }

  async function relocate(event: EventItem, day: Date, hour?: number) {
    if (!onMove) return;
    const from = new Date(event.startsAt);
    const to = new Date(event.endsAt);
    const duration = Math.max(to.getTime() - from.getTime(), 60 * 60 * 1000);
    const next = hour != null ? shift(day, hour, from.getMinutes()) : shift(day, from.getHours(), from.getMinutes());
    if (sameDay(next, from) && next.getHours() === from.getHours() && next.getMinutes() === from.getMinutes()) return;
    const end = new Date(next.getTime() + duration);
    setBusy(true);
    try {
      await onMove(event, next, end);
    } finally {
      setBusy(false);
      setGhost(null);
      dragId.current = null;
    }
  }

  function eventById(id: string) {
    return visible.find((item) => item.id === id) ?? null;
  }

  function dropOn(e: React.DragEvent, day: Date, hour?: number) {
    e.preventDefault();
    e.stopPropagation();
    const event = eventById(e.dataTransfer.getData("text/plain") || dragId.current || "");
    setGhost(null);
    if (!event) return;
    void relocate(event, day, hour);
  }

  const week = Array.from({ length: 7 }, (_, i) => addDays(mondayOf(cursor), i));
  const monthStart = mondayOf(new Date(cursor.getFullYear(), cursor.getMonth(), 1));
  const monthCells = Array.from({ length: 42 }, (_, i) => addDays(monthStart, i));

  function Chip({ event }: { event: EventItem }) {
    const given = event.status === "given";
    const name = event.studentName ?? "Aluno";
    return (
      <div className="flex items-stretch gap-0.5" onClick={(ev) => ev.stopPropagation()}>
        <button
          type="button"
          disabled={readOnly || busy}
          draggable={!readOnly && !busy}
          onDragStart={(ev) => {
            ev.stopPropagation();
            dragId.current = event.id;
            ev.dataTransfer.setData("text/plain", event.id);
            ev.dataTransfer.effectAllowed = "move";
          }}
          onDragEnd={() => {
            dragId.current = null;
            setGhost(null);
          }}
          onDragOver={(ev) => ev.preventDefault()}
          onDoubleClick={(ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            if (!readOnly) onAdjust?.(event);
          }}
          className={cn(
            "min-w-0 flex-1 cursor-grab truncate rounded-[var(--radius-sm)] border px-1.5 py-1 text-left text-xs font-semibold active:cursor-grabbing",
            given && "line-through opacity-80",
          )}
          style={{ backgroundColor: `${colorFor(name)}33`, borderColor: colorFor(name), color: colorFor(name) }}
        >
          {timeLabel(event.startsAt)} {firstName(name)}
          {given ? " · dada" : ""}
        </button>
        {!readOnly ? (
          <button
            type="button"
            aria-label={given ? "Desfazer aula dada" : "Marcar aula como dada"}
            aria-pressed={given}
            onClick={(ev) => {
              ev.stopPropagation();
              onGive?.(event);
            }}
            className={cn(
              "inline-flex w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border",
              given ? "border-brand bg-brand text-text-inverse" : "border-border text-text-muted",
            )}
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-x-hidden">
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

      {!readOnly ? (
        <p className="mb-3 text-sm text-text-muted">
          Segure a aula e leve até outro dia. Dois cliques mudam a hora. O visto marca a aula como dada, mesmo se o aluno faltar sem avisar.
        </p>
      ) : null}

      {view === "month" ? (
        <div className="grid min-w-0 grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <p key={d} className="truncate px-1 py-1 text-center text-caption">
              {d}
            </p>
          ))}
          {monthCells.map((day) => {
            const inMonth = day.getMonth() === cursor.getMonth();
            const list = eventsOn(day);
            const tone = list[0] ? colorFor(list[0].studentName ?? "") : undefined;
            return (
              <div
                key={day.toISOString()}
                data-day={dayKey(day)}
                onClick={() => openEmpty(day)}
                onDragOver={(ev) => {
                  ev.preventDefault();
                  setGhost(dayKey(day));
                }}
                onDrop={(ev) => dropOn(ev, day)}
                className={cn(
                  "min-h-24 min-w-0 cursor-pointer rounded-[var(--radius-md)] border bg-[#efe8dc] p-1 text-left dark:bg-[#2a2a2a]",
                  !tone && "border-border",
                  sameDay(day, new Date()) && "ring-1 ring-brand",
                  ghost === dayKey(day) && "ring-2 ring-brand",
                )}
                style={tone ? { borderColor: tone } : undefined}
              >
                <span className={cn("text-xs font-semibold", !inMonth && "opacity-45")}>{day.getDate()}</span>
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
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-7">
          {week.map((day) => (
            <div
              key={day.toISOString()}
              data-day={dayKey(day)}
              onClick={() => openEmpty(day)}
              onDragOver={(ev) => {
                ev.preventDefault();
                setGhost(dayKey(day));
              }}
              onDrop={(ev) => dropOn(ev, day)}
              className={cn(
                "min-h-40 min-w-0 cursor-pointer rounded-[var(--radius-md)] border border-border bg-[#efe8dc] p-2 text-left dark:bg-[#2a2a2a]",
                sameDay(day, new Date()) && "ring-1 ring-brand",
                ghost === dayKey(day) && "ring-2 ring-brand",
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
        <div className="space-y-1">
          {Array.from({ length: 16 }, (_, i) => i + 6).map((hour) => {
            const list = eventsOn(cursor).filter((e) => new Date(e.startsAt).getHours() === hour);
            const label = `${String(hour).padStart(2, "0")}:00`;
            const tone = list[0] ? colorFor(list[0].studentName ?? "") : undefined;
            return (
              <div
                key={hour}
                data-day={dayKey(cursor)}
                data-hour={hour}
                onClick={() => openEmpty(cursor, hour)}
                onDragOver={(ev) => {
                  ev.preventDefault();
                  setGhost(dayKey(cursor));
                }}
                onDrop={(ev) => dropOn(ev, cursor, hour)}
                className="flex w-full items-start gap-3 rounded-[var(--radius-md)] border border-border bg-[#efe8dc] px-3 py-2 text-left dark:bg-[#2a2a2a]"
                style={tone ? { borderColor: tone } : undefined}
              >
                <span className="w-12 shrink-0 pt-1 text-sm font-semibold tabular-nums">{label}</span>
                <span className="min-w-0 flex-1 space-y-1">
                  {list.length === 0 ? (
                    <span className="text-sm text-text-muted">Livre · 1 hora</span>
                  ) : (
                    list.map((e) => <Chip key={e.id} event={e} />)
                  )}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
