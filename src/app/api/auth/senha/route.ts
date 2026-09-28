import { currentSession, requirePersonal } from "@/lib/server/guard";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { readPersonalAuth, writePersonalAuth } from "@/lib/server/personal-auth";
import { passwordProblem } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await currentSession(request);
  const denied = requirePersonal(session);
  if (denied) return denied;
  let body: { current?: string; next?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  const auth = await readPersonalAuth();
  if (!auth || !(await verifyPassword(String(body.current ?? ""), auth.passwordHash))) {
    return Response.json({ error: { message: "Senha atual não confere." } }, { status: 400 });
  }
  const problem = passwordProblem(String(body.next ?? ""));
  if (problem) return Response.json({ error: { message: problem } }, { status: 400 });
  await writePersonalAuth(auth.email, await hashPassword(String(body.next)));
  return Response.json({ ok: true });
}
