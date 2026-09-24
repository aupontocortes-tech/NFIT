"use client";

import { Button, Card, Input, PageHeader, PhotoPicker, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function NovaAvaliacaoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    weightKg: "",
    bodyFatPercent: "",
    waist: "",
    chest: "",
    notes: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createAssessment(id, {
        date: form.date,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        bodyFatPercent: form.bodyFatPercent
          ? Number(form.bodyFatPercent)
          : undefined,
        measurements: {
          waist: form.waist ? Number(form.waist) : undefined,
          chest: form.chest ? Number(form.chest) : undefined,
        },
        notes: form.notes,
        photoUrls: photos,
      });
      toast("Avaliação salva");
      router.push(`/alunos/${id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Nova avaliação" />
      <Card className="max-w-2xl">
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Data"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <Input
            label="Peso (kg)"
            type="number"
            step="0.1"
            value={form.weightKg}
            onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
          />
          <Input
            label="% Gordura"
            type="number"
            step="0.1"
            value={form.bodyFatPercent}
            onChange={(e) =>
              setForm({ ...form, bodyFatPercent: e.target.value })
            }
          />
          <Input
            label="Cintura (cm)"
            type="number"
            value={form.waist}
            onChange={(e) => setForm({ ...form, waist: e.target.value })}
          />
          <Input
            label="Peito (cm)"
            type="number"
            value={form.chest}
            onChange={(e) => setForm({ ...form, chest: e.target.value })}
          />
          <Textarea
            label="Notas"
            className="sm:col-span-2"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-medium text-text">Fotos (opcional)</p>
            <PhotoPicker
              photos={photos}
              onUploaded={(url) => setPhotos((p) => [...p, url])}
              onRemove={(url) => setPhotos((p) => p.filter((x) => x !== url))}
              max={6}
            />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" loading={loading}>
              Salvar
            </Button>
            <Link href={`/alunos/${id}`}>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
