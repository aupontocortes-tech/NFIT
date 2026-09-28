import { neon } from "@neondatabase/serverless";
import { getStudent } from "@/lib/server/students";
import type { Invoice, InvoiceStatus } from "@/lib/mocks";

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL ausente");
  return neon(url);
}

let ready: Promise<void> | null = null;

function ensureTable() {
  ready ??= db()`
    CREATE TABLE IF NOT EXISTS nfit_invoices (
      id text PRIMARY KEY,
      student_id text NOT NULL,
      student_name text NOT NULL,
      description text NOT NULL,
      amount double precision NOT NULL,
      due_date text NOT NULL,
      status text NOT NULL,
      paid_at timestamptz
    )
  `.then(() => undefined);
  return ready;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function mapRow(row: Record<string, unknown>): Invoice {
  let status = String(row.status) as InvoiceStatus;
  if (status === "pending" && String(row.due_date) < today()) status = "overdue";
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    studentName: String(row.student_name),
    description: String(row.description),
    amount: { amount: Number(row.amount), currency: "BRL" },
    dueDate: String(row.due_date),
    status,
    paidAt: row.paid_at
      ? row.paid_at instanceof Date
        ? row.paid_at.toISOString()
        : String(row.paid_at)
      : undefined,
  };
}

export async function listInvoices(status?: string, studentId?: string): Promise<Invoice[]> {
  await ensureTable();
  const todayKey = today();
  await db()`
    UPDATE nfit_invoices
    SET status = ${"overdue"}
    WHERE status = ${"pending"} AND due_date < ${todayKey}
  `;
  const rows = await db()`
    SELECT id, student_id, student_name, description, amount, due_date, status, paid_at
    FROM nfit_invoices
    ORDER BY due_date DESC
  `;
  let items = (rows as Record<string, unknown>[]).map(mapRow);
  if (studentId) items = items.filter((i) => i.studentId === studentId);
  if (status) items = items.filter((i) => i.status === status);
  return items;
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  await ensureTable();
  const rows = await db()`
    SELECT id, student_id, student_name, description, amount, due_date, status, paid_at
    FROM nfit_invoices WHERE id = ${id} LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapRow(row) : null;
}

export async function createInvoice(input: {
  studentId: string;
  description: string;
  amount: number;
  dueDate: string;
}): Promise<Invoice> {
  await ensureTable();
  const student = await getStudent(input.studentId);
  if (!student) throw new Error("Aluno não encontrado");
  const id = crypto.randomUUID();
  await db()`
    INSERT INTO nfit_invoices (id, student_id, student_name, description, amount, due_date, status)
    VALUES (
      ${id}, ${student.id}, ${student.name}, ${input.description}, ${input.amount}, ${input.dueDate}, ${"pending"}
    )
  `;
  return (await getInvoice(id))!;
}

export async function markInvoicePaid(id: string): Promise<Invoice | null> {
  await ensureTable();
  await db()`UPDATE nfit_invoices SET status = ${"paid"}, paid_at = now() WHERE id = ${id}`;
  return getInvoice(id);
}
