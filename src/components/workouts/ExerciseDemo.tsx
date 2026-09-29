"use client";

import { exerciseGifUrl } from "@/lib/exercise-gif";
import { exerciseVideoUrl, resolveExerciseMedia, type ExerciseMedia } from "@/lib/vital-video";
import { useEffect, useRef, useState } from "react";

type Hit = { id: string; name: string; target: string; equipment: string; label?: string };

export function ExerciseGif({
  demoId,
  name,
  large,
}: {
  demoId?: string | null;
  name: string;
  large?: boolean;
}) {
  const local = demoId ? `/api/exercicios/gif?id=${encodeURIComponent(demoId)}` : null;
  if (!local) return null;
  return (
    <img
      src={local}
      alt={`Execução de ${name}`}
      className={
        large
          ? "mt-3 block aspect-square w-full rounded-[var(--radius-md)] border border-border bg-white object-contain"
          : "block aspect-square w-full max-w-[240px] shrink-0 rounded-[var(--radius-md)] border border-border bg-white object-contain"
      }
    />
  );
}

export function ExerciseClip({
  videoId,
  name,
  large,
}: {
  videoId?: string | null;
  name: string;
  large?: boolean;
}) {
  const src = exerciseVideoUrl(videoId);
  const [playing, setPlaying] = useState(false);
  const touch = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function play() {
    const clip = videoRef.current;
    if (!clip) return;
    setPlaying(true);
    void clip.play().catch(() => setPlaying(false));
  }

  function stop() {
    const clip = videoRef.current;
    if (!clip) return;
    clip.pause();
    clip.currentTime = 0;
    setPlaying(false);
  }

  if (!src) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={playing}
      aria-label={playing ? `Parar vídeo de ${name}` : `Ver vídeo de ${name}`}
      className={
        large
          ? "mt-3 block w-full cursor-pointer text-left"
          : "block w-full max-w-[240px] shrink-0 cursor-pointer text-left"
      }
      onPointerDown={(event) => {
        if (event.pointerType !== "touch") return;
        touch.current = true;
        if (playing) stop();
        else play();
      }}
      onMouseEnter={() => {
        if (touch.current) return;
        play();
      }}
      onMouseLeave={() => {
        if (touch.current) {
          touch.current = false;
          return;
        }
        stop();
      }}
    >
      <video
        ref={videoRef}
        src={`${src}#t=0.1`}
        muted
        loop
        playsInline
        preload="metadata"
        className="aspect-square w-full rounded-[var(--radius-md)] border border-border bg-black object-contain"
      />
      <span className="mt-1 block text-xs text-text-muted">
        {playing ? "Toque para parar" : "Vídeo, porque não há GIF. Passe o mouse ou toque para ver"}
      </span>
    </div>
  );
}

export function ExercisePlayback({
  name,
  demoId,
  large,
}: {
  name: string;
  demoId?: string | null;
  large?: boolean;
}) {
  const media = resolveExerciseMedia(name, demoId);
  if (media?.type === "video") return <ExerciseClip large={large} videoId={media.id} name={name} />;
  return <ExerciseGif large={large} demoId={media?.type === "gif" ? media.id : null} name={name} />;
}

export function ExerciseDemoField({
  demoId,
  name,
  onPick,
}: {
  demoId?: string | null;
  name: string;
  onPick: (item: { id: string; name: string }) => void;
}) {
  const [editing, setEditing] = useState(false);
  const media: ExerciseMedia | null = resolveExerciseMedia(name, demoId);
  const showSearch = editing;

  return (
    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
      <ExercisePlayback demoId={demoId} name={name} />
      <div className="min-w-0 flex-1">
        {!demoId && media?.type === "gif" ? (
          <p className="mb-2 text-xs text-text-muted">
            O desenho pode ser parecido, e não o exercício exato. Troque o GIF ou mude o nome acima.
          </p>
        ) : null}
        {!demoId && media?.type === "video" ? (
          <p className="mb-2 text-xs text-text-muted">
            Não há GIF desta máquina. O vídeo entra no lugar. Você ainda pode trocar o desenho.
          </p>
        ) : null}
        {showSearch ? (
          <>
            <ExerciseSearch
              onPick={(item) => {
                onPick(item);
                setEditing(false);
              }}
            />
            <button
              type="button"
              className="mt-2 text-sm font-semibold text-text-muted"
              onClick={() => setEditing(false)}
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            type="button"
            className="text-sm font-semibold text-text underline-offset-2 hover:underline"
            onClick={() => setEditing(true)}
          >
            Trocar GIF
          </button>
        )}
      </div>
    </div>
  );
}

export function ExerciseSearch({
  onPick,
}: {
  onPick: (item: { id: string; name: string }) => void;
}) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Hit[]>([]);

  useEffect(() => {
    const text = q.trim();
    if (text.length < 2) {
      setItems([]);
      return;
    }
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ q: text });
      fetch(`/api/exercicios?${params}`)
        .then((r) => (r.ok ? r.json() : { items: [] }))
        .then((data) => setItems(data.items ?? []))
        .catch(() => setItems([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div className="mt-2">
      <label className="text-sm font-semibold text-text">Trocar o GIF</label>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Busque o desenho, como flexora ou curl"
        className="mt-1 h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 text-base text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand"
      />
      {items.length > 0 ? (
        <ul className="mt-2 max-h-52 overflow-y-auto rounded-[var(--radius-md)] border border-border">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-hover"
                onClick={() => {
                  onPick({ id: item.id, name: item.name });
                  setQ(item.name);
                  setItems([]);
                }}
              >
                <img
                  src={exerciseGifUrl(item.id) ?? ""}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-[var(--radius-sm)] bg-white object-contain"
                />
                <span>
                  <span className="block text-sm font-medium">{item.label ?? item.name}</span>
                  <span className="block text-xs text-text-muted">
                    {item.label ? `${item.name} · ` : ""}
                    {item.target}
                    {item.equipment ? ` · ${item.equipment}` : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
