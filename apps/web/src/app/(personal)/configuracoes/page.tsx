"use client";

import { Button, Card, Input, PageHeader } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    studioName: "",
    timezone: "America/Sao_Paulo",
    emailPref: true,
    pushPref: true,
  });

  useEffect(() => {
    api.getPersonalProfile().then((p) =>
      setForm({
        name: p.name,
        email: p.email,
        bio: p.bio ?? "",
        studioName: p.studioName ?? "",
        timezone: p.timezone ?? "America/Sao_Paulo",
        emailPref: p.notificationPrefs?.email ?? true,
        pushPref: p.notificationPrefs?.push ?? true,
      }),
    );
  }, []);

  function save() {
    toast("Preferências salvas");
  }

  async function logout() {
    await api.logout();
    toast("Sessão encerrada", "info");
    router.push("/login");
  }

  return (
    <div>
      <PageHeader title="Configurações" />
      <Card className="mb-4 max-w-lg space-y-4">
        <h2 className="text-subtitle">Perfil</h2>
        <Input
          label="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input label="E-mail" value={form.email} disabled />
        <Input
          label="Nome do studio"
          value={form.studioName}
          onChange={(e) => setForm({ ...form, studioName: e.target.value })}
        />
        <Input
          label="Bio"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
        <Input label="Timezone" value={form.timezone} disabled />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.emailPref}
            onChange={(e) =>
              setForm({ ...form, emailPref: e.target.checked })
            }
          />
          Notificações por e-mail
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.pushPref}
            onChange={(e) => setForm({ ...form, pushPref: e.target.checked })}
          />
          Notificações push
        </label>
        <Button onClick={save}>Salvar</Button>
      </Card>
      <Card className="max-w-lg space-y-3">
        <h2 className="text-subtitle">Atalhos</h2>
        <Link href="/chat" className="block text-sm text-brand">
          Chat / mensagens
        </Link>
        <Link href="/cobrancas" className="block text-sm text-brand">
          Cobranças
        </Link>
        <Link href="/avaliacoes" className="block text-sm text-brand">
          Avaliações
        </Link>
        <Button variant="danger" onClick={logout}>
          Sair
        </Button>
      </Card>
    </div>
  );
}
