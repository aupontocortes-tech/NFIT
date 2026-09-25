"use client";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Empty,
  PageHeader,
  Skeleton,
  TabPanel,
  Tabs,
} from "@/components/ui";
import { api } from "@/lib/api";
import type { Assessment, Assignment, Invoice, Student } from "@/lib/mocks";
import { formatDate, formatMoney } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const statusTone = {
  active: "active",
  paused: "paused",
  invite_pending: "invite",
} as const;

export default function AlunoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [tab, setTab] = useState("overview");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  useEffect(() => {
    api.getStudent(id).then(setStudent).catch(() => setStudent(null));
    api.listAssignments({ studentId: id }).then(setAssignments);
    api.listInvoices().then((r) =>
      setInvoices(r.items.filter((i) => i.studentId === id)),
    );
    api.listAssessments(id).then((r) => setAssessments(r.items));
  }, [id]);

  if (!student) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={student.name}
        description={student.email}
        action={
          <>
            <Link href={`/alunos/${id}/editar`}>
              <Button variant="secondary" size="sm">
                Editar
              </Button>
            </Link>
            <Link href={`/chat/${id}`}>
              <Button size="sm">Chat</Button>
            </Link>
          </>
        }
      />
      <div className="mb-4 flex items-center gap-4">
        <Avatar name={student.name} size="lg" />
        <div className="space-y-1">
          <Badge tone={statusTone[student.status]} />
          <p className="text-caption">
            Desde {formatDate(student.createdAt)} ·{" "}
            {student.activeWorkoutCount ?? 0} treinos ativos
          </p>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Visão geral" },
          { id: "treinos", label: "Treinos" },
          { id: "cobrancas", label: "Cobranças" },
          { id: "avaliacoes", label: "Avaliações" },
        ]}
      />

      <TabPanel when="overview" active={tab}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-caption">Treinos ativos</p>
            <p className="text-2xl font-bold tabular-nums">
              {student.activeWorkoutCount ?? 0}
            </p>
          </Card>
          <Card>
            <p className="text-caption">Cobranças pendentes</p>
            <p className="text-2xl font-bold tabular-nums">
              {student.pendingInvoices ?? 0}
            </p>
          </Card>
          <Card>
            <p className="text-caption">Mensagens não lidas</p>
            <p className="text-2xl font-bold tabular-nums">
              {student.unreadMessages ?? 0}
            </p>
          </Card>
        </div>
        {student.phone ? (
          <p className="mt-4 text-body-sm">Telefone: {student.phone}</p>
        ) : null}
      </TabPanel>

      <TabPanel when="treinos" active={tab}>
        {assignments.length === 0 ? (
          <Empty title="Nenhum treino atribuído" />
        ) : (
          <ul className="space-y-2">
            {assignments.map((a) => (
              <li key={a.id}>
                <Card className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{a.workoutTitle}</p>
                    <p className="text-caption">Início {formatDate(a.startDate)}</p>
                  </div>
                  <Badge tone="active">{a.status}</Badge>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </TabPanel>

      <TabPanel when="cobrancas" active={tab}>
        {invoices.length === 0 ? (
          <Empty title="Sem cobranças" />
        ) : (
          <ul className="space-y-2">
            {invoices.map((inv) => (
              <li key={inv.id}>
                <Link href={`/cobrancas/${inv.id}`}>
                  <Card className="flex items-center justify-between hover:bg-hover">
                    <div>
                      <p className="font-medium">{inv.description}</p>
                      <p className="text-caption">
                        {formatMoney(inv.amount.amount)} · vence{" "}
                        {formatDate(inv.dueDate)}
                      </p>
                    </div>
                    <Badge tone={inv.status} />
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </TabPanel>

      <TabPanel when="avaliacoes" active={tab}>
        <div className="mb-3">
          <Link href={`/alunos/${id}/avaliacoes/nova`}>
            <Button size="sm">Nova avaliação</Button>
          </Link>
        </div>
        {assessments.length === 0 ? (
          <Empty title="Sem avaliações" />
        ) : (
          <ul className="space-y-2">
            {assessments.map((a) => (
              <li key={a.id}>
                <Card>
                  <p className="font-medium">{formatDate(a.date)}</p>
                  <p className="text-caption tabular-nums">
                    Peso: {a.weightKg ?? "—"} kg
                    {a.bodyFatPercent != null
                      ? ` · Gordura: ${a.bodyFatPercent}%`
                      : ""}
                  </p>
                  {a.notes ? <p className="mt-1 text-sm">{a.notes}</p> : null}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </TabPanel>
    </div>
  );
}
