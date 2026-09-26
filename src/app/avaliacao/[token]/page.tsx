"use client";

import { PoseGuide } from "@/components/assessments/PoseGuide";
import { AppName } from "@/components/ui/AppName";
import { Button, Card, Input, PhotoPicker, Select, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { bodyMetrics, type Sex } from "@/lib/body-metrics";
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
  const [missing, setMissing] = useState(false);
  const [sent, setSent] = useState(false);
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
    biceps: "",
    forearm: "",
    waist: "",
    abdomen: "",
    hip: "",
    thigh: "",
    notes: "",
  });

  function num(value: string) {
    const n = Number(value.replace(",", "."));
    return Number.isFinite(n) ? n : Number.NaN;
  }

  const result = useMemo(() => {
    const input = {
      sex: form.sex,
      age: num(form.age),
      heightCm: num(form.heightCm),
      weightKg: num(form.weightKg),
      chestCm: num(form.chest),
      bicepsCm: num(form.biceps),
      forearmCm: num(form.forearm),
      waistCm: num(form.waist),
      abdomenCm: num(form.abdomen),
      hipCm: num(form.hip),
      thighCm: num(form.thigh),
    };
    if (Object.values(input).some((v) => typeof v === "number" && Number.isNaN(v))) return null;
    if (input.heightCm < 100 || input.weightKg <= 0 || input.waistCm <= 0 || input.hipCm <= 0) return null;
    return bodyMetrics(input);
  }, [form]);

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
          heightCm: num(form.heightCm),
          weightKg: num(form.weightKg),
          chestCm: num(form.chest),
          bicepsCm: num(form.biceps),
          forearmCm: num(form.forearm),
          waistCm: num(form.waist),
          abdomenCm: num(form.abdomen),
          hipCm: num(form.hip),
          thighCm: num(form.thigh),
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
      <AppName />
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
            <Input label="Idade" inputMode="numeric" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
            <Input label="Altura (cm)" inputMode="decimal" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: e.target.value })} required />
            <Input label="Peso (kg)" inputMode="decimal" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} required />
            <p className="text-base font-semibold">Medidas do corpo, em centímetros</p>
            <Input label="Peito" inputMode="decimal" value={form.chest} onChange={(e) => setForm({ ...form, chest: e.target.value })} required />
            <Input label="Braço" inputMode="decimal" value={form.biceps} onChange={(e) => setForm({ ...form, biceps: e.target.value })} required />
            <Input label="Antebraço" inputMode="decimal" value={form.forearm} onChange={(e) => setForm({ ...form, forearm: e.target.value })} required />
            <Input label="Cintura" inputMode="decimal" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} required />
            <Input label="Barriga" inputMode="decimal" value={form.abdomen} onChange={(e) => setForm({ ...form, abdomen: e.target.value })} required />
            <Input label="Quadril" inputMode="decimal" value={form.hip} onChange={(e) => setForm({ ...form, hip: e.target.value })} required />
            <Input label="Coxa" inputMode="decimal" value={form.thigh} onChange={(e) => setForm({ ...form, thigh: e.target.value })} required />
            <Textarea label="Como você está se sentindo" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Card>
          {result ? (
            <Card>
              <p className="text-base font-semibold">Como você está</p>
              <p className="mt-2 text-body-sm">{plainWeight(result.bmiLabel)}</p>
              <p className="mt-1 text-body-sm text-text-muted">{plainWaist(result.whrLabel)}</p>
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
    </div>
  );
}
