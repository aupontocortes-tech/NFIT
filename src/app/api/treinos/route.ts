import { listWorkouts, saveWorkout } from "@/lib/server/workouts";
import { currentSession, requirePersonal } from "@/lib/server/guard";
import type { Workout } from "@/lib/mocks";

export async function GET(request: Request) {
  const denied = requirePersonal(await currentSession(request));
  if (denied) return denied;
  const url = new URL(request.url);
  try {
    let items = await listWorkouts();
    const status = url.searchParams.get("status");
    const ai = url.searchParams.get("generatedByAi");
    if (status) items = items.filter((w) => w.status === status);
    if (ai === "true" || ai === "false") items = items.filter((w) => w.generatedByAi === (ai === "true"));
    return Response.json({ items, page: 1, pageSize: 50, total: items.length });
  } catch (e) {
    console.error("[treinos]", e);
    return Response.json({ error: { message: "Não foi possível ler os treinos." } }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const denied = requirePersonal(await currentSession(request));
  if (denied) return denied;
  let body: Partial<Workout>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  if (!body.title?.trim()) {
    return Response.json({ error: { message: "Informe o nome do treino." } }, { status: 400 });
  }
  try {
    const workout = await saveWorkout({ ...body, title: body.title.trim() });
    return Response.json(workout, { status: 201 });
  } catch (e) {
    console.error("[treinos]", e);
    return Response.json({ error: { message: "Não foi possível salvar o treino." } }, { status: 503 });
  }
}