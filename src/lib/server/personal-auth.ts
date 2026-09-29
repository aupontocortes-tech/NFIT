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

function asList(raw: string): PersonalAuth[] {
  try {
    const parsed = JSON.parse(raw) as PersonalAuth | PersonalAuth[];
    const items = Array.isArray(parsed) ? parsed : [parsed];
    return items
      .filter((item) => item?.email && item?.passwordHash)
      .map((item) => ({ email: item.email.trim().toLowerCase(), passwordHash: item.passwordHash }));
  } catch {
    return [];
  }
}

export async function listPersonalAuth(): Promise<PersonalAuth[]> {
  await ensure();
  const rows = await db()`SELECT value FROM nfit_settings WHERE key = ${"personal_auth"} LIMIT 1`;
  const raw = (rows[0] as { value?: string } | undefined)?.value;
  return raw ? asList(raw) : [];
}

async function savePersonalAuth(list: PersonalAuth[]) {
  await ensure();
  const value = JSON.stringify(list);
  await db()`
    INSERT INTO nfit_settings (key, value)
    VALUES (${"personal_auth"}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = ${value}
  `;
}

export async function readPersonalAuth(): Promise<PersonalAuth | null> {
  const list = await listPersonalAuth();
  return list[0] ?? null;
}

export async function writePersonalAuth(email: string, passwordHash: string, name?: string) {
  const next = { email: email.trim().toLowerCase(), passwordHash };
  await savePersonalAuth([next]);
  await writeProfile({ email: next.email, ...(name?.trim() ? { name: name.trim() } : {}) });
}

export async function addPersonalAuth(email: string, passwordHash: string) {
  const normalized = email.trim().toLowerCase();
  const list = await listPersonalAuth();
  if (list.some((item) => item.email === normalized)) return false;
  list.push({ email: normalized, passwordHash });
  await savePersonalAuth(list);
  return true;
}

export async function replacePersonalPassword(currentPassword: string, passwordHash: string, verify: (password: string, hash: string) => Promise<boolean>) {
  const list = await listPersonalAuth();
  for (let i = 0; i < list.length; i++) {
    if (await verify(currentPassword, list[i].passwordHash)) {
      list[i] = { ...list[i], passwordHash };
      await savePersonalAuth(list);
      return true;
    }
  }
  return false;
}
