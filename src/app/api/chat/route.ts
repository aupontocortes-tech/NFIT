import { listConversations } from "@/lib/server/chat";

export async function GET() {
  try {
    const items = await listConversations();
    return Response.json({ items });
  } catch (e) {
    console.error("[chat]", e);
    return Response.json({ error: { message: "Não foi possível ler as conversas." } }, { status: 503 });
  }
}
