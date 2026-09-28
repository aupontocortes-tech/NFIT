const MAX_AGE_SEC = 60 * 60 * 24 * 30;

export type AppSession =
  | { role: "personal" }
  | { role: "aluno"; studentId: string };

function secretBytes() {
  const raw = process.env.SESSION_SECRET || process.env.DATABASE_URL || "nfit-dev-session";
  return new TextEncoder().encode(raw);
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey("raw", secretBytes(), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signSession(session: AppSession) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const body = session.role === "personal" ? `p.${exp}` : `a.${session.studentId}.${exp}`;
  return `${body}.${await hmac(body)}`;
}

export async function verifySession(value: string | null | undefined): Promise<AppSession | null> {
  if (!value) return null;
  const parts = value.split(".");
  let body = "";
  let sig = "";
  if (parts.length === 3 && parts[0] === "p") {
    body = `${parts[0]}.${parts[1]}`;
    sig = parts[2];
  } else if (parts.length === 4 && parts[0] === "a" && parts[1]) {
    body = `${parts[0]}.${parts[1]}.${parts[2]}`;
    sig = parts[3];
  } else {
    return null;
  }
  if (!same(sig, await hmac(body))) return null;
  const exp = Number(body.startsWith("p.") ? body.slice(2) : body.split(".")[2]);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
  if (body.startsWith("p.")) return { role: "personal" };
  return { role: "aluno", studentId: body.split(".")[1] };
}

export function sessionSetCookie(token: string | null) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  if (!token) return `nfit_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
  return `nfit_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SEC}${secure}`;
}

export function readCookie(request: Request, name: string) {
  const raw = request.headers.get("cookie") ?? "";
  const part = raw
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${name}=`));
  if (!part) return null;
  try {
    return decodeURIComponent(part.slice(name.length + 1));
  } catch {
    return null;
  }
}
