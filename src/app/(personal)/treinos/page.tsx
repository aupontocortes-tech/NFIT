"use client";

import { StudentWorkoutList } from "@/components/workouts/StudentWorkoutList";
import { Button, Empty, PageHeader, Select, SkeletonList } from "@/components/ui";
import { api } from "@/lib/api";
import type { Assignment, Student } from "@/lib/mocks";
import { Dumbbell, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const studentKey = "nfit_treino_aluno";

export default function TreinosPage() {
  const search = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");
  const [items, setItems] = useState<Assignment[] | null>(null);

  useEffect(() => {
    const fromUrl = search.get("aluno") ?? "";
    const saved = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(studentKey) ?? "" : "";
    setStudentId(fromUrl || saved);
    api.listStudents({ status: "active" }).then((r) => setStudents(r.items)).catch(() => setStudents([]));
  }, [search]);

  useEffect(() => {
    if (!studentId) {
      setItems([]);
      return;
    }
    let alive = true;
    setItems(null);
    api
      .listAssignments({ studentId })
      .then((assigned) => alive && setItems(assigned))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, [studentId]);

  function choose(id: string) {
    setStudentId(id);
    if (id) sessionStorage.setItem(studentKey, id);
    else sessionStorage.removeItem(studentKey);
  }

  const query = studentId ? `?aluno=${encodeURIComponent(studentId)}` : "";

  return (
    <div>
      <PageHeader
        title="Treinos"
        description="Só aparecem os treinos do aluno escolhido."
        action={
          <>
            <Link href={`/treinos/gerar${query}`}>
              <Button variant="ai" size="sm">
                <Sparkles className="h-4 w-4" />
                Gerar com IA
              </Button>
            </Link>
            <Link href={`/treinos/novo${query}`}>
              <Button size="sm">Montar sem IA</Button>
            </Link>
          </>
        }
      />
      <div className="mb-4 max-w-md">
        <Select label="Aluno" value={studentId} onChange={(e) => choose(e.target.value)}>
          <option value="">Escolha o aluno</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </Select>
      </div>
      {!studentId ? (
        <Empty
          icon={Dumbbell}
          title="Escolha o aluno"
          description="A lista mostra só os treinos desse aluno. O GIF fica dentro de cada exercício."
        />
      ) : !items ? (
        <SkeletonList />
      ) : (
        <StudentWorkoutList
          items={items}
          onDeleted={(assignmentId) =>
            setItems((current) => (current ?? []).filter((item) => item.id !== assignmentId))
          }
        />
      )}
    </div>
  );
}
