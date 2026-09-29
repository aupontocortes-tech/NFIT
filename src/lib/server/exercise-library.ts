import { portugueseLabel, portugueseMatchIds } from "@/lib/exercise-match";
import { searchVideoHits } from "@/lib/vital-video";
import { readFileSync } from "node:fs";
import path from "node:path";

export type LibraryExercise = {
  id: string;
  name: string;
  target: string;
  equipment: string;
  label?: string;
  media?: "gif" | "video";
};

let cache: LibraryExercise[] | null = null;

function catalog() {
  if (!cache) {
    const file = path.join(process.cwd(), "src/data/exercises.json");
    cache = JSON.parse(readFileSync(file, "utf8")) as LibraryExercise[];
  }
  return cache;
}

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export function searchExercises(query: string, limit = 15): LibraryExercise[] {
  const q = fold(query.trim());
  if (q.length < 2) return [];
  const byId = new Map(catalog().map((item) => [item.id, item]));
  const hits: LibraryExercise[] = [];
  const seen = new Set<string>();
  for (const video of searchVideoHits(q)) {
    if (seen.has(video.id)) continue;
    seen.add(video.id);
    hits.push({ ...video, media: "video" });
  }
  for (const id of portugueseMatchIds(q)) {
    const item = byId.get(id);
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    hits.push({ ...item, label: portugueseLabel(item.id) });
  }
  for (const item of catalog()) {
    if (seen.has(item.id)) continue;
    const hay = fold(`${item.name} ${item.target} ${item.equipment}`);
    if (!hay.includes(q)) continue;
    seen.add(item.id);
    hits.push({ ...item, label: portugueseLabel(item.id) });
    if (hits.length >= limit) break;
  }
  return hits.slice(0, limit);
}
