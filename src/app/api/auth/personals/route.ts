import { currentSession, requirePersonal } from "@/lib/server/guard";
import { hashPassword } from "@/lib/server/password";
import {
  listPersonalAccounts,
  removePersonalAccount,
  upsertPersonalAccount,
} from "@/lib/server/personal-auth";
import { isEmail, passwordProblem } from "@/lib/validators";

export async function GET(request: Request) {
  const session = await currentSession(request);
  const denied = requirePersonal(session);
  if (denied) return denied;
  const accounts = await listPersonalAccounts();
  return Response.json({
    items: accounts.map((a) => ({ email: a.email, name: a.name ?? null })),
    me: session && session.role === "personal" ? session.email ?? null : null,
  });
}

export async function POST(request: Request) {
  const session = await currentSession(request);
  const denied = requirePersonal(session);
  if (denied) return denied;
  let body: { email?: string; password?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim();
  const problem = passwordProblem(password);
  if (!isEmail(email) || problem) {
    return Response.json({ error: { message: problem || "E-mail inválido" } }, { status: 400 });
  }
  const existing = await listPersonalAccounts();
  if (existing.some((a) => a.email === email)) {
    return Response.json({ error: { message: "Esse e-mail já tem acesso." } }, { status: 409 });
  }
  const account = await upsertPersonalAccount({
    email,
    passwordHash: await hashPassword(password),
    name: name || undefined,
  });
  return Response.json(
    { email: account.email, name: account.name ?? null },
    { status: 201 },
  );
}

export async function DELETE(request: Request) {
  const session = await currentSession(request);
  const denied = requirePersonal(session);
  if (denied) return denied;
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!isEmail(email)) {
    return Response.json({ error: { message: "E-mail inválido" } }, { status: 400 });
  }
  if (session && session.role === "personal" && session.email === email) {
    return Response.json(
      { error: { message: "Você não pode remover o próprio acesso enquanto estiver logada." } },
      { status: 400 },
    );
  }
  const result = await removePersonalAccount(email);
  if ("error" in result) {
    return Response.json({ error: { message: result.error } }, { status: 400 });
  }
  return Response.json({ ok: true });
}
