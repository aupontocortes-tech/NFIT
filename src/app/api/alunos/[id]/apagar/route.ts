import { issueDeleteCode } from "@/lib/server/students";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const code = await issueDeleteCode(id);
    if (!code) {
      return Response.json({ error: { message: "Aluno não encontrado" } }, { status: 404 });
    }
    return Response.json({ code });
  } catch (e) {
    console.error("[apagar]", e);
    return Response.json({ error: { message: "Não foi possível gerar o código." } }, { status: 503 });
  }
}
