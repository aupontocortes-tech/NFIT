import { getWorkout, saveWorkout } from "@/lib/server/workouts";
import type { Workout } from "@/lib/mocks";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const workout = await getWorkout(id);
    if (!workout) return Response.json({ error: { message: "Treino não encontrado" } }, { status: 404 });
    return Response.json(workout);
  } catch (e) {
    console.error("[treinos]", e);
    return Response.json({ error: { message: "Não foi possível ler o treino." } }, { status: 503 });
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  let body: Partial<Workout>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  try {
    const current = await getWorkout(id);
    if (!current) return Response.json({ error: { message: "Treino não encontrado" } }, { status: 404 });
    const workout = await saveWorkout({ ...current, ...body, id, title: body.title?.trim() || current.title });
    return Response.json(workout);
  } catch (e) {
    console.error("[treinos]", e);
    return Response.json({ error: { message: "Não foi possível salvar o treino." } }, { status: 503 });
  }
}
