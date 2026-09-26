import { neon } from "@neondatabase/serverless";
import type { Assessment } from "@/lib/mocks";
import { bodyMetrics, type BodyInput, type Sex } from "@/lib/body-metrics";

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
          CREATE TABLE IF NOT EXISTS nfit_checkin_links (
            student_id text PRIMARY KEY,
            token text NOT NULL UNIQUE
          )
        `;
        await sql`
          CREATE TABLE IF NOT EXISTS nfit_checkins (
            id text PRIMARY KEY,
            student_id text NOT NULL,
            weight_kg double precision,
            waist_cm double precision,
            hip_cm double precision,
            notes text,
            photo_urls text NOT NULL DEFAULT '[]',
            details text,
            created_at timestamptz NOT NULL DEFAULT now()
          )
        `;
        await sql`ALTER TABLE nfit_checkins ADD COLUMN IF NOT EXISTS details text`;
      } catch (e) {
        ready = null;
        throw e;
      }
    })();
  }
  return ready;
}

export async function getOrCreateCheckinToken(studentId: string) {
  await ensureTables();
  const existing = await db()`
    SELECT token FROM nfit_checkin_links WHERE student_id = ${studentId} LIMIT 1
  `;
  const found = (existing[0] as { token?: string } | undefined)?.token;
  if (found) return found;
  const token = crypto.randomUUID().replace(/-/g, "");
  await db()`
    INSERT INTO nfit_checkin_links (student_id, token)
    VALUES (${studentId}, ${token})
  `;
  return token;
}

export async function studentIdByToken(token: string) {
  await ensureTables();
  const rows = await db()`
    SELECT student_id FROM nfit_checkin_links WHERE token = ${token} LIMIT 1
  `;
  return (rows[0] as { student_id?: string } | undefined)?.student_id ?? null;
}

function num(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export async function saveCheckin(input: {
  studentId: string;
  weightKg?: number;
  waistCm?: number;
  hipCm?: number;
  notes?: string;
  photoUrls: string[];
  details?: BodyInput;
}) {
  await ensureTables();
  const id = crypto.randomUUID();
  await db()`
    INSERT INTO nfit_checkins (id, student_id, weight_kg, waist_cm, hip_cm, notes, photo_urls, details)
    VALUES (
      ${id},
      ${input.studentId},
      ${input.weightKg ?? null},
      ${input.waistCm ?? null},
      ${input.hipCm ?? null},
      ${input.notes || null},
      ${JSON.stringify(input.photoUrls)},
      ${input.details ? JSON.stringify(input.details) : null}
    )
  `;
  return id;
}

export async function listCheckins(studentId: string): Promise<Assessment[]> {
  await ensureTables();
  const rows = await db()`
    SELECT id, weight_kg, waist_cm, hip_cm, notes, photo_urls, details, created_at
    FROM nfit_checkins
    WHERE student_id = ${studentId}
    ORDER BY created_at DESC
  `;
  return (rows as Record<string, unknown>[]).map((row) => {
    let photos: string[] = [];
    try {
      photos = JSON.parse(String(row.photo_urls ?? "[]"));
    } catch {
      photos = [];
    }
    const created =
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(String(row.created_at)).toISOString();
    let details: Partial<BodyInput> | null = null;
    try {
      details = row.details ? (JSON.parse(String(row.details)) as BodyInput) : null;
    } catch {
      details = null;
    }
    const metrics =
      details?.sex && details.age && details.heightCm && details.weightKg && details.waistCm && details.hipCm && details.abdomenCm
        ? bodyMetrics(details as BodyInput)
        : null;
    return {
      id: String(row.id),
      date: created.slice(0, 10),
      weightKg: num(row.weight_kg),
      heightCm: details?.heightCm,
      age: details?.age,
      sex: details?.sex as Sex | undefined,
      bmi: metrics?.bmi,
      bmiLabel: metrics?.bmiLabel,
      whr: metrics?.whr,
      whrLabel: metrics?.whrLabel,
      girthSumCm: metrics?.girthSumCm,
      bodyFatPercent: metrics?.bodyFatPercent,
      leanMassKg: metrics?.leanMassKg,
      measurements: {
        waist: num(row.waist_cm),
        hip: num(row.hip_cm),
        chest: details?.chestCm,
        biceps: details?.bicepsCm,
        forearm: details?.forearmCm,
        abdomen: details?.abdomenCm,
        thigh: details?.thighCm,
      },
      notes: row.notes ? String(row.notes) : undefined,
      photoUrls: photos,
      createdAt: created,
    };
  });
}
