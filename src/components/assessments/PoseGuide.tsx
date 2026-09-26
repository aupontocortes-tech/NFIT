import type { Sex } from "@/lib/body-metrics";

const captions = {
  front: "Olhando para a câmera, braços ao lado do corpo.",
  right: "Virado para a direita, braço estendido à frente.",
  left: "Virado para a esquerda, braço estendido à frente.",
  back: "De costas, braços ao lado do corpo.",
} as const;

const files = {
  f: {
    front: "/poses/mulher-frente.jpg",
    right: "/poses/mulher-direita.jpg",
    left: "/poses/mulher-esquerda.jpg",
    back: "/poses/mulher-costas.jpg",
  },
  m: {
    front: "/poses/homem-frente.jpg",
    right: "/poses/homem-direita.jpg",
    left: "/poses/homem-esquerda.jpg",
    back: "/poses/homem-costas.jpg",
  },
} as const;

export function PoseGuide({ pose, sex }: { pose: keyof typeof captions; sex: Sex }) {
  return (
    <figure className="mb-3 flex items-center gap-3">
      <img
        src={files[sex][pose]}
        alt=""
        className="h-40 w-28 shrink-0 rounded-[var(--radius-md)] bg-fill object-contain"
      />
      <figcaption className="text-sm text-text-muted">{captions[pose]}</figcaption>
    </figure>
  );
}
