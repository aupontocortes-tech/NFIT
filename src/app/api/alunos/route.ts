import { createStudent, listStudents } from "@/lib/server/students";
import { hasErrors, validateStudent } from "@/lib/validators";

export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    const items = await listStudents({
      q: url.searchParams.get("q") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
    });
    return Response.json({ items });
  } catch (e) {
    console.error("[alunos]", e);
    return Response.json(
      { error: { message: "Não foi possível ler os alunos no banco." } },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
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

  try {
    const student = await createStudent({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || undefined,
      notes: body.notes?.trim() || undefined,
    });
    return Response.json(student, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (message.includes("nfit_students_email_key") || message.toLowerCase().includes("duplicate")) {
      return Response.json(
        { error: { message: "Já existe um aluno com esse e-mail." } },
        { status: 409 },
      );
    }
    console.error("[alunos]", e);
    return Response.json(
      { error: { message: "Não foi possível salvar o aluno." } },
      { status: 503 },
    );
  }
}
