import { completeAssignment, deleteAssignment, getAssignment } from "@/lib/server/workouts";
import { currentSession, requirePersonal, requireStudentAccess } from "@/lib/server/guard";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const item = await getAssignment(id);
    if (!item) return Response.json({ error: { message: "Treino não encontrado" } }, { status: 404 });
    const denied = requireStudentAccess(await currentSession(request), item.studentId);
    if (denied) return denied;
    return Response.json(item);
  } catch (e) {
    console.error("[treinos]", e);
    return Response.json({ error: { message: "Não foi possível abrir o treino." } }, { status: 503 });
  }
}

export async function POST(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const existing = await getAssignment(id);
    if (!existing) return Response.json({ error: { message: "Treino não encontrado" } }, { status: 404 });
    const denied = requireStudentAccess(await currentSession(request), existing.studentId);
    if (denied) return denied;
    const item = await completeAssignment(id);
    if (!item) return Response.json({ error: { message: "Treino não encontrado" } }, { status: 404 });
    return Response.json({ sessionId: item.id, status: "completed" as const });
  } catch (e) {
    console.error("[treinos]", e);
    return Response.json({ error: { message: "Não foi possível concluir o treino." } }, { status: 503 });
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  const denied = requirePersonal(await currentSession(request));
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    const removed = await deleteAssignment(id);
    if (!removed) return Response.json({ error: { message: "Treino não encontrado" } }, { status: 404 });
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[treinos]", e);
    return Response.json({ error: { message: "Não foi possível excluir o treino." } }, { status: 503 });
  }
}
