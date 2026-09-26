import { deletePhoto, readPhoto } from "@/lib/server/photos";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const photo = await readPhoto(id);
    if (!photo) return new Response("Foto não encontrada", { status: 404 });
    return new Response(new Uint8Array(photo.bytes), {
      headers: {
        "Content-Type": photo.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error("[fotos]", e);
    return new Response("Não foi possível abrir a foto", { status: 503 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    await deletePhoto(id);
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error("[fotos]", e);
    return Response.json({ error: { message: "Não foi possível apagar a foto." } }, { status: 503 });
  }
}
