import { readPersonalAuth } from "@/lib/server/personal-auth";

export async function GET() {
  const auth = await readPersonalAuth().catch(() => null);
  return Response.json({ ready: Boolean(auth) });
}
