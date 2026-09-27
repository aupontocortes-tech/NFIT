import { completeAssignment, getAssignment } from "@/lib/server/workouts";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const item = await getAssignment(id);
    if (!item) return Response.json({ error: { message: "Treino não encontrado" } }, { status: 404 });
    return Response.json(item);
  } catch (e) {
    console.error("[treinos]", e);
    return Response.json({ error: { message: "Não foi possível abrir o treino." } }, { status: 503 });
  }
}

export async function POST(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const item = await completeAssignment(id);
    if (!item) return Response.json({ error: { message: "Treino não encontrado" } }, { status: 404 });
    return Response.json({ sessionId: item.id, status: "completed" as const });
  } catch (e) {
    console.error("[treinos]", e);
    return Response.json({ error: { message: "Não foi possível concluir o treino." } }, { status: 503 });
  }
}
