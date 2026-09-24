/** Validações de formulário (sem biblioteca, funcionam no navegador e no servidor). */

export type Errors<K extends string> = Partial<Record<K, string>>;

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** Aceita (11) 99999-9999, 11999999999, +55 11 99999-9999. Vazio é permitido. */
export function isPhoneBR(v: string) {
  if (!v.trim()) return true;
  const d = v.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  return /^[1-9]{2}9?\d{8}$/.test(d);
}

/** "350", "350,50", "1.234,56", "1234.56" → número. NaN se inválido. */
export function parseMoneyBR(v: string): number {
  const s = v.trim().replace(/\s|R\$/g, "");
  if (!s) return NaN;
  const normalized = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  return /^\d+(\.\d{1,2})?$/.test(normalized) ? Number(normalized) : NaN;
}

export function passwordProblem(p: string): string | null {
  if (p.length < 8) return "Mínimo 8 caracteres";
  if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) return "Use letras e números";
  return null;
}

export function validateStudent(f: { name: string; email: string; phone: string }) {
  const e: Errors<"name" | "email" | "phone"> = {};
  if (f.name.trim().length < 2) e.name = "Informe o nome do aluno";
  if (!isEmail(f.email)) e.email = "E-mail inválido";
  if (!isPhoneBR(f.phone)) e.phone = "Telefone inválido — use (11) 99999-9999";
  return e;
}

export function validateInvoice(
  f: { studentId: string; description: string; amount: string; dueDate: string },
  today = new Date().toISOString().slice(0, 10),
) {
  const e: Errors<"studentId" | "description" | "amount" | "dueDate"> = {};
  if (!f.studentId) e.studentId = "Selecione o aluno";
  if (f.description.trim().length < 3) e.description = "Descreva a cobrança";
  const amount = parseMoneyBR(f.amount);
  if (!Number.isFinite(amount) || amount <= 0) e.amount = "Valor inválido";
  else if (amount > 100000) e.amount = "Valor muito alto";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.dueDate)) e.dueDate = "Informe o vencimento";
  else if (f.dueDate < today) e.dueDate = "Vencimento não pode ser no passado";
  return e;
}

export function validateSignup(f: { name: string; email: string; password: string; confirm: string }) {
  const e: Errors<"name" | "email" | "password" | "confirm"> = {};
  if (f.name.trim().length < 2) e.name = "Informe seu nome";
  if (!isEmail(f.email)) e.email = "E-mail inválido";
  const pw = passwordProblem(f.password);
  if (pw) e.password = pw;
  if (f.confirm !== f.password) e.confirm = "As senhas não coincidem";
  return e;
}

export const hasErrors = (e: object) => Object.keys(e).length > 0;
