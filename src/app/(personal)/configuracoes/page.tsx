"use client";

import { Button, Card, Input, PageHeader, Select, Skeleton, Textarea } from "@/components/ui";
import { AppearancePicker } from "@/components/ui/ThemeToggle";
import { OpenAiKeyCard } from "@/components/settings/OpenAiKeyCard";
import { AnotherPersonalCard } from "@/components/settings/AnotherPersonalCard";
import { PasswordCard } from "@/components/settings/PasswordCard";
import { useToast } from "@/components/ui/Toast";
import { api, type PersonalProfile } from "@/lib/api";
import { resetProfile, setProfile } from "@/lib/profile";
import { detectPixKeyType } from "@/lib/pix";
import { LogOut, RotateCcw, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Form = {
  name: string;
  email: string;
  bio: string;
  studioName: string;
  timezone: string;
  emailPref: boolean;
  pushPref: boolean;
  pixKey: string;
  pixName: string;
  pixCity: string;
};

const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "Brasília (GMT-3)" },
  { value: "America/Manaus", label: "Manaus (GMT-4)" },
  { value: "America/Rio_Branco", label: "Rio Branco (GMT-5)" },
  { value: "America/Noronha", label: "Fernando de Noronha (GMT-2)" },
];

const BIO_MAX = 280;

function toForm(p: PersonalProfile): Form {
  return {
    name: p.name,
    email: p.email,
    bio: p.bio ?? "",
    studioName: p.studioName ?? "",
    timezone: p.timezone ?? "America/Sao_Paulo",
    emailPref: p.notificationPrefs?.email ?? true,
    pushPref: p.notificationPrefs?.push ?? true,
    pixKey: p.pix?.key ?? "",
    pixName: p.pix?.name ?? "",
    pixCity: p.pix?.city ?? "",
  };
}

const PIX_TYPE_LABEL = {
  cpf: "CPF",
  cnpj: "CNPJ",
  email: "E-mail",
  phone: "Celular",
  random: "Chave aleatória",
} as const;

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saved, setSaved] = useState<Form | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    api
      .getPersonalProfile()
      .then((p) => {
        const f = toForm(p);
        setSaved(f);
        setForm(f);
      })
      .catch(() => toast("Não foi possível carregar o perfil", "error"));
  }, [toast]);

  const dirty = useMemo(
    () => !!form && !!saved && JSON.stringify(form) !== JSON.stringify(saved),
    [form, saved],
  );

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!form) return e;
    if (form.name.trim().length < 2) e.name = "Informe seu nome (mínimo 2 letras)";
    if (form.bio.length > BIO_MAX) e.bio = `Máximo de ${BIO_MAX} caracteres`;
    const anyPix = form.pixKey || form.pixName || form.pixCity;
    if (anyPix) {
      if (!detectPixKeyType(form.pixKey)) e.pixKey = "Chave PIX inválida (CPF, CNPJ, e-mail, celular ou aleatória)";
      if (form.pixName.trim().length < 2) e.pixName = "Informe o nome de quem recebe";
      if (form.pixCity.trim().length < 2) e.pixCity = "Informe a cidade";
    }
    return e;
  }, [form]);
  const hasErrors = Object.keys(errors).length > 0;

  // Avisa antes de sair da página com alterações não salvas
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (ev: BeforeUnloadEvent) => ev.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form || !dirty || hasErrors) return;
    setSaving(true);
    try {
      const p = await api.updatePersonalProfile({
        name: form.name.trim(),
        bio: form.bio.trim(),
        studioName: form.studioName.trim(),
        timezone: form.timezone,
        notificationPrefs: { email: form.emailPref, push: form.pushPref },
        pix: form.pixKey.trim()
          ? { key: form.pixKey.trim(), name: form.pixName.trim(), city: form.pixCity.trim() }
          : null,
      });
      const f = toForm(p);
      setSaved(f);
      setForm(f);
      setProfile(p); // atualiza menu lateral e cabeçalho
      toast("Alterações salvas");
    } catch {
      toast("Não foi possível salvar. Tente de novo.", "error");
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    setForm(saved);
  }

  async function logout() {
    setLoggingOut(true);
    try {
      await api.logout();
      resetProfile();
      toast("Sessão encerrada", "info");
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  if (!form) {
    return (
      <div>
        <PageHeader title="Configurações" />
        <Card className="max-w-lg space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-24" />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Configurações" />
      <Card className="mb-4 max-w-lg space-y-3">
        <div>
          <h2 className="text-subtitle">Aparência</h2>
          <p className="text-caption">Escolha o modo claro ou o modo escuro.</p>
        </div>
        <AppearancePicker />
      </Card>
      <OpenAiKeyCard />
      <form onSubmit={save} className="max-w-lg space-y-4">
        <Card className="space-y-4">
          <h2 className="text-subtitle">Perfil</h2>
          <Input
            label="Nome"
            value={form.name}
            error={errors.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <Input
            label="E-mail"
            value={form.email}
            disabled
            helper="O e-mail não pode ser alterado por aqui."
          />
          <Input
            label="Nome do studio"
            value={form.studioName}
            onChange={(e) => update("studioName", e.target.value)}
          />
          <Textarea
            label="Bio"
            value={form.bio}
            error={errors.bio}
            helper={`${form.bio.length}/${BIO_MAX}`}
            onChange={(e) => update("bio", e.target.value)}
          />
          <Select
            label="Fuso horário"
            value={form.timezone}
            onChange={(e) => update("timezone", e.target.value)}
          >
            {TIMEZONES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-subtitle">Notificações</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--color-brand)]"
              checked={form.emailPref}
              onChange={(e) => update("emailPref", e.target.checked)}
            />
            Por e-mail
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--color-brand)]"
              checked={form.pushPref}
              onChange={(e) => update("pushPref", e.target.checked)}
            />
            Push no celular
          </label>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-subtitle">Recebimento por PIX</h2>
            <p className="text-caption">
              Grátis. O aluno paga pelo QR Code e o dinheiro cai direto na sua conta.
            </p>
          </div>
          <Input
            label="Chave PIX"
            placeholder="CPF, CNPJ, e-mail, celular ou chave aleatória"
            value={form.pixKey}
            error={errors.pixKey}
            helper={
              form.pixKey && detectPixKeyType(form.pixKey)
                ? `Tipo: ${PIX_TYPE_LABEL[detectPixKeyType(form.pixKey)!]}`
                : undefined
            }
            onChange={(e) => update("pixKey", e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nome de quem recebe"
              maxLength={25}
              value={form.pixName}
              error={errors.pixName}
              onChange={(e) => update("pixName", e.target.value)}
            />
            <Input
              label="Cidade"
              maxLength={15}
              value={form.pixCity}
              error={errors.pixCity}
              onChange={(e) => update("pixCity", e.target.value)}
            />
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={!dirty || hasErrors || saving}>
            <Save className="h-4 w-4" />
            {saving ? "Salvando…" : "Salvar alterações"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={discard}
            disabled={!dirty || saving}
          >
            <RotateCcw className="h-4 w-4" />
            Descartar
          </Button>
          {dirty ? (
            <span className="text-xs text-text-muted">Você tem alterações não salvas</span>
          ) : null}
        </div>
      </form>

      <PasswordCard />
      <AnotherPersonalCard />

      <Card className="mt-6 max-w-lg space-y-3">
        <h2 className="text-subtitle">Conta</h2>
        <Button variant="danger" onClick={logout} disabled={loggingOut}>
          <LogOut className="h-4 w-4" />
          {loggingOut ? "Saindo…" : "Sair"}
        </Button>
      </Card>
    </div>
  );
}
