import { createInvoice, listInvoices } from "@/lib/server/invoices";
import { currentSession, requirePersonal, unauthorized } from "@/lib/server/guard";
import { validateInvoice, hasErrors } from "@/lib/validators";

export async function GET(request: Request) {
  const session = await currentSession(request);
  if (!session) return unauthorized();
  const url = new URL(request.url);
  const asked = url.searchParams.get("studentId") ?? undefined;
  const studentId = session.role === "aluno" ? session.studentId : asked;
  try {
    const items = await listInvoices(
      url.searchParams.get("status") ?? undefined,
      studentId,
    );
    return Response.json({ items, page: 1, pageSize: 50, total: items.length });
  } catch (e) {
    console.error("[cobrancas]", e);
    return Response.json({ error: { message: "Não foi possível ler as cobranças." } }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const denied = requirePersonal(await currentSession(request));
  if (denied) return denied;
  let body: { studentId?: string; description?: string; amount?: number; dueDate?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  const errors = validateInvoice({
    studentId: String(body.studentId ?? ""),
    description: String(body.description ?? ""),
    amount: String(body.amount ?? ""),
    dueDate: String(body.dueDate ?? ""),
  });
  if (hasErrors(errors) || !body.studentId) {
    return Response.json({ error: { message: Object.values(errors)[0] ?? "Preencha aluno, valor e vencimento." } }, { status: 400 });
  }
  try {
    const invoice = await createInvoice({
      studentId: body.studentId,
      description: String(body.description),
      amount: Number(body.amount),
      dueDate: String(body.dueDate),
    });
    return Response.json(invoice, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Não foi possível criar a cobrança.";
    console.error("[cobrancas]", e);
    return Response.json({ error: { message } }, { status: 503 });
  }
}
