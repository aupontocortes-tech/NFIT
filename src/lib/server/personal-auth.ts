import { neon } from "@neondatabase/serverless";
import { writeProfile } from "@/lib/server/profile";

export type PersonalAccount = {
  email: string;
  passwordHash: string;
  name?: string;
};

/** Formato legado: um único objeto. Novo: lista em `accounts`. */
export type StoredAuth =
  | { email: string; passwordHash: string; name?: string }
  | { accounts: PersonalAccount[] };

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

export function normalizePersonalEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Converte JSON legado ou novo para lista de contas (sem I/O). */
export function parsePersonalAccounts(raw: StoredAuth | null | undefined): PersonalAccount[] {
  if (!raw) return [];
  if ("accounts" in raw && Array.isArray(raw.accounts)) {
    return raw.accounts
      .filter((a) => a?.email && a?.passwordHash)
      .map((a) => ({
        email: normalizePersonalEmail(a.email),
        passwordHash: a.passwordHash,
        ...(a.name?.trim() ? { name: a.name.trim() } : {}),
      }));
  }
  if ("email" in raw && raw.email && raw.passwordHash) {
    return [
      {
        email: normalizePersonalEmail(raw.email),
        passwordHash: raw.passwordHash,
        ...(raw.name?.trim() ? { name: raw.name.trim() } : {}),
      },
    ];
  }
  return [];
}

export function findAccountByEmail(
  accounts: PersonalAccount[],
  email: string,
): PersonalAccount | null {
  const key = normalizePersonalEmail(email);
  return accounts.find((a) => a.email === key) ?? null;
}

async function readRaw(): Promise<StoredAuth | null> {
  await ensure();
  const rows = await db()`SELECT value FROM nfit_settings WHERE key = ${"personal_auth"} LIMIT 1`;
  const raw = (rows[0] as { value?: string } | undefined)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

async function writeAccounts(accounts: PersonalAccount[]) {
  await ensure();
  const next = { accounts };
  await db()`
    INSERT INTO nfit_settings (key, value)
    VALUES (${"personal_auth"}, ${JSON.stringify(next)})
    ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(next)}
  `;
}

/** Lista de contas (migra formato antigo automaticamente na leitura). */
export async function listPersonalAccounts(): Promise<PersonalAccount[]> {
  return parsePersonalAccounts(await readRaw());
}

/** Compat: primeira conta, ou null. */
export async function readPersonalAuth(): Promise<PersonalAccount | null> {
  const accounts = await listPersonalAccounts();
  return accounts[0] ?? null;
}

export async function findPersonalByEmail(email: string): Promise<PersonalAccount | null> {
  return findAccountByEmail(await listPersonalAccounts(), email);
}

/** Setup inicial ou sobrescrita da conta única (mantido para PUT de cadastro). */
export async function writePersonalAuth(email: string, passwordHash: string, name?: string) {
  const account: PersonalAccount = {
    email: normalizePersonalEmail(email),
    passwordHash,
    ...(name?.trim() ? { name: name.trim() } : {}),
  };
  const existing = await listPersonalAccounts();
  if (existing.length === 0) {
    await writeAccounts([account]);
  } else {
    const idx = existing.findIndex((a) => a.email === account.email);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...account };
      await writeAccounts(existing);
    } else if (existing.length === 1) {
      // Troca de senha no formato legado (uma conta): atualiza a primeira
      existing[0] = { ...existing[0], passwordHash: account.passwordHash };
      await writeAccounts(existing);
    } else {
      await writeAccounts([...existing, account]);
    }
  }
  await writeProfile({
    email: account.email,
    ...(account.name ? { name: account.name } : {}),
  });
}

export async function upsertPersonalAccount(input: {
  email: string;
  passwordHash: string;
  name?: string;
}): Promise<PersonalAccount> {
  const email = normalizePersonalEmail(input.email);
  const accounts = await listPersonalAccounts();
  const next: PersonalAccount = {
    email,
    passwordHash: input.passwordHash,
    ...(input.name?.trim() ? { name: input.name.trim() } : {}),
  };
  const idx = accounts.findIndex((a) => a.email === email);
  if (idx >= 0) {
    accounts[idx] = { ...accounts[idx], ...next, name: next.name ?? accounts[idx].name };
  } else {
    accounts.push(next);
  }
  await writeAccounts(accounts);
  return accounts.find((a) => a.email === email)!;
}

export async function updatePersonalPassword(email: string, passwordHash: string) {
  const key = normalizePersonalEmail(email);
  const accounts = await listPersonalAccounts();
  const idx = accounts.findIndex((a) => a.email === key);
  if (idx < 0) throw new Error("Conta não encontrada");
  accounts[idx] = { ...accounts[idx], passwordHash };
  await writeAccounts(accounts);
}

export async function removePersonalAccount(email: string): Promise<{ ok: true } | { error: string }> {
  const key = normalizePersonalEmail(email);
  const accounts = await listPersonalAccounts();
  if (accounts.length <= 1) {
    return { error: "É preciso manter ao menos uma professora com acesso." };
  }
  const next = accounts.filter((a) => a.email !== key);
  if (next.length === accounts.length) {
    return { error: "Conta não encontrada." };
  }
  await writeAccounts(next);
  return { ok: true };
}

export async function hasAnyPersonal(): Promise<boolean> {
  return (await listPersonalAccounts()).length > 0;
}
