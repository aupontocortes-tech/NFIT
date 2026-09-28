"use client";

import { getExerciseGifUrl } from "@/lib/exercise-gifs";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Size = "sm" | "md";

const sizeClass: Record<Size, string> = {
  sm: "h-14 w-14",
  md: "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]",
};

/**
 * Miniatura/preview do GIF do exercício (fonte única compartilhada).
 * Sem GIF ou falha de carga → placeholder neutro do mesmo tamanho (não quebra o layout).
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
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [url]);

  if (!name.trim()) return null;

  if (!url || failed) {
    if (!reserveSpace) return null;
    return (
      <span
        aria-hidden
        className={cn(
          sizeClass[size],
          "inline-block shrink-0 rounded-[var(--radius-md)] bg-fill",
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        sizeClass[size],
        "relative inline-block shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-fill",
        className,
      )}
    >
      <img
        src={url}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          "h-full w-full object-contain transition-opacity",
          loaded ? "opacity-100" : "opacity-80",
        )}
      />
    </span>
  );
}
