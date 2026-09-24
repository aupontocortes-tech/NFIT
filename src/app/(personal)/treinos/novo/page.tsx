"use client";

import { Button, Card, Input, PageHeader, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NovoTreinoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    goal: "",
    notes: "",
    exerciseName: "",
    sets: "3",
    reps: "10",
  });

  async function save(status: "draft" | "template") {
    setLoading(true);
    try {
      const w = await api.createWorkout({
        title: form.title,
        goal: form.goal,
        notes: form.notes,
        status,
        blocks: [
          {
            name: "Bloco 1",
            order: 0,
            exercises: form.exerciseName
              ? [
                  {
                    name: form.exerciseName,
                    sets: Number(form.sets),
                    reps: form.reps,
                    order: 0,
                  },
                ]
              : [],
          },
        ],
      });
      toast(status === "draft" ? "Rascunho salvo" : "Template salvo");
      router.push(`/treinos/${w.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Novo treino" description="Criação manual" />
      <Card className="max-w-2xl space-y-4">
        <Input
          label="Nome"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <Input
          label="Objetivo"
          value={form.goal}
          onChange={(e) => setForm({ ...form, goal: e.target.value })}
          placeholder="Hipertrofia, emagrecimento…"
        />
        <Textarea
          label="Notas"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <div className="rounded-[var(--radius-md)] border border-border p-3">
          <p className="mb-2 text-sm font-medium">Primeiro exercício</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              label="Exercício"
              value={form.exerciseName}
              onChange={(e) =>
                setForm({ ...form, exerciseName: e.target.value })
              }
              className="sm:col-span-3"
            />
            <Input
              label="Séries"
              value={form.sets}
              onChange={(e) => setForm({ ...form, sets: e.target.value })}
            />
            <Input
              label="Reps"
              value={form.reps}
              onChange={(e) => setForm({ ...form, reps: e.target.value })}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            loading={loading}
            onClick={() => save("draft")}
            disabled={!form.title}
          >
            Salvar rascunho
          </Button>
          <Button
            variant="secondary"
            loading={loading}
            onClick={() => save("template")}
            disabled={!form.title}
          >
            Salvar template
          </Button>
          <Link href="/treinos">
            <Button variant="ghost">Cancelar</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
