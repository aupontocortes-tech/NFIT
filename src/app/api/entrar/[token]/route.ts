import { studentIdByToken } from "@/lib/server/checkins";
import { getStudent } from "@/lib/server/students";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  try {
    const studentId = await studentIdByToken(token);
    if (!studentId) {
      return Response.json({ error: { message: "Link inválido" } }, { status: 404 });
    }
    const student = await getStudent(studentId);
    if (!student) {
      return Response.json({ error: { message: "Aluno não encontrado" } }, { status: 404 });
    }
    return Response.json({ id: student.id, name: student.name });
  } catch (e) {
    console.error("[entrar]", e);
    return Response.json({ error: { message: "Não foi possível abrir o aplicativo." } }, { status: 503 });
  }
}
