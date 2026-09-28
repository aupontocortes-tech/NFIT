import { completeAssignment, getAssignment } from "@/lib/server/workouts";
import { currentSession, requireStudentAccess } from "@/lib/server/guard";
import { workouts } from "@/lib/mocks";

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
    if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
      const session = await currentSession(request);
      const studentId = session?.role === "aluno" ? session.studentId : "s-001";
      const denied = requireStudentAccess(session, studentId);
      if (denied) return denied;
      const w = workouts[0];
      return Response.json({
        id,
        workoutId: w.id,
        studentId,
        status: "active",
        startDate: new Date().toISOString().slice(0, 10),
        workoutTitle: w.title,
        workout: w,
      });
    }
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
