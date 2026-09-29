"use client";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Empty,
  Input,
  PageHeader,
  Skeleton,
  TabPanel,
  Tabs,
} from "@/components/ui";
import { AssessmentCompare } from "@/components/assessments/AssessmentCompare";
import { StudentWorkoutList } from "@/components/workouts/StudentWorkoutList";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { Assessment, Assignment, Invoice, Student } from "@/lib/mocks";
import { formatDate, formatMoney } from "@/lib/utils";
import { Link2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function toDateTimeLocal(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function assessmentDate(iso: string) {
  const raw = iso.length === 10 ? `${iso}T12:00:00` : iso;
  return formatDate(raw);
}

const statusTone = {
  active: "active",
  paused: "paused",
  invite_pending: "invite",
} as const;

export default function AlunoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [tab, setTab] = useState(() => {
    const aba = search.get("aba");
    if (aba === "treinos" || aba === "avaliacoes" || aba === "cobrancas") return aba;
    return "overview";
  });
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [nextAt, setNextAt] = useState("");
  const [issuedCode, setIssuedCode] = useState("");
  const [eraseCode, setEraseCode] = useState("");
  const [erasing, setErasing] = useState(false);
  const [appUrl, setAppUrl] = useState("");

  useEffect(() => {
    api.getStudent(id).then((s) => {
      setStudent(s);
      setNextAt(toDateTimeLocal(s.nextAssessmentAt));
    }).catch(() => setStudent(null));
    api.listAssignments({ studentId: id }).then(setAssignments);
    api.listInvoices().then((r) =>
      setInvoices(r.items.filter((i) => i.studentId === id)),
    );
    api.listAssessments(id).then((r) => setAssessments(r.items));
  }, [id]);

  async function issueCode() {
    const res = await fetch(`/api/alunos/${id}/apagar`, { method: "POST" });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.code) {
      toast("Não foi possível gerar o código", "error");
      return false;
    }
    setIssuedCode(data.code);
    setEraseCode("");
    return true;
  }

  async function loadAppLink() {
    const res = await fetch(`/api/alunos/${id}/link`, { method: "POST" });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.token) {
      toast("Não foi possível criar o link do aplicativo", "error");
      return;
    }
    setAppUrl(`${window.location.origin}/entrar/${data.token}`);
  }

  const activeWorkouts = assignments.filter((item) => item.status === "active").length;

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
            {activeWorkouts} treinos ativos
          </p>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={(next) => {
          setTab(next);
          if (next === "apagar") void issueCode();
          if (next === "app") void loadAppLink();
        }}
        tabs={[
          { id: "overview", label: "Visão geral" },
          { id: "treinos", label: "Treinos" },
          { id: "cobrancas", label: "Cobranças" },
          { id: "avaliacoes", label: "Avaliações" },
          { id: "apagar", label: "Excluir", tone: "danger" },
          { id: "app", label: "App", tone: "link" },
        ]}
      />

      <TabPanel when="overview" active={tab}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-caption">Treinos ativos</p>
            <p className="text-2xl font-bold tabular-nums">
              {activeWorkouts}
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
        <StudentWorkoutList
          items={assignments}
          onDeleted={(assignmentId) =>
            setAssignments((current) => current.filter((item) => item.id !== assignmentId))
          }
        />
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
        <Card className="mb-4 max-w-lg space-y-3">
          <div>
            <p className="text-sm font-semibold">Próxima avaliação</p>
            <p className="text-caption">Quando chegar esse horário, o aplicativo do aluno avisa.</p>
          </div>
          <Input
            label="Data e hora"
            type="datetime-local"
            value={nextAt}
            onChange={(e) => setNextAt(e.target.value)}
          />
          <Button
            size="sm"
            onClick={async () => {
              try {
                const updated = await api.patchStudent(id, {
                  nextAssessmentAt: nextAt ? new Date(nextAt).toISOString() : null,
                });
                setStudent(updated);
                toast("Prazo da próxima avaliação salvo");
              } catch {
                toast("Não foi possível salvar o prazo", "error");
              }
            }}
          >
            Salvar prazo
          </Button>
        </Card>
        <div className="mb-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={async () => {
              const res = await fetch(`/api/alunos/${id}/link`, { method: "POST" });
              const data = await res.json().catch(() => null);
              if (!res.ok || !data?.url) {
                toast("Não foi possível criar o link", "error");
                return;
              }
              await navigator.clipboard.writeText(data.url);
              toast("Link da avaliação copiado. O aluno já precisa estar cadastrado.");
            }}
          >
            <Link2 className="h-4 w-4" />
            Copiar link da avaliação
          </Button>
          <Link href={`/alunos/${id}/avaliacoes/nova`}>
            <Button size="sm" variant="secondary">
              Nova avaliação
            </Button>
          </Link>
        </div>
        <p className="mb-3 text-caption">
          Este link é de quem já está cadastrado. O link de cadastro fica na lista de alunos.
        </p>
        {assessments.length === 0 ? (
          <Empty title="Nenhuma avaliação enviada" description="Copie o link e mande para a cliente preencher." />
        ) : (
          <>
            <AssessmentCompare items={assessments} />
            <ul className="space-y-2">
            {assessments.map((a) => (
              <li key={a.id}>
                <Card>
                  <p className="font-medium">{assessmentDate(a.date)}</p>
                  <p className="text-caption tabular-nums">
                    {a.bmi != null ? `IMC ${a.bmi.toLocaleString("pt-BR")} ${a.bmiLabel ?? ""}` : `Peso: ${a.weightKg ?? "—"} kg`}
                    {a.whr != null ? ` · RCQ ${a.whr.toLocaleString("pt-BR")} ${a.whrLabel ?? ""}` : ""}
                    {a.bodyFatPercent != null ? ` · Gordura ${a.bodyFatPercent.toLocaleString("pt-BR")}%` : ""}
                    {a.leanMassKg != null ? ` · Massa magra ${a.leanMassKg.toLocaleString("pt-BR")} kg` : ""}
                  </p>
                  {a.notes ? <p className="mt-1 text-sm">{a.notes}</p> : null}
                  {a.measurements.bicepsRight != null ||
                  a.measurements.bicepsLeft != null ||
                  a.measurements.forearmRight != null ||
                  a.measurements.forearmLeft != null ||
                  a.measurements.thighRight != null ||
                  a.measurements.thighLeft != null ? (
                    <p className="mt-2 text-caption tabular-nums">
                      {[
                        a.measurements.bicepsRight != null || a.measurements.bicepsLeft != null
                          ? `Braço D ${a.measurements.bicepsRight ?? "—"} · E ${a.measurements.bicepsLeft ?? "—"} cm`
                          : null,
                        a.measurements.forearmRight != null || a.measurements.forearmLeft != null
                          ? `Antebraço D ${a.measurements.forearmRight ?? "—"} · E ${a.measurements.forearmLeft ?? "—"} cm`
                          : null,
                        a.measurements.thighRight != null || a.measurements.thighLeft != null
                          ? `Coxa D ${a.measurements.thighRight ?? "—"} · E ${a.measurements.thighLeft ?? "—"} cm`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                  {a.photoUrls.length > 0 ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {a.photoUrls.map((url) => (
                        <img
                          key={url}
                          src={url}
                          alt="Foto da avaliação"
                          className="aspect-[3/4] w-full rounded-[var(--radius-md)] object-cover"
                        />
                      ))}
                    </div>
                  ) : null}
                </Card>
              </li>
            ))}
            </ul>
          </>
        )}
      </TabPanel>
      <TabPanel when="apagar" active={tab}>
        <Card className="max-w-lg space-y-3 border-error">
          <div>
            <p className="text-sm font-semibold">Excluir este aluno</p>
            <p className="text-caption">
              Some da lista, junto com treinos, avaliação, agenda e mensagens deste cadastro. Copie o código e cole para confirmar.
            </p>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2">
            <p className="font-mono text-base font-semibold tracking-wider">{issuedCode || "…"}</p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={!issuedCode}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(issuedCode);
                  toast("Código copiado. Cole no campo abaixo.");
                } catch {
                  toast("Selecione o código e copie.", "error");
                }
              }}
            >
              Copiar
            </Button>
          </div>
          <Input
            label="Cole o código aqui"
            value={eraseCode}
            onChange={(e) => setEraseCode(e.target.value)}
            autoComplete="off"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="danger"
              loading={erasing}
              disabled={!issuedCode || eraseCode.trim().toUpperCase() !== issuedCode}
              onClick={async () => {
                setErasing(true);
                try {
                  const res = await fetch(`/api/alunos/${id}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: eraseCode.trim() }),
                  });
                  const data = await res.json().catch(() => null);
                  if (!res.ok) {
                    toast(data?.error?.message ?? "Não foi possível apagar o aluno", "error");
                    return;
                  }
                  toast("Aluno apagado");
                  router.push("/alunos");
                } finally {
                  setErasing(false);
                }
              }}
            >
              Confirmar e apagar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                const ok = await issueCode();
                if (ok) toast("Código novo. O anterior não vale mais.");
              }}
            >
              Gerar outro
            </Button>
          </div>
        </Card>
      </TabPanel>
      <TabPanel when="app" active={tab}>
        <Card className="max-w-lg space-y-3">
          <div>
            <p className="text-sm font-semibold">Aplicativo deste cliente</p>
            <p className="text-caption">
              Cada cliente tem o próprio link. Se ainda não baixou no celular, envie este. Abre só o aplicativo dele: treinos, avaliação, fotos e agenda. Depois ele entra com login e senha.
            </p>
          </div>
          <p className="break-all rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm">{appUrl || "Gerando o link…"}</p>
          <Button
            type="button"
            size="sm"
            disabled={!appUrl}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(appUrl);
                toast("Link do aplicativo copiado.");
              } catch {
                toast("Selecione o link e copie.", "error");
              }
            }}
          >
            Copiar link
          </Button>
        </Card>
      </TabPanel>
    </div>
  );
}
