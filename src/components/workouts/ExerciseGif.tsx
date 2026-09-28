"use client";

import { getExerciseGifUrl } from "@/lib/exercise-gifs";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Size = "sm" | "md";

const sizeClass: Record<Size, string> = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
};

/**
 * Miniatura/preview do GIF do exercício (mesma fonte do app do aluno).
 * Sem GIF ou falha de carga → não renderiza nada (não quebra o layout).
 */
export function ExerciseGif({
  name,
  size = "sm",
  className,
}: {
  name: string;
  size?: Size;
  className?: string;
}) {
  const url = getExerciseGifUrl(name);
  const [failed, setFailed] = useState(false);

  if (!url || failed) return null;

  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn(
        sizeClass[size],
        "shrink-0 rounded-[var(--radius-md)] bg-fill object-cover",
        className,
      )}
    />
  );
}
