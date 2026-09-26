import { createAssignments } from "@/lib/server/workouts";

export async function POST(request: Request) {
  let body: { workoutId?: string; studentIds?: string[]; startDate?: string; notes?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  if (!body.workoutId || !body.studentIds?.length || !body.startDate) {
    return Response.json({ error: { message: "Escolha o treino, o aluno e a data." } }, { status: 400 });
  }
  try {
    const assignments = await createAssignments({
      workoutId: body.workoutId,
      studentIds: body.studentIds,
      startDate: body.startDate,
      notes: body.notes,
    });
    return Response.json({ assignments }, { status: 201 });
  } catch (e) {
    console.error("[treinos]", e);
    return Response.json({ error: { message: "Não foi possível atribuir." } }, { status: 503 });
  }
}
