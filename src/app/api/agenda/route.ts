import { createEvent, listEvents } from "@/lib/server/events";
import type { EventType } from "@/lib/mocks";

export async function GET() {
  try {
    const items = await listEvents();
    return Response.json({ items });
  } catch (e) {
    console.error("[agenda]", e);
    return Response.json({ error: { message: "Não foi possível ler a agenda." } }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let body: {
    studentId?: string;
    studentName?: string;
    title?: string;
    type?: EventType;
    startsAt?: string;
    endsAt?: string;
    location?: string;
    notes?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  const start = body.startsAt ? new Date(body.startsAt) : null;
  const end = body.endsAt ? new Date(body.endsAt) : null;
  if (!body.studentId || !body.studentName || !body.title?.trim() || !start || Number.isNaN(start.getTime())) {
    return Response.json({ error: { message: "Informe aluno, título e horário." } }, { status: 400 });
  }
  const ends = end && !Number.isNaN(end.getTime()) ? end : new Date(start.getTime() + 60 * 60 * 1000);
  try {
    const item = await createEvent({
      studentId: body.studentId,
      studentName: body.studentName,
      title: body.title.trim(),
      type: body.type,
      startsAt: start.toISOString(),
      endsAt: ends.toISOString(),
      location: body.location,
      notes: body.notes,
    });
    return Response.json(item, { status: 201 });
  } catch (e) {
    console.error("[agenda]", e);
    return Response.json({ error: { message: "Não foi possível marcar a aula." } }, { status: 503 });
  }
}
