import { listCheckins } from "@/lib/server/checkins";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
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
