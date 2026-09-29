import { addPersonalAuth, listPersonalAuth } from "@/lib/server/personal-auth";
import { hashPassword } from "@/lib/server/password";
import { currentSession, requirePersonal } from "@/lib/server/guard";
import { isEmail, passwordProblem } from "@/lib/validators";

export async function GET(request: Request) {
  const denied = requirePersonal(await currentSession(request));
  if (denied) return denied;
  const emails = (await listPersonalAuth()).map((item) => item.email);
  return Response.json({ emails });
}

export async function POST(request: Request) {
  const denied = requirePersonal(await currentSession(request));
  if (denied) return denied;
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim();
  const problem = passwordProblem(password);
  if (name.length < 2) return Response.json({ error: { message: "Informe o nome." } }, { status: 400 });
  if (!isEmail(email) || problem) {
    return Response.json({ error: { message: problem || "E-mail inválido" } }, { status: 400 });
  }
  const added = await addPersonalAuth(email, await hashPassword(password));
  if (!added) {
    return Response.json({ error: { message: "Esse e-mail já entra como personal." } }, { status: 409 });
  }
  return Response.json({ ok: true, name, email }, { status: 201 });
}
