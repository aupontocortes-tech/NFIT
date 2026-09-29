import { currentSession, unauthorized } from "@/lib/server/guard";

export async function GET(request: Request) {
  if (!(await currentSession(request))) return unauthorized();
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(id)) {
    return Response.json({ error: { message: "Exercício inválido" } }, { status: 400 });
  }
  try {
    const upstream = await fetch(
      `https://raw.githubusercontent.com/mohamedatef90/exercise-library/main/gifs/${id}.gif`,
    );
    if (!upstream.ok) {
      return Response.json({ error: { message: "Demonstração não encontrada" } }, { status: 404 });
    }
    const bytes = await upstream.arrayBuffer();
    return new Response(bytes, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (e) {
    console.error("[exercicios]", e);
    return Response.json({ error: { message: "Não foi possível abrir a demonstração." } }, { status: 503 });
  }
}
