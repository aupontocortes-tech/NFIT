import { getInvoice, markInvoicePaid } from "@/lib/server/invoices";
import { currentSession, requirePersonal, requireStudentAccess } from "@/lib/server/guard";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const invoice = await getInvoice(id);
    if (!invoice) return Response.json({ error: { message: "Cobrança não encontrada" } }, { status: 404 });
    const denied = requireStudentAccess(await currentSession(request), invoice.studentId);
    if (denied) return denied;
    return Response.json(invoice);
  } catch (e) {
    console.error("[cobrancas]", e);
    return Response.json({ error: { message: "Não foi possível abrir a cobrança." } }, { status: 503 });
  }
}

export async function POST(request: Request, ctx: Ctx) {
  const denied = requirePersonal(await currentSession(request));
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    const invoice = await markInvoicePaid(id);
    if (!invoice) return Response.json({ error: { message: "Cobrança não encontrada" } }, { status: 404 });
    return Response.json(invoice);
  } catch (e) {
    console.error("[cobrancas]", e);
    return Response.json({ error: { message: "Não foi possível marcar como paga." } }, { status: 503 });
  }
}
