import { listCheckins } from "@/lib/server/checkins";
import { currentSession, requireStudentAccess } from "@/lib/server/guard";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const denied = requireStudentAccess(await currentSession(request), id);
  if (denied) return denied;
  try {
    const items = await listCheckins(id);
    return Response.json({ items });
  } catch (e) {
    console.error("[avaliacoes]", e);
    return Response.json(
      { error: { message: "Não foi possível ler as avaliações." } },
      { status: 503 },
    );
  }
}
