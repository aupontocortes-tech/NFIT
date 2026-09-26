"use client";

import { Avatar, Card, Empty, PageHeader, SkeletonList } from "@/components/ui";
import { api } from "@/lib/api";
import type { Student } from "@/lib/mocks";
import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AvaliacoesPage() {
  const [students, setStudents] = useState<Student[] | null>(null);

  useEffect(() => {
    api.listStudents({ status: "active" }).then((r) => setStudents(r.items));
  }, []);

  return (
    <div>
      <PageHeader
        title="Avaliações"
        description="Selecione um aluno para ver ou criar avaliações"
      />
      {!students ? (
        <SkeletonList />
      ) : students.length === 0 ? (
        <Empty icon={ClipboardList} title="Nenhum aluno ativo" />
      ) : (
        <ul className="space-y-3">
          {students.map((s) => (
            <li key={s.id}>
              <Link href={`/alunos/${s.id}?aba=avaliacoes`}>
                <Card className="flex items-center gap-3 hover:bg-hover">
                  <Avatar name={s.name} />
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-caption">Ver avaliações no detalhe</p>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
