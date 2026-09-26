import { updateEvent } from "@/lib/server/events";
import type { EventItem } from "@/lib/mocks";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  let body: { startsAt?: string; endsAt?: string; status?: EventItem["status"] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  const start = body.startsAt ? new Date(body.startsAt) : null;
  const end = body.endsAt ? new Date(body.endsAt) : null;
  if (!start || Number.isNaN(start.getTime())) {
    return Response.json({ error: { message: "Informe o novo horário." } }, { status: 400 });
  }
  const ends = end && !Number.isNaN(end.getTime()) ? end : new Date(start.getTime() + 60 * 60 * 1000);
  try {
    const item = await updateEvent(id, {
      startsAt: start.toISOString(),
      endsAt: ends.toISOString(),
      status: body.status ?? "rescheduled",
    });
    if (!item) {
      return Response.json({ error: { message: "Aula não encontrada." } }, { status: 404 });
    }
    return Response.json(item);
  } catch (e) {
    console.error("[agenda]", e);
    return Response.json({ error: { message: "Não foi possível remarcar." } }, { status: 503 });
  }
}
