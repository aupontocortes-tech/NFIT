import { sessionSetCookie } from "@/lib/session-cookie";

export async function POST() {
  return Response.json({ ok: true }, { headers: { "Set-Cookie": sessionSetCookie(null) } });
}
