import { currentSession, requirePersonal } from "@/lib/server/guard";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { replacePersonalPassword } from "@/lib/server/personal-auth";
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
  const next = String(body.next ?? "");
  const problem = passwordProblem(next);
  if (problem) return Response.json({ error: { message: problem } }, { status: 400 });
  const ok = await replacePersonalPassword(String(body.current ?? ""), await hashPassword(next), verifyPassword);
  if (!ok) return Response.json({ error: { message: "Senha atual não confere." } }, { status: 400 });
  return Response.json({ ok: true });
}
