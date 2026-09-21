/**
 * Smoke-test: mirrors client login (Bearer + /auth/login) against live API.
 * Reads NEXT_PUBLIC_* from .env.local
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envText = readFileSync(resolve(root, ".env.local"), "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const API_BASE = env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";
const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK !== "false";

if (USE_MOCK) {
  console.error("FAIL: NEXT_PUBLIC_USE_MOCK is not false");
  process.exit(1);
}

const store = { token: null };

async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${email}: ${data?.error?.message || res.status}`);
  store.token = data.token;
  return data;
}

async function authed(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${store.token}`,
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${path}: ${data?.error?.message || res.status}`);
  return data;
}

const seeds = [
  ["personal@nfit.local", "senha12345", "personal", "/dashboard"],
  ["aluno@nfit.local", "senha12345", "aluno", "/aluno/inicio"],
];

let failed = 0;
for (const [email, password, role, redirect] of seeds) {
  try {
    const { user, token } = await apiLogin(email, password);
    if (user.role !== role) throw new Error(`role=${user.role} expected ${role}`);
    if (!token || token.length < 20) throw new Error("missing JWT");
    const me = await authed("/auth/me");
    if (me.email !== email) throw new Error(`me.email=${me.email}`);
    console.log(`OK login ${email} → role=${user.role} redirect=${redirect} me=${me.name}`);
  } catch (e) {
    failed++;
    console.error(`FAIL ${email}:`, e.message);
  }
}

// personal-only smoke
try {
  await apiLogin("personal@nfit.local", "senha12345");
  const students = await authed("/students?pageSize=5");
  const workouts = await authed("/workouts?pageSize=5");
  console.log(
    `OK personal lists students=${students.total ?? students.items?.length} workouts=${workouts.total ?? workouts.items?.length}`,
  );
} catch (e) {
  failed++;
  console.error("FAIL lists:", e.message);
}

console.log(failed ? `DONE with ${failed} failure(s)` : "DONE all passed");
process.exit(failed ? 1 : 0);
