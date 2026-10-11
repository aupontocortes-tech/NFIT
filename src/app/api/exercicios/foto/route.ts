import { photoIds } from "@/lib/exercise-photo";
import { currentSession, unauthorized } from "@/lib/server/guard";

export async function GET(request: Request) {
  if (!(await currentSession(request))) return unauthorized();
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";
  const frame = url.searchParams.get("frame") === "1" ? "1" : "0";
  if (!photoIds.has(id)) {
    return Response.json({ error: { message: "Exercício inválido" } }, { status: 400 });
  }
  try {
    const upstream = await fetch(
      `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${id}/${frame}.jpg`,
    );
    if (!upstream.ok) {
      return Response.json({ error: { message: "Foto não encontrada" } }, { status: 404 });
    }
    const bytes = await upstream.arrayBuffer();
    return new Response(bytes, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (e) {
    console.error("[exercicios-foto]", e);
    return Response.json({ error: { message: "Não foi possível abrir a foto." } }, { status: 503 });
  }
}
