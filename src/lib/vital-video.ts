import videos from "@/data/vital-videos.json";
import { resolveDemoId } from "@/lib/exercise-match";

export type ExerciseMedia = { type: "gif" | "video"; id: string };

const videoRules: [string, string][] = [
  ["flexora sentada", "0079"],
  ["cadeira flexora", "0079"],
  ["seated leg curl", "0079"],
  ["mesa flexora", "0075"],
  ["flexora deitada", "0075"],
  ["lying leg curl", "0075"],
  ["cadeira extensora", "0073"],
  ["leg extension", "0073"],
  ["voador", "0051"],
  ["peck deck", "0051"],
  ["pec deck", "0051"],
  ["hip thrust", "0057"],
  ["elevacao pelvica", "0057"],
  ["afundo bulgaro", "0055"],
  ["agachamento bulgaro", "0055"],
];

function fold(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function exerciseVideoUrl(id?: string | null) {
  if (!id || !/^\d{4}$/.test(id)) return null;
  return `/exercicios-video/${id}.mp4`;
}

export function searchVideoHits(query: string) {
  const text = fold(query.trim());
  if (text.length < 2) return [];
  const hits: { id: string; name: string; target: string; equipment: string; label: string }[] = [];
  const seen = new Set<string>();
  for (const [phrase, id] of videoRules) {
    if (!phrase.includes(text)) continue;
    const key = `${id}:${phrase}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const video = videos.find((item) => item.id === id);
    const label = phrase.replace(/(^|\s)\p{L}/gu, (letter) => letter.toUpperCase());
    hits.push({
      id,
      name: video?.name ?? phrase,
      target: video?.target ?? "",
      equipment: "vídeo",
      label,
    });
  }
  return hits;
}

export function matchVideoId(name: string) {
  const text = fold(name);
  const rule = videoRules.find(([phrase]) => text.includes(phrase));
  if (rule) return rule[1];
  const named = videos.find((item) => text.includes(fold(item.name)));
  return named?.id;
}

export function resolveExerciseMedia(name: string, demoId?: string | null): ExerciseMedia | null {
  if (demoId?.startsWith("video:")) return { type: "video", id: demoId.slice(6) };
  if (demoId && /^\d{4}$/.test(demoId)) return { type: "video", id: demoId };
  if (demoId) return { type: "gif", id: demoId };
  const gif = resolveDemoId(name);
  if (gif) return { type: "gif", id: gif };
  const video = matchVideoId(name);
  if (video) return { type: "video", id: video };
  return null;
}

export function mediaKeyForName(name: string) {
  const media = resolveExerciseMedia(name, null);
  if (!media) return undefined;
  return media.type === "video" ? `video:${media.id}` : media.id;
}
