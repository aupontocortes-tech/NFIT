import { neon } from "@neondatabase/serverless";
import type { PixConfig } from "@/lib/pix";

export type StoredProfile = {
  saved: boolean;
  name: string;
  email: string;
  bio: string;
  studioName: string;
  timezone: string;
  notificationPrefs: { email: boolean; push: boolean };
  pix: PixConfig | null;
};

const DEFAULTS: StoredProfile = {
  saved: false,
  name: "Tiago",
  email: "",
  bio: "",
  studioName: "Studio nfit",
  timezone: "America/Sao_Paulo",
  notificationPrefs: { email: true, push: true },
  pix: null,
};

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

export async function readProfile(): Promise<StoredProfile> {
  await ensureTable();
  const rows = await db()`
    SELECT value FROM nfit_settings WHERE key = ${"personal_profile"} LIMIT 1
  `;
  const raw = (rows[0] as { value?: string } | undefined)?.value;
  if (!raw) return DEFAULTS;
  try {
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<StoredProfile>), saved: true };
  } catch {
    return DEFAULTS;
  }
}

export async function writeProfile(input: Partial<StoredProfile>): Promise<StoredProfile> {
  await ensureTable();
  const current = await readProfile();
  const next = { ...current, ...input, saved: true, pix: input.pix === undefined ? current.pix : input.pix };
  await db()`
    INSERT INTO nfit_settings (key, value)
    VALUES (${"personal_profile"}, ${JSON.stringify(next)})
    ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(next)}
  `;
  return next;
}
