import { patchStudent } from "@/lib/server/students";
import { studentIdByToken } from "@/lib/server/checkins";

type Ctx = { params: Promise<{ token: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  let body: { avatarUrl?: string | null };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  const avatarUrl = body.avatarUrl ? String(body.avatarUrl).slice(0, 300) : null;
  if (avatarUrl && !avatarUrl.startsWith("/api/fotos/")) {
    return Response.json({ error: { message: "Foto inválida." } }, { status: 400 });
  }
  try {
    const studentId = await studentIdByToken(token);
    if (!studentId) {
      return Response.json({ error: { message: "Link inválido" } }, { status: 404 });
    }
    const student = await patchStudent(studentId, { avatarUrl });
    if (!student) {
      return Response.json({ error: { message: "Aluno não encontrado" } }, { status: 404 });
    }
    return Response.json({ avatarUrl: student.avatarUrl ?? null });
  } catch (e) {
    console.error("[avaliacao-foto]", e);
    return Response.json({ error: { message: "Não foi possível salvar a foto." } }, { status: 503 });
  }
}
