import { deleteStudent, getStudent, patchStudent } from "@/lib/server/students";
import { currentSession, requirePersonal, requireStudentAccess } from "@/lib/server/guard";
import { isoDateProblem } from "@/lib/validators";
import type { StudentStatus } from "@/lib/mocks";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const denied = requireStudentAccess(await currentSession(request), id);
  if (denied) return denied;
  try {
    const student = await getStudent(id);
    if (!student) {
      if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
        return Response.json({
          id,
          name: "Aluno demo",
          email: "aluno@nfit.local",
          status: "active",
          createdAt: new Date().toISOString(),
          activeWorkoutCount: 1,
        });
      }
      return Response.json({ error: { message: "Aluno não encontrado" } }, { status: 404 });
    }
    return Response.json(student);
  } catch (e) {
    console.error("[alunos]", e);
    if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
      return Response.json({
        id,
        name: "Aluno demo",
        email: "aluno@nfit.local",
        status: "active",
        createdAt: new Date().toISOString(),
        activeWorkoutCount: 1,
      });
    }
    return Response.json(
      { error: { message: "Não foi possível ler o aluno." } },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const denied = requirePersonal(await currentSession(request));
  if (denied) return denied;
  let body: Partial<{
    name: string;
    phone: string;
    notes: string;
    status: StudentStatus;
    avatarUrl: string | null;
    nextAssessmentAt: string | null;
  }>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  if (body.nextAssessmentAt) {
    const problem = isoDateProblem(body.nextAssessmentAt);
    if (problem) return Response.json({ error: { message: problem } }, { status: 400 });
  }
  try {
    const student = await patchStudent(id, body);
    if (!student) {
      return Response.json({ error: { message: "Aluno não encontrado" } }, { status: 404 });
    }
    return Response.json(student);
  } catch (e) {
    console.error("[alunos]", e);
    return Response.json(
      { error: { message: "Não foi possível atualizar o aluno." } },
      { status: 503 },
    );
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const denied = requirePersonal(await currentSession(request));
  if (denied) return denied;
  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "Informe o código de confirmação." } }, { status: 400 });
  }
  if (!(body.code ?? "").trim()) {
    return Response.json({ error: { message: "Cole o código gerado para este aluno." } }, { status: 400 });
  }
  try {
    const removed = await deleteStudent(id, body.code ?? "");
    if (removed === "missing") {
      return Response.json({ error: { message: "Aluno não encontrado" } }, { status: 404 });
    }
    if (removed === "wrong") {
      return Response.json({ error: { message: "Código incorreto. Gere outro e cole de novo." } }, { status: 403 });
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[alunos]", e);
    return Response.json({ error: { message: "Não foi possível apagar o aluno." } }, { status: 503 });
  }
}
