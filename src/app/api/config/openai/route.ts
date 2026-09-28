import { getOpenAiKey, saveOpenAiKey } from "@/lib/server/openai-key";
import { currentSession, requirePersonal } from "@/lib/server/guard";

export async function GET(request: Request) {
  const denied = requirePersonal(await currentSession(request));
  if (denied) return denied;
  try {
    const saved = await getOpenAiKey();
    return Response.json({ configured: Boolean(process.env.OPENAI_API_KEY || saved) });
  } catch (e) {
    console.error("[openai-key]", e);
    return Response.json({ configured: Boolean(process.env.OPENAI_API_KEY) });
  }
}

export async function PUT(request: Request) {
  const denied = requirePersonal(await currentSession(request));
  if (denied) return denied;
  let body: { key?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  const key = String(body.key ?? "").trim();
  if (!key.startsWith("sk-") || key.length < 20) {
    return Response.json(
      { error: { message: "Cole a chave da OpenAI. Ela começa com sk-." } },
      { status: 400 },
    );
  }
  try {
    await saveOpenAiKey(key);
    return Response.json({ configured: true });
  } catch (e) {
    console.error("[openai-key]", e);
    return Response.json(
      { error: { message: "Não foi possível guardar a chave." } },
      { status: 503 },
    );
  }
}
