import { getWeeklyPlan, saveWeeklyPlan } from "@/lib/server/weekly-plan";
import { currentSession, requirePersonal } from "@/lib/server/guard";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const denied = requirePersonal(await currentSession(request));
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    const times = await getWeeklyPlan(id);
    return Response.json({ times });
  } catch (e) {
    console.error("[semana]", e);
    return Response.json({ error: { message: "Não foi possível ler os dias." } }, { status: 503 });
  }
}

export async function PUT(request: Request, ctx: Ctx) {
  const denied = requirePersonal(await currentSession(request));
  if (denied) return denied;
  const { id } = await ctx.params;
  let body: { times?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  const times: Record<string, string> = {};
  for (const [day, clock] of Object.entries(body.times ?? {})) {
    if (/^[0-6]$/.test(day) && /^\d{2}:\d{2}$/.test(clock)) times[day] = clock;
  }
  try {
    await saveWeeklyPlan(id, times);
    return Response.json({ times });
  } catch (e) {
    console.error("[semana]", e);
    return Response.json({ error: { message: "Não foi possível salvar os dias." } }, { status: 503 });
  }
}
