import { neon } from "@neondatabase/serverless";
import type { Student, StudentStatus } from "@/lib/mocks";

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  avatar_url: string | null;
  status: StudentStatus;
  next_assessment_at: string | Date | null;
  created_at: string | Date;
};

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL ausente");
  return neon(url);
}

function mapRow(row: Row): Student {
  const created =
    row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString();
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    notes: row.notes ?? undefined,
    status: row.status,
    avatarUrl: row.avatar_url ?? undefined,
    nextAssessmentAt: row.next_assessment_at
      ? row.next_assessment_at instanceof Date
        ? row.next_assessment_at.toISOString()
        : new Date(row.next_assessment_at).toISOString()
      : null,
    createdAt: created,
    activeWorkoutCount: 0,
    pendingInvoices: 0,
    unreadMessages: 0,
  };
}

let ready: Promise<void> | null = null;

function ensureTable() {
  ready ??= db()`
    CREATE TABLE IF NOT EXISTS nfit_students (
      id text PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL UNIQUE,
      phone text,
      notes text,
      status text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `.then(() => undefined);
  return ready;
}

async function ensureAvatarColumn() {
  await ensureTable();
  await db()`ALTER TABLE nfit_students ADD COLUMN IF NOT EXISTS avatar_url text`;
  await db()`ALTER TABLE nfit_students ADD COLUMN IF NOT EXISTS next_assessment_at timestamptz`;
  await db()`ALTER TABLE nfit_students ADD COLUMN IF NOT EXISTS delete_confirm_code text`;
}

export async function listStudents(params?: { q?: string; status?: string }): Promise<Student[]> {
  await ensureAvatarColumn();
  const q = params?.q?.trim() || null;
  const status = params?.status?.trim() || null;
  const like = q ? `%${q}%` : null;
  const rows = await db()`
    SELECT id, name, email, phone, notes, status, avatar_url, next_assessment_at, created_at
    FROM nfit_students
    WHERE (${status}::text IS NULL OR status = ${status})
      AND (
        ${like}::text IS NULL
        OR name ILIKE ${like}
        OR email ILIKE ${like}
      )
    ORDER BY created_at DESC
  `;
  return (rows as Row[]).map(mapRow);
}

export async function findStudentByEmail(email: string): Promise<Student | null> {
  await ensureAvatarColumn();
  const rows = await db()`
    SELECT id, name, email, phone, notes, status, avatar_url, next_assessment_at, created_at
    FROM nfit_students
    WHERE lower(email) = ${email.trim().toLowerCase()}
    LIMIT 1
  `;
  const row = (rows as Row[])[0];
  return row ? mapRow(row) : null;
}

export async function getStudent(id: string): Promise<Student | null> {
  await ensureAvatarColumn();
  const rows = await db()`
    SELECT id, name, email, phone, notes, status, avatar_url, next_assessment_at, created_at
    FROM nfit_students
    WHERE id = ${id}
    LIMIT 1
  `;
  const row = (rows as Row[])[0];
  return row ? mapRow(row) : null;
}

export async function createStudent(input: {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}): Promise<Student> {
  await ensureAvatarColumn();
  const id = crypto.randomUUID();
  const rows = await db()`
    INSERT INTO nfit_students (id, name, email, phone, notes, status)
    VALUES (
      ${id},
      ${input.name},
      ${input.email},
      ${input.phone || null},
      ${input.notes || null},
      ${"active"}
    )
    RETURNING id, name, email, phone, notes, status, avatar_url, next_assessment_at, created_at
  `;
  return mapRow((rows as Row[])[0]);
}

export async function patchStudent(
  id: string,
  data: Partial<Pick<Student, "name" | "phone" | "notes" | "status" | "avatarUrl" | "nextAssessmentAt">>,
): Promise<Student | null> {
  const current = await getStudent(id);
  if (!current) return null;
  const rows = await db()`
    UPDATE nfit_students
    SET
      name = ${data.name ?? current.name},
      phone = ${data.phone ?? current.phone ?? null},
      notes = ${data.notes ?? current.notes ?? null},
      status = ${data.status ?? current.status},
      avatar_url = ${data.avatarUrl === undefined ? current.avatarUrl ?? null : data.avatarUrl},
      next_assessment_at = ${
        data.nextAssessmentAt === undefined ? current.nextAssessmentAt ?? null : data.nextAssessmentAt
      }
    WHERE id = ${id}
    RETURNING id, name, email, phone, notes, status, avatar_url, next_assessment_at, created_at
  `;
  const row = (rows as Row[])[0];
  return row ? mapRow(row) : null;
}

export async function issueDeleteCode(id: string): Promise<string | null> {
  await ensureAvatarColumn();
  const current = await getStudent(id);
  if (!current) return null;
  const code = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  await db()`UPDATE nfit_students SET delete_confirm_code = ${code} WHERE id = ${id}`;
  return code;
}

export async function deleteStudent(id: string, code: string): Promise<"ok" | "missing" | "wrong"> {
  await ensureAvatarColumn();
  const rows = await db()`
    SELECT delete_confirm_code FROM nfit_students WHERE id = ${id} LIMIT 1
  `;
  const stored = (rows[0] as { delete_confirm_code?: string | null } | undefined)?.delete_confirm_code;
  if (!rows[0]) return "missing";
  if (!stored || stored.toUpperCase() !== code.trim().toUpperCase()) return "wrong";
  const sql = db();
  await sql`DELETE FROM nfit_messages WHERE student_id = ${id}`;
  await sql`DELETE FROM nfit_invoices WHERE student_id = ${id}`;
  await sql`DELETE FROM nfit_events WHERE student_id = ${id}`;
  await sql`DELETE FROM nfit_assignments WHERE student_id = ${id}`;
  await sql`DELETE FROM nfit_checkins WHERE student_id = ${id}`;
  await sql`DELETE FROM nfit_checkin_links WHERE student_id = ${id}`;
  await sql`DELETE FROM nfit_students WHERE id = ${id}`;
  return "ok";
}
