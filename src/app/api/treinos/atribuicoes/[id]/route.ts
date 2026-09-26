import { getAssignment } from "@/lib/server/workouts";

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
