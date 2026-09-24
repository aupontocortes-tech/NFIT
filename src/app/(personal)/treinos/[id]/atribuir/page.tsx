"use client";

import { Button, Card, Input, PageHeader } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { Student } from "@/lib/mocks";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AtribuirTreinoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listStudents({ status: "active" }).then((r) => setStudents(r.items));
  }, []);

  function toggle(sid: string) {
    setSelected((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid],
    );
  }

  async function confirm() {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      await api.createAssignments({
        workoutId: id,
        studentIds: selected,
        startDate,
      });
      toast("Treino atribuído");
      router.push(`/treinos/${id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Atribuir treino"
        description="Escolha alunos e data de início. Só publica após confirmar."
      />
      <Card className="max-w-lg space-y-4">
        <Input
          label="Data de início"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <div>
          <p className="mb-2 text-sm font-medium">Alunos</p>
          <ul className="space-y-2">
            {students.map((s) => (
              <li key={s.id}>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-border px-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(s.id)}
                    onChange={() => toggle(s.id)}
                  />
                  <span className="text-sm">{s.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={confirm}
            loading={loading}
            disabled={selected.length === 0}
          >
            Confirmar atribuição
          </Button>
          <Link href={`/treinos/${id}`}>
            <Button variant="secondary">Cancelar</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
