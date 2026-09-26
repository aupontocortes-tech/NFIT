import { getStudent, patchStudent } from "@/lib/server/students";
import type { StudentStatus } from "@/lib/mocks";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const student = await getStudent(id);
    if (!student) {
      return Response.json({ error: { message: "Aluno não encontrado" } }, { status: 404 });
    }
    return Response.json(student);
  } catch (e) {
    console.error("[alunos]", e);
    return Response.json(
      { error: { message: "Não foi possível ler o aluno." } },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  let body: Partial<{ name: string; phone: string; notes: string; status: StudentStatus; avatarUrl: string | null }>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
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
