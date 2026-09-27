import { neon } from "@neondatabase/serverless";
import type { Assignment, Workout, WorkoutStatus } from "@/lib/mocks";

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL ausente");
  return neon(url);
}

let ready: Promise<void> | null = null;

function ensureTables() {
  if (!ready) {
    ready = (async () => {
      try {
        const sql = db();
        await sql`
          CREATE TABLE IF NOT EXISTS nfit_workouts (
            id text PRIMARY KEY,
            title text NOT NULL,
            goal text,
            status text NOT NULL,
            generated_by_ai boolean NOT NULL DEFAULT false,
            notes text,
            warnings text NOT NULL DEFAULT '[]',
            blocks text NOT NULL DEFAULT '[]',
            updated_at timestamptz NOT NULL DEFAULT now()
          )
        `;
        await sql`
          CREATE TABLE IF NOT EXISTS nfit_assignments (
            id text PRIMARY KEY,
            workout_id text NOT NULL,
            student_id text NOT NULL,
            status text NOT NULL DEFAULT 'active',
            start_date text NOT NULL,
            notes text
          )
        `;
      } catch (e) {
        ready = null;
        throw e;
      }
    })();
  }
  return ready;
}

function parseJson<T>(raw: unknown, fallback: T): T {
  try {
    return JSON.parse(String(raw ?? "")) as T;
  } catch {
    return fallback;
  }
}

function mapWorkout(row: Record<string, unknown>): Workout {
  const blocks = parseJson(row.blocks, [] as Workout["blocks"]);
  const updated =
    row.updated_at instanceof Date
      ? row.updated_at.toISOString()
      : new Date(String(row.updated_at)).toISOString();
  return {
    id: String(row.id),
    title: String(row.title),
    goal: row.goal ? String(row.goal) : undefined,
    status: (row.status as WorkoutStatus) || "draft",
    generatedByAi: Boolean(row.generated_by_ai),
    notes: row.notes ? String(row.notes) : undefined,
    warnings: parseJson(row.warnings, [] as string[]),
    blocks,
    updatedAt: updated,
    exerciseCount: blocks.reduce((n, b) => n + b.exercises.length, 0),
  };
}

export async function listWorkouts(): Promise<Workout[]> {
  await ensureTables();
  const rows = await db()`
    SELECT id, title, goal, status, generated_by_ai, notes, warnings, blocks, updated_at
    FROM nfit_workouts
    ORDER BY updated_at DESC
  `;
  return (rows as Record<string, unknown>[]).map(mapWorkout);
}

export async function getWorkout(id: string): Promise<Workout | null> {
  await ensureTables();
  const rows = await db()`
    SELECT id, title, goal, status, generated_by_ai, notes, warnings, blocks, updated_at
    FROM nfit_workouts WHERE id = ${id} LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapWorkout(row) : null;
}

export async function saveWorkout(input: Partial<Workout> & { title: string }): Promise<Workout> {
  await ensureTables();
  const id = input.id && !input.id.startsWith("w-ai") ? input.id : crypto.randomUUID();
  const existing = await getWorkout(id);
  const next = {
    title: input.title,
    goal: input.goal ?? existing?.goal ?? null,
    status: input.status ?? existing?.status ?? "draft",
    generatedByAi: input.generatedByAi ?? existing?.generatedByAi ?? false,
    notes: input.notes ?? existing?.notes ?? null,
    warnings: JSON.stringify(input.warnings ?? existing?.warnings ?? []),
    blocks: JSON.stringify(input.blocks ?? existing?.blocks ?? []),
  };
  if (existing) {
    await db()`
      UPDATE nfit_workouts
      SET title = ${next.title}, goal = ${next.goal}, status = ${next.status},
          generated_by_ai = ${next.generatedByAi}, notes = ${next.notes},
          warnings = ${next.warnings}, blocks = ${next.blocks}, updated_at = now()
      WHERE id = ${id}
    `;
  } else {
    await db()`
      INSERT INTO nfit_workouts (id, title, goal, status, generated_by_ai, notes, warnings, blocks)
      VALUES (
        ${id}, ${next.title}, ${next.goal}, ${next.status}, ${next.generatedByAi},
        ${next.notes}, ${next.warnings}, ${next.blocks}
      )
    `;
  }
  return (await getWorkout(id))!;
}

export async function createAssignments(input: {
  workoutId: string;
  studentIds: string[];
  startDate: string;
  notes?: string;
}): Promise<Assignment[]> {
  await ensureTables();
  const workout = await getWorkout(input.workoutId);
  const created: Assignment[] = [];
  for (const studentId of input.studentIds) {
    const id = crypto.randomUUID();
    await db()`
      INSERT INTO nfit_assignments (id, workout_id, student_id, status, start_date, notes)
      VALUES (${id}, ${input.workoutId}, ${studentId}, ${"active"}, ${input.startDate}, ${input.notes || null})
    `;
    created.push({
      id,
      workoutId: input.workoutId,
      studentId,
      status: "active",
      startDate: input.startDate,
      notes: input.notes,
      workoutTitle: workout?.title,
      workout: workout ?? undefined,
    });
  }
  return created;
}

export async function completeAssignment(id: string): Promise<Assignment | null> {
  await ensureTables();
  const current = await getAssignment(id);
  if (!current) return null;
  await db()`UPDATE nfit_assignments SET status = ${"completed"} WHERE id = ${id}`;
  return { ...current, status: "completed" };
}

export async function listAssignments(studentId?: string): Promise<Assignment[]> {
  await ensureTables();
  const rows = studentId
    ? await db()`
        SELECT a.id, a.workout_id, a.student_id, a.status, a.start_date, a.notes, w.title
        FROM nfit_assignments a
        LEFT JOIN nfit_workouts w ON w.id = a.workout_id
        WHERE a.student_id = ${studentId}
        ORDER BY a.start_date DESC
      `
    : await db()`
        SELECT a.id, a.workout_id, a.student_id, a.status, a.start_date, a.notes, w.title
        FROM nfit_assignments a
        LEFT JOIN nfit_workouts w ON w.id = a.workout_id
        ORDER BY a.start_date DESC
      `;
  return (rows as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    workoutId: String(row.workout_id),
    studentId: String(row.student_id),
    status: (row.status as Assignment["status"]) || "active",
    startDate: String(row.start_date),
    notes: row.notes ? String(row.notes) : undefined,
    workoutTitle: row.title ? String(row.title) : undefined,
  }));
}

export async function getAssignment(id: string): Promise<Assignment | null> {
  await ensureTables();
  const rows = await db()`
    SELECT id, workout_id, student_id, status, start_date, notes
    FROM nfit_assignments WHERE id = ${id} LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  const workout = await getWorkout(String(row.workout_id));
  return {
    id: String(row.id),
    workoutId: String(row.workout_id),
    studentId: String(row.student_id),
    status: (row.status as Assignment["status"]) || "active",
    startDate: String(row.start_date),
    notes: row.notes ? String(row.notes) : undefined,
    workoutTitle: workout?.title,
    workout: workout ?? undefined,
  };
}
