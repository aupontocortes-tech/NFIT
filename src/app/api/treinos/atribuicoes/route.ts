import { listAssignments } from "@/lib/server/workouts";
import { currentSession, forbidden, unauthorized } from "@/lib/server/guard";

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
    return Response.json({ error: { message: "Não foi possível ler as atribuições." } }, { status: 503 });
  }
}
