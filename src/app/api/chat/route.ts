import { listConversations } from "@/lib/server/chat";
import { currentSession, requirePersonal } from "@/lib/server/guard";

export async function GET(request: Request) {
  const denied = requirePersonal(await currentSession(request));
  if (denied) return denied;
  try {
    const items = await listConversations();
    return Response.json({ items });
  } catch (e) {
    console.error("[chat]", e);
    return Response.json({ error: { message: "Não foi possível ler as conversas." } }, { status: 503 });
  }
}
