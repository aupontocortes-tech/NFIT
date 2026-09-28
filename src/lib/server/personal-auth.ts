import { neon } from "@neondatabase/serverless";
import { writeProfile } from "@/lib/server/profile";

export type PersonalAuth = { email: string; passwordHash: string };

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL ausente");
  return neon(url);
}

async function ensure() {
  await db()`
    CREATE TABLE IF NOT EXISTS nfit_settings (
      key text PRIMARY KEY,
      value text NOT NULL
    )
  `;
}

export async function readPersonalAuth(): Promise<PersonalAuth | null> {
  await ensure();
  const rows = await db()`SELECT value FROM nfit_settings WHERE key = ${"personal_auth"} LIMIT 1`;
  const raw = (rows[0] as { value?: string } | undefined)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersonalAuth;
    if (!parsed.email || !parsed.passwordHash) return null;
    return { email: parsed.email.trim().toLowerCase(), passwordHash: parsed.passwordHash };
  } catch {
    return null;
  }
}

export async function writePersonalAuth(email: string, passwordHash: string, name?: string) {
  await ensure();
  const next = { email: email.trim().toLowerCase(), passwordHash };
  await db()`
    INSERT INTO nfit_settings (key, value)
    VALUES (${"personal_auth"}, ${JSON.stringify(next)})
    ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(next)}
  `;
  await writeProfile({ email: next.email, ...(name?.trim() ? { name: name.trim() } : {}) });
}
