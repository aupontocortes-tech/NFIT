import { readCookie, verifySession, type AppSession } from "@/lib/session-cookie";

export async function currentSession(request: Request): Promise<AppSession | null> {
  return verifySession(readCookie(request, "nfit_session"));
}

export function unauthorized() {
  return Response.json({ error: { message: "Entre para continuar." } }, { status: 401 });
}

export function forbidden() {
  return Response.json({ error: { message: "Esses dados são de outra pessoa." } }, { status: 403 });
}

export function requirePersonal(session: AppSession | null) {
  if (!session || session.role !== "personal") return unauthorized();
  return null;
}

export function requireStudentAccess(session: AppSession | null, studentId: string) {
  if (!session) return unauthorized();
  if (session.role === "personal") return null;
  if (session.role === "aluno" && session.studentId === studentId) return null;
  return forbidden();
}
