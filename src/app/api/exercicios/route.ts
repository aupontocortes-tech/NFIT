import { currentSession, unauthorized } from "@/lib/server/guard";
import { searchExercises } from "@/lib/server/exercise-library";

export async function GET(request: Request) {
  const session = await currentSession(request);
  if (!session) return unauthorized();
  const q = new URL(request.url).searchParams.get("q") ?? "";
  return Response.json({ items: searchExercises(q) });
}
