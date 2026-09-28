import { studentIdByToken } from "@/lib/server/checkins";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { clientIp, rateLimitResponse, tooFast } from "@/lib/server/rate-limit";
import { getStudent, setStudentPassword, studentHasPassword } from "@/lib/server/students";
import { sessionSetCookie, signSession } from "@/lib/session-cookie";
import { passwordProblem } from "@/lib/validators";

type Ctx = { params: Promise<{ token: string }> };

async function studentFromToken(token: string) {
  const studentId = await studentIdByToken(token);
  if (!studentId) return null;
  const student = await getStudent(studentId);
  if (!student) return null;
  return student;
}

export async function GET(_request: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  try {
    const student = await studentFromToken(token);
    if (!student) return Response.json({ error: { message: "Link inválido" } }, { status: 404 });
    return Response.json({
      id: student.id,
      name: student.name,
      hasPassword: await studentHasPassword(student.id),
    });
  } catch (e) {
    console.error("[entrar]", e);
    return Response.json({ error: { message: "Não foi possível abrir o aplicativo." } }, { status: 503 });
  }
}

export async function POST(request: Request, ctx: Ctx) {
  if (tooFast(`entrar:${clientIp(request)}`, 8)) return rateLimitResponse();
  const { token } = await ctx.params;
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  try {
    const student = await studentFromToken(token);
    if (!student) return Response.json({ error: { message: "Link inválido" } }, { status: 404 });
    const password = String(body.password ?? "");
    const has = await studentHasPassword(student.id);
    if (!has) {
      const problem = passwordProblem(password);
      if (problem) return Response.json({ error: { message: problem } }, { status: 400 });
      await setStudentPassword(student.id, await hashPassword(password));
    } else {
      const auth = await import("@/lib/server/students").then((m) => m.studentAuthByEmail(student.email));
      if (!auth?.passwordHash || !(await verifyPassword(password, auth.passwordHash))) {
        return Response.json({ error: { message: "Senha não confere." } }, { status: 401 });
      }
    }
    const session = await signSession({ role: "aluno", studentId: student.id });
    return Response.json(
      { id: student.id, name: student.name },
      { headers: { "Set-Cookie": sessionSetCookie(session) } },
    );
  } catch (e) {
    console.error("[entrar]", e);
    return Response.json({ error: { message: "Não foi possível entrar." } }, { status: 503 });
  }
}
