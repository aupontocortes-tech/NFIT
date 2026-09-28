import {
  findPersonalByEmail,
  hasAnyPersonal,
  writePersonalAuth,
} from "@/lib/server/personal-auth";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { writeProfile } from "@/lib/server/profile";
import { studentAuthByEmail } from "@/lib/server/students";
import { clientIp, rateLimitResponse, tooFast } from "@/lib/server/rate-limit";
import { sessionSetCookie, signSession } from "@/lib/session-cookie";
import { isEmail, passwordProblem } from "@/lib/validators";

export async function POST(request: Request) {
  if (tooFast(`login:${clientIp(request)}`, 10)) return rateLimitResponse();
  let body: { email?: string; password?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!isEmail(email) || !password) {
    return Response.json({ error: { message: "Informe e-mail e senha." } }, { status: 400 });
  }

  if (body.role === "aluno") {
    const student = await studentAuthByEmail(email);
    if (!student?.passwordHash) {
      return Response.json(
        { error: { message: "Crie a senha pelo link que a personal enviou." } },
        { status: 401 },
      );
    }
    if (!(await verifyPassword(password, student.passwordHash))) {
      return Response.json({ error: { message: "E-mail ou senha não conferem." } }, { status: 401 });
    }
    const token = await signSession({ role: "aluno", studentId: student.id });
    return Response.json(
      { role: "aluno", id: student.id, name: student.name },
      { headers: { "Set-Cookie": sessionSetCookie(token) } },
    );
  }

  const account = await findPersonalByEmail(email);
  if (!account) {
    const any = await hasAnyPersonal();
    return Response.json(
      {
        error: {
          message: any
            ? "E-mail ou senha não conferem."
            : "Crie a senha da personal antes de entrar.",
        },
      },
      { status: any ? 401 : 409 },
    );
  }
  if (!(await verifyPassword(password, account.passwordHash))) {
    return Response.json({ error: { message: "E-mail ou senha não conferem." } }, { status: 401 });
  }
  await writeProfile({
    email: account.email,
    ...(account.name ? { name: account.name } : {}),
  });
  const token = await signSession({ role: "personal", email: account.email });
  return Response.json({ role: "personal" }, { headers: { "Set-Cookie": sessionSetCookie(token) } });
}

export async function PUT(request: Request) {
  if (tooFast(`setup:${clientIp(request)}`, 5)) return rateLimitResponse();
  if (await hasAnyPersonal()) {
    return Response.json({ error: { message: "A senha da personal já existe. Entre com ela." } }, { status: 409 });
  }
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const problem = passwordProblem(password);
  if (!isEmail(email) || problem) {
    return Response.json({ error: { message: problem || "E-mail inválido" } }, { status: 400 });
  }
  await writePersonalAuth(email, await hashPassword(password), body.name);
  const token = await signSession({ role: "personal", email });
  return Response.json({ role: "personal" }, { status: 201, headers: { "Set-Cookie": sessionSetCookie(token) } });
}
