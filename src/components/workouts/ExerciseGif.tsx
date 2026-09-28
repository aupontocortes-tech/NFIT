"use client";

import { getExerciseGifUrl } from "@/lib/exercise-gifs";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

type Size = "sm" | "md";

/** Quadrados fixos (sem salto entre breakpoints). */
const sizeClass: Record<Size, string> = {
  sm: "h-14 w-14",
  md: "h-16 w-16",
};

/**
 * Miniatura/preview do GIF do exercício (fonte única compartilhada).
 * - Proporção 1:1, object-contain, fundo branco (legível no tema escuro)
 * - Carregando: pulse no shell
 * - Sem GIF / falha: placeholder neutro do mesmo tamanho
 */
export function ExerciseGif({
  name,
  size = "sm",
  className,
  reserveSpace = true,
}: {
  name: string;
  size?: Size;
  className?: string;
  reserveSpace?: boolean;
}) {
  const url = getExerciseGifUrl(name);
  /** Falha só vale para a URL atual (evita estado preso ao digitar). */
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const failed = !!url && failedUrl === url;
  const loaded = !!url && loadedUrl === url;

  useEffect(() => {
    const img = imgRef.current;
    if (url && img?.complete && img.naturalWidth > 0) setLoadedUrl(url);
  }, [url]);

  const shell = cn(
    sizeClass[size],
    "block shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-border bg-fill aspect-square",
    className,
  );

  if (!name.trim()) {
    if (!reserveSpace) return null;
    return <span aria-hidden className={shell} />;
  }

  if (!url || failed) {
    if (!reserveSpace) return null;
    return <span aria-hidden className={shell} />;
  }

  return (
    <span className={cn(shell, !loaded && "animate-pulse")}>
      <img
        key={url}
        ref={imgRef}
        src={url}
        alt=""
        loading="eager"
        decoding="async"
        onLoad={() => setLoadedUrl(url)}
        onError={() => setFailedUrl(url)}
        className="h-full w-full bg-white object-contain"
      />
    </span>
  );
}
