"use client";

import { Button, Card, Input, PageHeader, Select } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api";
import { hasErrors, parseMoneyBR, validateInvoice } from "@/lib/validators";
import type { Student } from "@/lib/mocks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NovaCobrancaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    description: "Mensalidade",
    amount: "350",
    dueDate: "",
  });

  useEffect(() => {
    api.listStudents().then((r) => setStudents(r.items));
  }, []);

  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validateInvoice(form) : {};

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors(validateInvoice(form))) return;
    setLoading(true);
    try {
      const inv = await api.createInvoice({
        studentId: form.studentId,
        description: form.description.trim(),
        amount: parseMoneyBR(form.amount),
        dueDate: form.dueDate,
      });
      toast("Cobrança criada");
      router.push(`/cobrancas/${inv.id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Não foi possível criar a cobrança", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Nova cobrança" />
      <Card className="max-w-lg">
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <Select
            label="Aluno"
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            error={errors.studentId}
          >
            <option value="">Selecione</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Input
            label="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            error={errors.description}
          />
          <Input
            label="Valor (R$)"
            inputMode="decimal"
            placeholder="350,00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            error={errors.amount}
          />
          <Input
            label="Vencimento"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            error={errors.dueDate}
          />
          <div className="flex gap-2">
            <Button type="submit" loading={loading}>
              Salvar
            </Button>
            <Link href="/cobrancas">
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
