import { addMessage, listMessages, markStudentMessagesRead } from "@/lib/server/chat";
import { currentSession, requireStudentAccess } from "@/lib/server/guard";

type Ctx = { params: Promise<{ alunoId: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const { alunoId } = await ctx.params;
  const session = await currentSession(request);
  const denied = requireStudentAccess(session, alunoId);
  if (denied) return denied;
  try {
    if (session?.role === "personal") await markStudentMessagesRead(alunoId);
    const items = await listMessages(alunoId);
    return Response.json({ items });
  } catch (e) {
    console.error("[chat]", e);
    return Response.json({ error: { message: "Não foi possível ler as mensagens." } }, { status: 503 });
  }
}

export async function POST(request: Request, ctx: Ctx) {
  const { alunoId } = await ctx.params;
  const session = await currentSession(request);
  const denied = requireStudentAccess(session, alunoId);
  if (denied) return denied;
  let body: { body?: string; senderId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  const text = body.body?.trim();
  if (!text) return Response.json({ error: { message: "Escreva a mensagem." } }, { status: 400 });
  try {
    const message = await addMessage(alunoId, session?.role === "aluno" ? alunoId : "personal", text);
    return Response.json(message, { status: 201 });
  } catch (e) {
    console.error("[chat]", e);
    return Response.json({ error: { message: "Não foi possível enviar." } }, { status: 503 });
  }
}
