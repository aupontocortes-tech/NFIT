import { getOrCreateCheckinToken } from "@/lib/server/checkins";
import { getStudent } from "@/lib/server/students";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const student = await getStudent(id);
    if (!student) {
      return Response.json({ error: { message: "Aluno não encontrado" } }, { status: 404 });
    }
    const token = await getOrCreateCheckinToken(id);
    const origin = new URL(request.url).origin;
    return Response.json({ token, url: `${origin}/avaliacao/${token}` });
  } catch (e) {
    console.error("[checkin-link]", e);
    return Response.json(
      { error: { message: "Não foi possível criar o link." } },
      { status: 503 },
    );
  }
}
