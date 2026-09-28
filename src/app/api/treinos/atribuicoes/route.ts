import { listAssignments } from "@/lib/server/workouts";
import { currentSession, forbidden, unauthorized } from "@/lib/server/guard";
import { workouts } from "@/lib/mocks";

export async function GET(request: Request) {
  const session = await currentSession(request);
  if (!session) return unauthorized();
  const asked = new URL(request.url).searchParams.get("studentId") ?? undefined;
  const studentId = session.role === "aluno" ? session.studentId : asked;
  if (session.role === "aluno" && asked && asked !== session.studentId) return forbidden();
  try {
    const items = await listAssignments(studentId);
    return Response.json({ items });
  } catch (e) {
    console.error("[treinos]", e);
    // Demo local sem DATABASE_URL: devolve um treino mock completo (com blocos/GIFs).
    if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
      const w = workouts[0];
      const sid = studentId || "s-001";
      return Response.json({
        items: [
          {
            id: "a-demo-001",
            workoutId: w.id,
            studentId: sid,
            status: "active",
            startDate: new Date().toISOString().slice(0, 10),
            workoutTitle: w.title,
            workout: w,
          },
        ],
      });
    }
    return Response.json({ error: { message: "Não foi possível ler as atribuições." } }, { status: 503 });
  }
}
