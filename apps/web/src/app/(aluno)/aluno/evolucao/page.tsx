"use client";

import { Button, Card, Empty, Input, PageHeader, PhotoPicker, Skeleton } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { LineChart } from "lucide-react";
import { useEffect, useState } from "react";

export default function EvolucaoPage() {
  const { toast } = useToast();
  const [data, setData] = useState<Awaited<
    ReturnType<typeof api.getStudentEvolution>
  > | null>(null);
  const [weight, setWeight] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);

  useEffect(() => {
    api.getStudentEvolution().then(setData);
  }, []);

  async function saveWeight() {
    const kg = Number(weight.replace(",", "."));
    if (!kg || kg < 20 || kg > 400) {
      toast("Informe um peso válido", "error");
      return;
    }
    setSavingWeight(true);
    try {
      await api.addWeight(kg);
      setData(await api.getStudentEvolution());
      toast("Peso registrado");
      setWeight("");
    } catch {
      toast("Não foi possível salvar o peso", "error");
    } finally {
      setSavingWeight(false);
    }
  }

  async function addPhoto(url: string) {
    const photo = await api.addEvolutionPhoto(url);
    setData((d) => (d ? { ...d, photos: [...d.photos, photo] } : d));
    toast("Foto adicionada");
  }

  async function removePhoto(url: string) {
    await api.removeEvolutionPhoto(url);
    setData((d) => (d ? { ...d, photos: d.photos.filter((p) => p.url !== url) } : d));
  }

  if (!data) return <Skeleton className="h-48 w-full" />;

  const max = Math.max(...data.weights.map((w) => w.weightKg), 1);
  const min = Math.min(...data.weights.map((w) => w.weightKg), max - 1);

  return (
    <div>
      <PageHeader title="Evolução" description="Peso e medidas ao longo do tempo" />
      {data.weights.length === 0 ? (
        <Empty icon={LineChart} title="Sem dados ainda" />
      ) : (
        <Card className="mb-6">
          <p className="mb-4 text-sm font-medium">Peso (kg)</p>
          <div className="flex h-40 items-end gap-3">
            {data.weights.map((w) => {
              const h =
                ((w.weightKg - min) / (max - min || 1)) * 80 + 20;
              return (
                <div
                  key={w.date}
                  className="flex h-full flex-1 flex-col items-center gap-1"
                >
                  <span className="text-caption tabular-nums">{w.weightKg}</span>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-brand"
                      style={{ height: `${Math.min(h, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-muted">
                    {formatDate(w.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <p className="mb-1 text-sm font-medium">Fotos de evolução</p>
        <p className="mb-3 text-caption">Tire de frente, lado e costas, sempre com a mesma luz.</p>
        <PhotoPicker
          photos={data.photos.map((p) => p.url)}
          onUploaded={addPhoto}
          onRemove={removePhoto}
          max={12}
        />
      </Card>

      <Card>
        <p className="mb-3 text-sm font-medium">Registrar peso rápido</p>
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.1"
            placeholder="kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="flex-1"
          />
          <Button onClick={saveWeight} disabled={!weight} loading={savingWeight}>
            Salvar
          </Button>
        </div>
      </Card>
    </div>
  );
}
