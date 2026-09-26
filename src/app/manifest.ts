import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NFIT",
    short_name: "NFIT",
    description: "App de gestão para personal trainers e alunos",
    start_url: "/",
    id: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "pt-BR",
    background_color: "#e50914",
    theme_color: "#e50914",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Dashboard", url: "/dashboard" },
      { name: "Alunos", url: "/alunos" },
      { name: "Agenda", url: "/agenda" },
    ],
  };
}
