import { neon } from "@neondatabase/serverless";

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL ausente");
  return neon(url);
}

let ready: Promise<void> | null = null;

function ensureTable() {
  if (!ready) {
    ready = db()`
      CREATE TABLE IF NOT EXISTS nfit_settings (
        key text PRIMARY KEY,
        value text NOT NULL
      )
    `
      .then(() => undefined)
      .catch((e) => {
        ready = null;
        throw e;
      });
  }
  return ready;
}

function keyFor(studentId: string) {
  return `weekly_plan_${studentId}`;
}

export async function getWeeklyPlan(studentId: string): Promise<Record<string, string>> {
  await ensureTable();
  const rows = await db()`SELECT value FROM nfit_settings WHERE key = ${keyFor(studentId)} LIMIT 1`;
  const raw = (rows[0] as { value?: string } | undefined)?.value;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function saveWeeklyPlan(studentId: string, times: Record<string, string>) {
  await ensureTable();
  const value = JSON.stringify(times);
  const key = keyFor(studentId);
  await db()`
    INSERT INTO nfit_settings (key, value)
    VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = ${value}
  `;
}
