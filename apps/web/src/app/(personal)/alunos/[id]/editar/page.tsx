"use client";

import { Button, Card, Input, PageHeader, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditarAlunoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    notes: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getStudent(id).then((s) =>
      setForm({
        name: s.name,
        phone: s.phone ?? "",
        notes: s.notes ?? "",
        status: s.status === "invite_pending" ? "active" : s.status,
      }),
    );
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patchStudent(id, {
        name: form.name,
        phone: form.phone || undefined,
        notes: form.notes || undefined,
        status: form.status as "active" | "paused",
      });
      toast("Aluno atualizado");
      router.push(`/alunos/${id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Editar aluno" />
      <Card className="max-w-2xl">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Telefone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Status
            <select
              className="h-11 rounded-[var(--radius-md)] border border-border px-3"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Ativo</option>
              <option value="paused">Pausado</option>
            </select>
          </label>
          <Textarea
            label="Notas"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex gap-2">
            <Button type="submit" loading={loading}>
              Salvar
            </Button>
            <Link href={`/alunos/${id}`}>
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
