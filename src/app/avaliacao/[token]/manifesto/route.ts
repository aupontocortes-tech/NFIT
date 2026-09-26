import type { MetadataRoute } from "next";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  const start = `/avaliacao/${token}`;
  const manifest: MetadataRoute.Manifest = {
    name: "NFIT — Avaliação",
    short_name: "NFIT",
    description: "Enviar medidas e fotos para a personal",
    start_url: start,
    id: start,
    scope: start,
    display: "standalone",
    orientation: "portrait",
    lang: "pt-BR",
    background_color: "#e50914",
    theme_color: "#e50914",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
  return Response.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
