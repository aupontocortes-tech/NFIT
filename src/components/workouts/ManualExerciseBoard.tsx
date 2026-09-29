"use client";

import { exerciseColor } from "@/lib/exercise-color";
import { exerciseVideoUrl } from "@/lib/vital-video";
import { Input } from "@/components/ui";
import { useEffect, useState } from "react";

export type ManualExercise = {
  key: string;
  name: string;
  demoId?: string;
  sets: string;
  reps: string;
  rest: string;
};

type Hit = {
  id: string;
  name: string;
  target: string;
  equipment: string;
  label?: string;
  media?: "gif" | "video";
};

export function ManualExerciseBoard({
  items,
  onChange,
}: {
  items: ManualExercise[];
  onChange: (items: ManualExercise[]) => void;
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);

  useEffect(() => {
    const text = q.trim();
    if (text.length < 2) {
      setHits([]);
      return;
    }
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ q: text });
      fetch(`/api/exercicios?${params}`)
        .then((response) => (response.ok ? response.json() : { items: [] }))
        .then((data) => setHits(data.items ?? []))
        .catch(() => setHits([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  function add(item: Hit) {
    const video = item.media === "video" || /^\d{4}$/.test(item.id);
    onChange([
      ...items,
      {
        key: crypto.randomUUID(),
        name: item.label ?? item.name,
        demoId: video ? `video:${item.id}` : item.id,
        sets: "3",
        reps: "10",
        rest: "60",
      },
    ]);
    setQ("");
    setHits([]);
  }

  function update(key: string, patch: Partial<ManualExercise>) {
    onChange(items.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  return (
    <div>
      <label className="text-sm font-semibold uppercase tracking-wide text-[#f97316]">Exercícios</label>
      <input
        value={q}
        onChange={(event) => setQ(event.target.value)}
        placeholder="Digite a primeira palavra, como mesa ou supino"
        className="mt-2 h-12 w-full rounded-[var(--radius-md)] border border-[#f97316] bg-surface px-3 text-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#f97316]"
      />
      {hits.length > 0 ? (
        <ul className="mt-3 grid max-h-[28rem] gap-2 overflow-y-auto sm:grid-cols-2">
          {hits.map((item, index) => {
            const video = item.media === "video" || /^\d{4}$/.test(item.id);
            const src = video ? exerciseVideoUrl(item.id) : `/api/exercicios/gif?id=${encodeURIComponent(item.id)}`;
            const color = exerciseColor(index);
            return (
              <li key={`${item.media ?? "gif"}-${item.id}-${item.label ?? item.name}`}>
                <button
                  type="button"
                  className="flex h-full w-full items-center gap-3 rounded-[var(--radius-md)] border border-l-4 bg-surface px-3 py-2 text-left hover:bg-hover"
                  style={{ borderColor: "#242424", borderLeftColor: color }}
                  onClick={() => add(item)}
                >
                  {video && src ? (
                    <video
                      src={src}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-20 w-20 shrink-0 rounded-[var(--radius-sm)] bg-white object-contain"
                    />
                  ) : src ? (
                    <img
                      src={src}
                      alt=""
                      className="h-20 w-20 shrink-0 rounded-[var(--radius-sm)] bg-white object-contain"
                    />
                  ) : null}
                  <span>
                    <span className="block text-base font-semibold" style={{ color }}>{item.label ?? item.name}</span>
                    <span className="block text-sm text-text-muted">
                      {item.target}
                      {item.equipment ? ` · ${item.equipment}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {items.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => {
            const color = exerciseColor(index);
            const videoId = item.demoId?.startsWith("video:") ? item.demoId.slice(6) : null;
            const gif = videoId ? null : item.demoId ? `/api/exercicios/gif?id=${encodeURIComponent(item.demoId)}` : null;
            const video = exerciseVideoUrl(videoId);
            return (
              <li
                key={item.key}
                className="rounded-[var(--radius-lg)] border bg-surface p-3"
                style={{ borderColor: color, backgroundColor: `${color}14` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-lg font-semibold" style={{ color }}>{item.name}</p>
                  <button
                    type="button"
                    className="text-sm font-semibold text-text-muted"
                    onClick={() => onChange(items.filter((current) => current.key !== item.key))}
                  >
                    Tirar
                  </button>
                </div>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
                  {video ? (
                    <video
                      src={video}
                      muted
                      loop
                      playsInline
                      className="aspect-square w-full max-w-[160px] rounded-[var(--radius-md)] bg-black object-contain"
                    />
                  ) : gif ? (
                    <img
                      src={gif}
                      alt={`Execução de ${item.name}`}
                      className="aspect-square w-full max-w-[160px] rounded-[var(--radius-md)] bg-white object-contain"
                    />
                  ) : null}
                  <div className="grid flex-1 grid-cols-3 gap-2">
                    <Input label="Séries" value={item.sets} onChange={(event) => update(item.key, { sets: event.target.value })} />
                    <Input label="Repetições" value={item.reps} onChange={(event) => update(item.key, { reps: event.target.value })} />
                    <Input label="Descanso (s)" value={item.rest} onChange={(event) => update(item.key, { rest: event.target.value })} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 rounded-[var(--radius-md)] border border-dashed border-[#f97316] px-3 py-6 text-center text-sm text-text-muted">
          Digite uma palavra e toque no exercício para colocar no treino.
        </p>
      )}
    </div>
  );
}
