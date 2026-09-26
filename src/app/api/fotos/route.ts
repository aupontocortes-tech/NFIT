import { savePhoto } from "@/lib/server/photos";

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: { message: "Envie a foto no formulário." } }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: { message: "Foto não encontrada." } }, { status: 400 });
  }
  if (!file.type.startsWith("image/") && file.type !== "") {
    return Response.json({ error: { message: "Envie apenas imagens." } }, { status: 400 });
  }
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const saved = await savePhoto(bytes, "image/jpeg");
    return Response.json(saved);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Não foi possível guardar a foto.";
    console.error("[fotos]", e);
    return Response.json({ error: { message } }, { status: 503 });
  }
}
