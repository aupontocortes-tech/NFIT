"use client";

import { api } from "@/lib/api";
import { validateImage } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

/**
 * No celular, Tirar foto abre a câmera do aparelho.
 * Depois de usar ou tirar outra, a pessoa volta para o app.
 * Escolher arquivo abre a galeria ou os arquivos do computador.
 */
export function PhotoPicker({
  photos,
  onUploaded,
  onRemove,
  max = 6,
  label = "Adicionar foto",
  showFileHint = true,
  chooseSource = false,
  className,
}: {
  photos: string[];
  onUploaded: (url: string) => void | Promise<void>;
  onRemove?: (url: string) => void | Promise<void>;
  max?: number;
  label?: string;
  showFileHint?: boolean;
  chooseSource?: boolean;
  className?: string;
}) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");

  async function accept(files: File[]) {
    setError("");
    const chosen = files.slice(0, Math.max(0, max - photos.length));
    for (const file of chosen) {
      const invalid = validateImage(file);
      if (invalid) {
        setError(invalid);
        continue;
      }
      setUploading((n) => n + 1);
      try {
        const { url } = await api.uploadPhoto(file);
        await onUploaded(url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Não foi possível enviar a foto.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (galleryRef.current) galleryRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  }

  const full = photos.length >= max;

  return (
    <div className={cn("relative", className)}>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((url) => (
          <div key={url} className="relative aspect-square overflow-hidden rounded-[var(--radius-md)] border border-border bg-fill">
            <img src={url} alt="Foto enviada" className="h-full w-full object-cover" />
            {onRemove ? (
              <button
                type="button"
                onClick={() => onRemove(url)}
                aria-label="Remover foto"
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`up-${i}`} className="flex aspect-square items-center justify-center rounded-[var(--radius-md)] border border-dashed border-border">
            <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
          </div>
        ))}
        {!full && chooseSource ? (
          <div className="col-span-3 flex flex-wrap gap-2 sm:col-span-4">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border px-3 text-sm font-semibold"
            >
              <Camera className="h-5 w-5" />
              Tirar foto
            </button>
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border px-3 text-sm font-semibold"
            >
              <ImagePlus className="h-5 w-5" />
              Escolher arquivo
            </button>
          </div>
        ) : null}
        {!full && !chooseSource ? (
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] border border-dashed border-border text-xs text-text-muted transition hover:border-brand hover:text-brand",
            )}
          >
            <Camera className="h-5 w-5" />
            {label}
          </button>
        ) : null}
      </div>
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple={!chooseSource}
        className="absolute h-px w-px opacity-0"
        onChange={(e) => accept(Array.from(e.target.files ?? []))}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="absolute h-px w-px opacity-0"
        onChange={(e) => accept(Array.from(e.target.files ?? []))}
      />
      {showFileHint ? (
        <p className="mt-2 text-caption">
          {photos.length}/{max} fotos · JPG, PNG ou HEIC até 10 MB
        </p>
      ) : null}
      {error ? <p className="mt-1 text-xs text-error">{error}</p> : null}
    </div>
  );
}
