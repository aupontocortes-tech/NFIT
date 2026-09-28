import { readProfile, writeProfile, type StoredProfile } from "@/lib/server/profile";
import { currentSession, requirePersonal, unauthorized } from "@/lib/server/guard";

export async function GET(request: Request) {
  if (!await currentSession(request)) return unauthorized();
  try {
    const profile = await readProfile();
    return Response.json({ id: "personal", ...profile });
  } catch (e) {
    console.error("[perfil]", e);
    return Response.json({ error: { message: "Não foi possível ler o perfil." } }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const denied = requirePersonal(await currentSession(request));
  if (denied) return denied;
  let body: Partial<StoredProfile>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  try {
    const profile = await writeProfile(body);
    return Response.json({ id: "personal", ...profile });
  } catch (e) {
    console.error("[perfil]", e);
    return Response.json({ error: { message: "Não foi possível salvar o perfil." } }, { status: 503 });
  }
}
