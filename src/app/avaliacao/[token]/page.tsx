"use client";

import { AppName } from "@/components/ui/AppName";
import { Button, Card, Input, PhotoPicker, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [form, setForm] = useState({ weightKg: "", waist: "", hip: "", notes: "" });

  useEffect(() => {
    fetch(`/api/avaliacao/${token}`)
      .then(async (r) => {
        if (!r.ok) {
          setMissing(true);
          return;
        }
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
          weightKg: Number(form.weightKg.replace(",", ".")),
          waistCm: form.waist ? Number(form.waist.replace(",", ".")) : undefined,
          hipCm: form.hip ? Number(form.hip.replace(",", ".")) : undefined,
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
    <div className="mx-auto min-h-dvh max-w-lg px-4 py-8">
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
              Tire 4 fotos no mesmo lugar, com a mesma roupa e a mesma luz: frente, lado direito, lado esquerdo e costas.
            </p>
          </div>
          <Card className="space-y-4">
            <Input
              label="Peso (kg)"
              inputMode="decimal"
              value={form.weightKg}
              onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
              required
            />
            <Input
              label="Cintura (cm)"
              inputMode="decimal"
              value={form.waist}
              onChange={(e) => setForm({ ...form, waist: e.target.value })}
            />
            <Input
              label="Quadril (cm)"
              inputMode="decimal"
              value={form.hip}
              onChange={(e) => setForm({ ...form, hip: e.target.value })}
            />
            <Textarea
              label="Como você está se sentindo"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Card>
          <Card className="space-y-4">
            <div>
              <p className="text-base font-semibold">Frente</p>
              <PhotoPicker photos={front} onUploaded={(url) => setFront([url])} onRemove={() => setFront([])} max={1} label="Foto de frente" />
            </div>
            <div>
              <p className="text-base font-semibold">Lado direito</p>
              <PhotoPicker photos={sideRight} onUploaded={(url) => setSideRight([url])} onRemove={() => setSideRight([])} max={1} label="Foto do lado direito" />
            </div>
            <div>
              <p className="text-base font-semibold">Lado esquerdo</p>
              <PhotoPicker photos={sideLeft} onUploaded={(url) => setSideLeft([url])} onRemove={() => setSideLeft([])} max={1} label="Foto do lado esquerdo" />
            </div>
            <div>
              <p className="text-base font-semibold">Costas</p>
              <PhotoPicker photos={back} onUploaded={(url) => setBack([url])} onRemove={() => setBack([])} max={1} label="Foto de costas" />
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
