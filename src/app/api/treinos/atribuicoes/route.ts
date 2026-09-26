import { listAssignments } from "@/lib/server/workouts";

export async function GET(request: Request) {
  const studentId = new URL(request.url).searchParams.get("studentId") ?? undefined;
  try {
    const items = await listAssignments(studentId);
    return Response.json({ items });
  } catch (e) {
    console.error("[treinos]", e);
    return Response.json({ error: { message: "Não foi possível ler as atribuições." } }, { status: 503 });
  }
}
