import { hasAnyPersonal } from "@/lib/server/personal-auth";

export async function GET() {
  const ready = await hasAnyPersonal().catch(() => false);
  return Response.json({ ready });
}
