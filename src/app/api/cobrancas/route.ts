import { createInvoice, listInvoices } from "@/lib/server/invoices";

export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    const items = await listInvoices(
      url.searchParams.get("status") ?? undefined,
      url.searchParams.get("studentId") ?? undefined,
    );
    return Response.json({ items, page: 1, pageSize: 50, total: items.length });
  } catch (e) {
    console.error("[cobrancas]", e);
    return Response.json({ error: { message: "Não foi possível ler as cobranças." } }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let body: { studentId?: string; description?: string; amount?: number; dueDate?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }
  if (!body.studentId || !body.description || !body.dueDate || !body.amount) {
    return Response.json({ error: { message: "Preencha aluno, valor e vencimento." } }, { status: 400 });
  }
  try {
    const invoice = await createInvoice({
      studentId: body.studentId,
      description: body.description,
      amount: Number(body.amount),
      dueDate: body.dueDate,
    });
    return Response.json(invoice, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Não foi possível criar a cobrança.";
    console.error("[cobrancas]", e);
    return Response.json({ error: { message } }, { status: 503 });
  }
}
