"use client";

import { Card } from "@/components/ui";
import type { Assessment } from "@/lib/mocks";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

const POSES = ["Frente", "Lado direito", "Lado esquerdo", "Costas"] as const;

function when(a: Assessment) {
  const raw = a.date.length === 10 ? `${a.date}T12:00:00` : a.createdAt || a.date;
  return formatDate(raw);
}

function shown(n?: number) {
  if (n == null) return "—";
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

function change(current?: number, first?: number) {
  if (current == null || first == null) return "—";
  const d = Math.round((current - first) * 10) / 10;
  if (d === 0) return "0";
  const abs = Math.abs(d).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return `${d > 0 ? "+" : "−"}${abs}`;
}

export function AssessmentCompare({ items }: { items: Assessment[] }) {
  const [zoom, setZoom] = useState<{ url: string; label: string } | null>(null);
  const ordered = [...items].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const first = ordered[0];

  if (!first) return null;

  return (
    <Card className="mb-4 space-y-5">
      <div>
        <p className="font-medium">Comparar avaliações</p>
        <p className="mt-1 text-body-sm text-text-muted">
          {ordered.length < 2
            ? "As fotos de cada avaliação ficam uma ao lado da outra. A diferença aparece a partir da segunda."
            : "Da mais antiga para a mais recente. A coluna Dif. é a diferença em relação à primeira."}
        </p>
      </div>

      {ordered.length >= 2 ? (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="text-caption">
              <th className="py-2 pr-3 font-medium">Data</th>
              <th className="py-2 pr-3 font-medium">Peso</th>
              <th className="py-2 pr-3 font-medium">Dif.</th>
              <th className="py-2 pr-3 font-medium">Cintura</th>
              <th className="py-2 pr-3 font-medium">Dif.</th>
              <th className="py-2 pr-3 font-medium">Quadril</th>
              <th className="py-2 font-medium">Dif.</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((a) => (
              <tr key={a.id} className="border-t border-border tabular-nums">
                <td className="py-2 pr-3">{when(a)}</td>
                <td className="py-2 pr-3">{shown(a.weightKg)}</td>
                <td className="py-2 pr-3">{change(a.weightKg, first.weightKg)}</td>
                <td className="py-2 pr-3">{shown(a.measurements.waist)}</td>
                <td className="py-2 pr-3">{change(a.measurements.waist, first.measurements.waist)}</td>
                <td className="py-2 pr-3">{shown(a.measurements.hip)}</td>
                <td className="py-2">{change(a.measurements.hip, first.measurements.hip)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) : null}

      <div className="space-y-4">
        {POSES.map((label, index) => (
          <div key={label}>
            <p className="mb-2 text-sm font-semibold">{label}</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {ordered.map((a) => {
                const url = a.photoUrls[index];
                return (
                  <div key={a.id} className="w-28 shrink-0 sm:w-36">
                    {url ? (
                      <button
                        type="button"
                        className="block w-full"
                        onClick={() => setZoom({ url, label: `${label} · ${when(a)}` })}
                      >
                        <img
                          src={url}
                          alt={`${label} em ${when(a)}`}
                          className="aspect-[3/4] w-full rounded-[var(--radius-md)] object-cover"
                        />
                      </button>
                    ) : (
                      <div className="flex aspect-[3/4] w-full items-center justify-center rounded-[var(--radius-md)] border border-border bg-fill text-caption">
                        Sem foto
                      </div>
                    )}
                    <p className="mt-1 text-center text-caption">{when(a)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {zoom ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/80"
            aria-label="Fechar foto"
            onClick={() => setZoom(null)}
          />
          <div className="relative max-h-[90dvh] max-w-lg">
            <p className="mb-2 text-center text-sm text-white">{zoom.label}</p>
            <img src={zoom.url} alt={zoom.label} className="max-h-[80dvh] w-full rounded-[var(--radius-md)] object-contain" />
          </div>
        </div>
      ) : null}
    </Card>
  );
}
