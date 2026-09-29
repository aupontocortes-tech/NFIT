import {
  AiNotConfiguredError,
  generateWorkout,
  type WorkoutInput,
} from "@/lib/server/ai-workout";
import { getOpenAiKey } from "@/lib/server/openai-key";
import { currentSession, requirePersonal } from "@/lib/server/guard";
import { workoutLevelLabel } from "@/lib/workout-level";

// Limite simples por IP para não estourar a cota grátis
const hits = new Map<string, number[]>();
const LIMIT = 10;
const WINDOW_MS = 60_000;

function rateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  return list.length > LIMIT;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return Response.json(
      { error: { code: "RATE_LIMITED", message: "Muitos pedidos. Aguarde 1 minuto." } },
      { status: 429 },
    );
  }
  const denied = requirePersonal(await currentSession(request));
  if (denied) return denied;

  let body: Partial<WorkoutInput>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { code: "BAD_REQUEST", message: "JSON inválido" } }, { status: 400 });
  }

  const input: WorkoutInput = {
    goal: String(body.goal ?? "").slice(0, 60) || "Condicionamento",
    level: String(workoutLevelLabel(body.level)).slice(0, 30),
    daysPerWeek: Math.min(7, Math.max(1, Number(body.daysPerWeek) || 3)),
    sessionMinutes: Math.min(180, Math.max(15, Number(body.sessionMinutes) || 60)),
    equipment: body.equipment ? String(body.equipment).slice(0, 120) : undefined,
    constraints: body.constraints ? String(body.constraints).slice(0, 300) : undefined,
    prompt: body.prompt ? String(body.prompt).slice(0, 500) : undefined,
    studentName: body.studentName ? String(body.studentName).slice(0, 80) : undefined,
    assessment: body.assessment ? String(body.assessment).slice(0, 2000) : undefined,
  };

  try {
    const saved = await getOpenAiKey().catch(() => null);
    const { provider, workout } = await generateWorkout(input, saved ?? undefined);
    return Response.json({ provider, workout });
  } catch (e) {
    if (e instanceof AiNotConfiguredError) {
      return Response.json(
        { error: { code: "AI_NOT_CONFIGURED", message: "Coloque a chave da OpenAI em OPENAI_API_KEY." } },
        { status: 501 },
      );
    }
    console.error("[ia/treino]", e);
    return Response.json(
      { error: { code: "AI_FAILED", message: "A IA não conseguiu gerar agora. Tente de novo." } },
      { status: 502 },
    );
  }
}
