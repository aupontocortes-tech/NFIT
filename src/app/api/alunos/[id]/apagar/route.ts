import { issueDeleteCode } from "@/lib/server/students";
import { currentSession, requirePersonal } from "@/lib/server/guard";
import { clientIp, rateLimitResponse, tooFast } from "@/lib/server/rate-limit";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const denied = requirePersonal(await currentSession(request));
  if (denied) return denied;
  if (tooFast(`apagar:${clientIp(request)}`, 5)) return rateLimitResponse();
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
