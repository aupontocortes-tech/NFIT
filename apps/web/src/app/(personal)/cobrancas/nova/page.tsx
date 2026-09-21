"use client";

import { Button, Card, Input, PageHeader, Select } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const inv = await api.createInvoice({
        studentId: form.studentId,
        description: form.description,
        amount: Number(form.amount),
        dueDate: form.dueDate,
      });
      toast("Cobrança criada");
      router.push(`/cobrancas/${inv.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Nova cobrança" />
      <Card className="max-w-lg">
        <form onSubmit={onSubmit} className="space-y-4">
          <Select
            label="Aluno"
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            required
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
            required
          />
          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <Input
            label="Vencimento"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            required
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
