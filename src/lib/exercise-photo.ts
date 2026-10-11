const photoRules: [string, string][] = [
  ["supino inclinado na maquina", "Leverage_Incline_Chest_Press"],
  ["supino inclinado maquina", "Leverage_Incline_Chest_Press"],
  ["supino declinado na maquina", "Leverage_Decline_Chest_Press"],
  ["supino declinado maquina", "Leverage_Decline_Chest_Press"],
  ["supino maquina convergente", "Machine_Bench_Press"],
  ["supino convergente", "Machine_Bench_Press"],
  ["supino na maquina", "Machine_Bench_Press"],
  ["supino maquina", "Machine_Bench_Press"],
  ["chest press", "Machine_Bench_Press"],
  ["agachamento hack", "Hack_Squat"],
  ["hack squat", "Hack_Squat"],
  ["cadeira adutora", "Thigh_Adductor"],
  ["cadeira abdutora", "Thigh_Abductor"],
  ["adutora", "Thigh_Adductor"],
  ["abdutora", "Thigh_Abductor"],
  ["desenvolvimento na maquina", "Machine_Shoulder_Military_Press"],
  ["desenvolvimento maquina", "Machine_Shoulder_Military_Press"],
  ["rosca scott na maquina", "Machine_Preacher_Curls"],
  ["rosca scott maquina", "Machine_Preacher_Curls"],
  ["rosca na maquina", "Machine_Bicep_Curl"],
  ["rosca maquina", "Machine_Bicep_Curl"],
  ["abdominal na maquina", "Ab_Crunch_Machine"],
  ["abdominal maquina", "Ab_Crunch_Machine"],
  ["mergulho na maquina", "Dip_Machine"],
  ["panturrilha no leg", "Calf_Press_On_The_Leg_Press_Machine"],
];

export const photoIds = new Set(photoRules.map(([, id]) => id));

function fold(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function matchPhotoId(name: string) {
  const text = fold(name);
  return photoRules.find(([phrase]) => text.includes(phrase))?.[1];
}

export function searchPhotoHits(query: string) {
  const text = fold(query.trim());
  if (text.length < 2) return [];
  const hits: { id: string; name: string; target: string; equipment: string; label: string }[] = [];
  const seen = new Set<string>();
  for (const [phrase, id] of photoRules) {
    if (!phrase.includes(text) || seen.has(id)) continue;
    seen.add(id);
    const label = phrase.replace(/(^|\s)\p{L}/gu, (letter) => letter.toUpperCase());
    hits.push({ id, name: label, target: "foto", equipment: "máquina", label });
  }
  return hits;
}

export function exercisePhotoUrl(id?: string | null, frame: 0 | 1 = 0) {
  if (!id || !photoIds.has(id)) return null;
  return `/api/exercicios/foto?id=${encodeURIComponent(id)}&frame=${frame}`;
}
