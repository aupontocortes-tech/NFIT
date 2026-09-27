import { neon } from "@neondatabase/serverless";
import type { EventItem, EventType } from "@/lib/mocks";

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL ausente");
  return neon(url);
}

let ready: Promise<void> | null = null;

function ensureTable() {
  ready ??= db()`
    CREATE TABLE IF NOT EXISTS nfit_events (
      id text PRIMARY KEY,
      student_id text NOT NULL,
      student_name text NOT NULL,
      title text NOT NULL,
      type text NOT NULL DEFAULT 'workout',
      starts_at timestamptz NOT NULL,
      ends_at timestamptz NOT NULL,
      location text,
      notes text,
      status text NOT NULL DEFAULT 'scheduled'
    )
  `.then(() => undefined);
  return ready;
}

type Row = {
  id: string;
  student_id: string;
  student_name: string;
  title: string;
  type: string;
  starts_at: string | Date;
  ends_at: string | Date;
  location: string | null;
  notes: string | null;
  status: string;
};

function iso(v: string | Date) {
  return v instanceof Date ? v.toISOString() : new Date(v).toISOString();
}

function mapRow(row: Row): EventItem {
  const status =
    row.status === "rescheduled" || row.status === "cancelled" || row.status === "given"
      ? row.status
      : "scheduled";
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    type: (row.type as EventType) || "workout",
    title: row.title,
    startsAt: iso(row.starts_at),
    endsAt: iso(row.ends_at),
    location: row.location ?? undefined,
    notes: row.notes ?? undefined,
    status,
  };
}

export async function listEvents(): Promise<EventItem[]> {
  await ensureTable();
  const rows = await db()`
    SELECT id, student_id, student_name, title, type, starts_at, ends_at, location, notes, status
    FROM nfit_events
    ORDER BY starts_at ASC
  `;
  return (rows as Row[]).map(mapRow);
}

export async function createEvent(input: {
  studentId: string;
  studentName: string;
  title: string;
  type?: EventType;
  startsAt: string;
  endsAt: string;
  location?: string;
  notes?: string;
}): Promise<EventItem> {
  await ensureTable();
  const id = crypto.randomUUID();
  const rows = await db()`
    INSERT INTO nfit_events (
      id, student_id, student_name, title, type, starts_at, ends_at, location, notes, status
    )
    VALUES (
      ${id},
      ${input.studentId},
      ${input.studentName},
      ${input.title},
      ${input.type ?? "workout"},
      ${input.startsAt},
      ${input.endsAt},
      ${input.location || null},
      ${input.notes || null},
      ${"scheduled"}
    )
    RETURNING id, student_id, student_name, title, type, starts_at, ends_at, location, notes, status
  `;
  return mapRow((rows as Row[])[0]);
}

export async function updateEvent(
  id: string,
  input: { startsAt: string; endsAt: string; status?: EventItem["status"] },
): Promise<EventItem | null> {
  await ensureTable();
  const status = input.status ?? "rescheduled";
  const rows = await db()`
    UPDATE nfit_events
    SET starts_at = ${input.startsAt}, ends_at = ${input.endsAt}, status = ${status}
    WHERE id = ${id}
    RETURNING id, student_id, student_name, title, type, starts_at, ends_at, location, notes, status
  `;
  const row = (rows as Row[])[0];
  return row ? mapRow(row) : null;
}
