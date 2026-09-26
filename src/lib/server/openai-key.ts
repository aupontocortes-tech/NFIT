import { neon } from "@neondatabase/serverless";

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL ausente");
  return neon(url);
}

let ready: Promise<void> | null = null;

function ensureTable() {
  ready ??= db()`
    CREATE TABLE IF NOT EXISTS nfit_settings (
      key text PRIMARY KEY,
      value text NOT NULL
    )
  `.then(() => undefined);
  return ready;
}

export async function getOpenAiKey(): Promise<string | null> {
  await ensureTable();
  const rows = await db()`
    SELECT value FROM nfit_settings WHERE key = ${"openai_api_key"} LIMIT 1
  `;
  const value = (rows[0] as { value?: string } | undefined)?.value?.trim();
  return value || null;
}

export async function saveOpenAiKey(key: string) {
  await ensureTable();
  await db()`
    INSERT INTO nfit_settings (key, value)
    VALUES (${"openai_api_key"}, ${key})
    ON CONFLICT (key) DO UPDATE SET value = ${key}
  `;
}
