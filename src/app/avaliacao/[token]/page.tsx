"use client";

import { PoseGuide } from "@/components/assessments/PoseGuide";
import { AppName } from "@/components/ui/AppName";
import { Button, Card, Input, Modal, PhotoPicker, Select, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { bmiLabel, whrLabel, type Sex } from "@/lib/body-metrics";
import { heightToCm, parseBrNumber } from "@/lib/br-number";
import { AppearancePicker } from "@/components/ui/ThemeToggle";
import { Settings } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function plainWeight(label: string) {
  if (label === "Abaixo do peso") return "Seu peso está um pouco abaixo do esperado para a sua altura.";
  if (label === "Peso normal") return "Seu peso está normal para a sua altura.";
  if (label === "Sobrepeso") return "Seu peso está um pouco acima do esperado para a sua altura.";
  return "Seu peso está acima do esperado para a sua altura.";
}

function plainWaist(label: string) {
  if (label === "Baixo") return "Sua cintura está baixa em relação ao quadril.";
  if (label === "Moderado") return "Sua cintura está no meio em relação ao quadril.";
  return "Sua cintura está alta em relação ao quadril.";
}

export default function AvaliacaoClientePage() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [name, setName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [missing, setMissing] = useState(false);
  const [sent, setSent] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [front, setFront] = useState<string[]>([]);
  const [sideRight, setSideRight] = useState<string[]>([]);
  const [sideLeft, setSideLeft] = useState<string[]>([]);
  const [back, setBack] = useState<string[]>([]);
  const [form, setForm] = useState({
    sex: "f" as Sex,
    age: "",
    heightCm: "",
    weightKg: "",
    chest: "",
    bicepsRight: "",
    bicepsLeft: "",
    forearmRight: "",
    forearmLeft: "",
    waist: "",
    abdomen: "",
    hip: "",
    thighRight: "",
    thighLeft: "",
    notes: "",
  });

  function num(value: string) {
    return parseBrNumber(value);
  }

  const preview = useMemo(() => {
    const age = num(form.age);
    const heightCm = heightToCm(form.heightCm);
    const weightKg = num(form.weightKg);
    const waist = num(form.waist);
    const hip = num(form.hip);
    if (age < 5 || age > 100 || heightCm < 100 || heightCm > 230 || weightKg < 20 || weightKg > 300) return null;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const waistLine = waist > 0 && hip > 0 ? plainWaist(whrLabel(form.sex, waist / hip)) : null;
    return { weightLine: plainWeight(bmiLabel(bmi)), waistLine };
  }, [form]);

  async function saveAvatar(url: string | null) {
    setAvatar(url ? [url] : []);
    const res = await fetch(`/api/avaliacao/${token}/foto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: url }),
    });
    if (!res.ok) toast("Não foi possível salvar a foto", "error");
  }

  useEffect(() => {
    setJustRegistered(new URLSearchParams(window.location.search).get("novo") === "1");
  }, []);

  useEffect(() => {
    const href = `/avaliacao/${token}/manifesto`;
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [token]);

  useEffect(() => {
    fetch(`/api/avaliacao/${token}`)
      .then(async (r) => {
        if (r.status === 404) {
          setMissing(true);
          return;
        }
        if (!r.ok) return;
        const data = await r.json();
        setName(data.name ?? "");
        setAvatar(data.avatarUrl ? [data.avatarUrl] : []);
      })
      .catch(() => setMissing(true));
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const photos = [...front, ...sideRight, ...sideLeft, ...back];
    setLoading(true);
    try {
      const res = await fetch(`/api/avaliacao/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sex: form.sex,
          age: num(form.age),
          heightCm: heightToCm(form.heightCm),
          weightKg: num(form.weightKg),
          chestCm: num(form.chest),
          bicepsRightCm: num(form.bicepsRight),
          bicepsLeftCm: num(form.bicepsLeft),
          forearmRightCm: num(form.forearmRight),
          forearmLeftCm: num(form.forearmLeft),
          waistCm: num(form.waist),
          abdomenCm: num(form.abdomen),
          hipCm: num(form.hip),
          thighRightCm: num(form.thighRight),
          thighLeftCm: num(form.thighLeft),
          notes: form.notes,
          photoUrls: photos,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast(data?.error?.message ?? "Não foi possível enviar", "error");
        return;
      }
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 py-8 pb-48">
      <div className="flex items-center justify-between gap-3">
        <AppName />
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Configurações"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
      {missing ? (
        <Card className="mt-8">
          <h1 className="text-title">Link inválido</h1>
          <p className="mt-2 text-body-sm text-text-muted">Peça um novo link para a sua personal.</p>
        </Card>
      ) : sent ? (
        <Card className="mt-8">
          <h1 className="text-title">Enviado</h1>
          <p className="mt-2 text-body-sm text-text-muted">
            Obrigada{name ? `, ${name}` : ""}. Sua personal já pode ver as medidas e as fotos.
          </p>
        </Card>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          {justRegistered ? (
            <Card>
              <p className="font-semibold">Cadastro salvo.</p>
              <p className="mt-1 text-sm text-text-muted">Agora preencha a avaliação. A sua personal já vê você na lista.</p>
            </Card>
          ) : null}
          <Card className="space-y-3">
            <p className="text-base font-semibold">Sua foto</p>
            <p className="text-sm text-text-muted">Opcional. Pode tirar agora ou escolher uma que já tem.</p>
            <PhotoPicker
              photos={avatar}
              max={1}
              chooseSource
              showFileHint={false}
              onUploaded={(url) => saveAvatar(url)}
              onRemove={() => saveAvatar(null)}
            />
          </Card>
          <div>
            <h1 className="text-title">Atualização do corpo</h1>
            <p className="mt-2 text-body-sm text-text-muted">
              {name ? `Oi, ${name}. ` : ""}
              Preencha as medidas e tire as quatro fotos no mesmo lugar, com a mesma luz.
            </p>
          </div>
          <Card className="space-y-4">
            <Select label="Você é" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value as Sex })}>
              <option value="f">Mulher</option>
              <option value="m">Homem</option>
            </Select>
            <Input label="Idade" inputMode="decimal" placeholder="27 ou 27,5" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
            <Input label="Altura" inputMode="decimal" placeholder="1,70 ou 170" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: e.target.value })} required />
            <Input label="Peso (kg)" inputMode="decimal" placeholder="62,5" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} required />
            <p className="text-base font-semibold">Medidas do corpo, em centímetros</p>
            <Input label="Peito" inputMode="decimal" value={form.chest} onChange={(e) => setForm({ ...form, chest: e.target.value })} required />
            <div className="space-y-3">
              <p className="text-sm font-semibold">Braço</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Direito" inputMode="decimal" value={form.bicepsRight} onChange={(e) => setForm({ ...form, bicepsRight: e.target.value })} required />
                <Input label="Esquerdo" inputMode="decimal" value={form.bicepsLeft} onChange={(e) => setForm({ ...form, bicepsLeft: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold">Antebraço</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Direito" inputMode="decimal" value={form.forearmRight} onChange={(e) => setForm({ ...form, forearmRight: e.target.value })} required />
                <Input label="Esquerdo" inputMode="decimal" value={form.forearmLeft} onChange={(e) => setForm({ ...form, forearmLeft: e.target.value })} required />
              </div>
            </div>
            <Input label="Cintura" inputMode="decimal" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} required />
            <Input label="Barriga" inputMode="decimal" value={form.abdomen} onChange={(e) => setForm({ ...form, abdomen: e.target.value })} required />
            <Input label="Quadril" inputMode="decimal" value={form.hip} onChange={(e) => setForm({ ...form, hip: e.target.value })} required />
            <div className="space-y-3">
              <p className="text-sm font-semibold">Coxa</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Direita" inputMode="decimal" value={form.thighRight} onChange={(e) => setForm({ ...form, thighRight: e.target.value })} required />
                <Input label="Esquerda" inputMode="decimal" value={form.thighLeft} onChange={(e) => setForm({ ...form, thighLeft: e.target.value })} required />
              </div>
            </div>
            <Textarea label="Como você está se sentindo" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Card>
          {preview ? (
            <Card>
              <p className="text-base font-semibold">Como você está</p>
              <p className="mt-2 text-body-sm">{preview.weightLine}</p>
              {preview.waistLine ? <p className="mt-1 text-body-sm text-text-muted">{preview.waistLine}</p> : null}
            </Card>
          ) : null}
          <Card className="space-y-5">
            <p className="text-body-sm text-text-muted">
              Tire as fotos de roupa de baixo, para o corpo aparecer bem: sunga, se você for homem, e biquíni, se você for mulher.
            </p>
            <div>
              <p className="mb-2 text-base font-semibold">Frente</p>
              <PoseGuide pose="front" sex={form.sex} />
              <PhotoPicker photos={front} onUploaded={(url) => setFront([url])} onRemove={() => setFront([])} max={1} showFileHint={false} chooseSource label="Tirar foto" />
            </div>
            <div>
              <p className="mb-2 text-base font-semibold">Lado direito</p>
              <PoseGuide pose="right" sex={form.sex} />
              <PhotoPicker photos={sideRight} onUploaded={(url) => setSideRight([url])} onRemove={() => setSideRight([])} max={1} showFileHint={false} chooseSource label="Tirar foto" />
            </div>
            <div>
              <p className="mb-2 text-base font-semibold">Lado esquerdo</p>
              <PoseGuide pose="left" sex={form.sex} />
              <PhotoPicker photos={sideLeft} onUploaded={(url) => setSideLeft([url])} onRemove={() => setSideLeft([])} max={1} showFileHint={false} chooseSource label="Tirar foto" />
            </div>
            <div>
              <p className="mb-2 text-base font-semibold">Costas</p>
              <PoseGuide pose="back" sex={form.sex} />
              <PhotoPicker photos={back} onUploaded={(url) => setBack([url])} onRemove={() => setBack([])} max={1} showFileHint={false} chooseSource label="Tirar foto" />
            </div>
          </Card>
          <Button type="submit" size="lg" loading={loading}>
            Enviar para a personal
          </Button>
        </form>
      )}
      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Configurações">
        <p className="mb-3 text-sm font-semibold">Aparência</p>
        <AppearancePicker />
      </Modal>
    </div>
  );
}
