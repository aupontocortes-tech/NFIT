"use client";

import { Avatar, Button, Card, PageHeader } from "@/components/ui";
import { PhotoPicker } from "@/components/ui/PhotoPicker";
import { AppearancePicker } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { Student } from "@/lib/mocks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AlunoPerfilPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [photo, setPhoto] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("nfit_aluno_id");
    if (!id) return;
    api.getStudent(id).then((s) => {
      setStudent(s);
      setPhoto(s.avatarUrl ? [s.avatarUrl] : []);
    }).catch(() => setStudent(null));
  }, []);

  async function save() {
    if (!student) return;
    setSaving(true);
    try {
      const updated = await api.patchStudent(student.id, { avatarUrl: photo[0] ?? null });
      setStudent(updated);
      toast("Foto salva");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível salvar a foto", "error");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await api.logout();
    toast("Sessão encerrada", "info");
    router.push("/login");
  }

  return (
    <div>
      <PageHeader title="Perfil" description={student?.name} />
      <div className="mb-6 flex justify-center">
        <Avatar name={student?.name ?? ""} src={photo[0]} size="lg" />
      </div>
      <Card className="mb-4 space-y-2">
        <p className="font-medium">{student?.name || "Seu cadastro"}</p>
        {student?.email ? <p className="text-sm text-text-muted">{student.email}</p> : null}
        {student?.phone ? <p className="text-sm text-text-muted">{student.phone}</p> : null}
        {student?.notes ? <p className="text-sm">{student.notes}</p> : null}
      </Card>
      <Card className="mb-4 space-y-4">
        <p className="text-sm text-text-muted">A foto é opcional. Pode tirar agora ou escolher uma que já tem.</p>
        <PhotoPicker
          photos={photo}
          max={1}
          chooseSource
          showFileHint={false}
          onUploaded={(url) => setPhoto([url])}
          onRemove={() => setPhoto([])}
        />
        <Button onClick={save} loading={saving} disabled={!student}>
          Salvar foto
        </Button>
      </Card>
      <Card className="mb-4 space-y-3">
        <div>
          <p className="text-sm font-semibold">Aparência</p>
          <p className="text-caption">Escolha o modo claro ou o modo escuro.</p>
        </div>
        <AppearancePicker />
      </Card>
      <Card className="space-y-3">
        <Link href="/aluno/pagamentos" className="block text-sm text-brand">
          Pagamentos
        </Link>
        <Button variant="danger" onClick={logout}>
          Sair
        </Button>
      </Card>
    </div>
  );
}
