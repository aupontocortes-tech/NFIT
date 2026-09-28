import { getOrCreateCheckinToken } from "@/lib/server/checkins";
import { createStudent, findStudentByEmail } from "@/lib/server/students";
import { clientIp, rateLimitResponse, tooFast } from "@/lib/server/rate-limit";
import { hasErrors, validateStudent } from "@/lib/validators";

export async function POST(request: Request) {
  if (tooFast(`convite:${clientIp(request)}`, 8)) return rateLimitResponse();
  let body: { name?: string; email?: string; phone?: string; notes?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }

  const form = {
    name: String(body.name ?? ""),
    email: String(body.email ?? ""),
    phone: String(body.phone ?? ""),
  };
  const errors = validateStudent(form);
  if (hasErrors(errors)) {
    return Response.json(
      { error: { message: Object.values(errors)[0] ?? "Dados inválidos", fields: errors } },
      { status: 400 },
    );
  }

  const email = form.email.trim().toLowerCase();
  let already = false;
  let student;
  try {
    student = await createStudent({
      name: form.name.trim(),
      email,
      phone: form.phone.trim() || undefined,
      notes: body.notes?.trim() || undefined,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    const duplicate =
      message.includes("nfit_students_email_key") || message.toLowerCase().includes("duplicate");
    if (!duplicate) {
      console.error("[convite]", e);
      return Response.json(
        { error: { message: "Não foi possível salvar o cadastro." } },
        { status: 503 },
      );
    }
    student = await findStudentByEmail(email);
    if (!student) {
      return Response.json(
        { error: { message: "Já existe um aluno com esse e-mail." } },
        { status: 409 },
      );
    }
    already = true;
  }

  try {
    const token = await getOrCreateCheckinToken(student.id);
    return Response.json(
      {
        id: student.id,
        name: student.name,
        already,
        evaluationPath: `/avaliacao/${token}?novo=1`,
      },
      { status: already ? 200 : 201 },
    );
  } catch (e) {
    console.error("[convite]", e);
    return Response.json(
      { error: { message: "Cadastro salvo, mas o link da avaliação falhou. Peça outro link para a personal." } },
      { status: 503 },
    );
  }
}
