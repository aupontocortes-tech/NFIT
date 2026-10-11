const photoRules: [string, string][] = [
  ["supino inclinado na maquina", "Leverage_Incline_Chest_Press"],
  ["supino inclinado maquina", "Leverage_Incline_Chest_Press"],
  ["supino inclinado com barra", "Barbell_Incline_Bench_Press_-_Medium_Grip"],
  ["supino declinado na maquina", "Leverage_Decline_Chest_Press"],
  ["supino declinado maquina", "Leverage_Decline_Chest_Press"],
  ["supino declinado com halteres", "Decline_Dumbbell_Bench_Press"],
  ["supino declinado com barra", "Decline_Barbell_Bench_Press"],
  ["supino declinado", "Decline_Barbell_Bench_Press"],
  ["supino maquina convergente", "Machine_Bench_Press"],
  ["supino convergente", "Machine_Bench_Press"],
  ["supino na maquina", "Machine_Bench_Press"],
  ["supino maquina", "Machine_Bench_Press"],
  ["supino no smith", "Smith_Machine_Bench_Press"],
  ["supino smith", "Smith_Machine_Bench_Press"],
  ["supino com halteres", "Dumbbell_Bench_Press"],
  ["supino fechado", "Close-Grip_Barbell_Bench_Press"],
  ["chest press", "Machine_Bench_Press"],
  ["crucifixo inclinado", "Incline_Dumbbell_Flyes"],
  ["crucifixo declinado", "Decline_Dumbbell_Flyes"],
  ["crucifixo com halteres", "Dumbbell_Flyes"],
  ["crucifixo reto", "Dumbbell_Flyes"],
  ["pullover", "Bent-Arm_Dumbbell_Pullover"],
  ["elevacao frontal", "Front_Dumbbell_Raise"],
  ["desenvolvimento arnold", "Arnold_Dumbbell_Press"],
  ["desenvolvimento com halteres", "Dumbbell_Shoulder_Press"],
  ["desenvolvimento no smith", "Smith_Machine_Overhead_Shoulder_Press"],
  ["desenvolvimento militar", "Barbell_Shoulder_Press"],
  ["desenvolvimento com barra", "Barbell_Shoulder_Press"],
  ["desenvolvimento na maquina", "Machine_Shoulder_Military_Press"],
  ["desenvolvimento maquina", "Machine_Shoulder_Military_Press"],
  ["remada alta", "Upright_Barbell_Row"],
  ["face pull", "Face_Pull"],
  ["encolhimento", "Barbell_Shrug"],
  ["remada unilateral", "One-Arm_Dumbbell_Row"],
  ["remada serrote", "One-Arm_Dumbbell_Row"],
  ["serrote", "One-Arm_Dumbbell_Row"],
  ["remada cavalinho", "T-Bar_Row_with_Handle"],
  ["remada sentada", "Seated_Cable_Rows"],
  ["remada invertida", "Inverted_Row"],
  ["barra fixa supinada", "Chin-Up"],
  ["barra fixa", "Pullups"],
  ["puxada supinada", "Underhand_Cable_Pulldowns"],
  ["puxada fechada", "Close-Grip_Front_Lat_Pulldown"],
  ["hiperextensao", "Hyperextensions_Back_Extensions"],
  ["extensao lombar", "Hyperextensions_Back_Extensions"],
  ["triceps frances", "Seated_Triceps_Press"],
  ["triceps coice", "Tricep_Dumbbell_Kickback"],
  ["triceps banco", "Bench_Dips"],
  ["mergulho no banco", "Bench_Dips"],
  ["mergulho na maquina", "Dip_Machine"],
  ["mergulho", "Dips_-_Chest_Version"],
  ["rosca scott na maquina", "Machine_Preacher_Curls"],
  ["rosca scott maquina", "Machine_Preacher_Curls"],
  ["rosca concentrada", "Concentration_Curls"],
  ["rosca inversa", "Reverse_Barbell_Curl"],
  ["rosca de punho", "Seated_Dumbbell_Palms-Up_Wrist_Curl"],
  ["rosca punho", "Seated_Dumbbell_Palms-Up_Wrist_Curl"],
  ["rosca barra w", "EZ-Bar_Curl"],
  ["rosca ez", "EZ-Bar_Curl"],
  ["rosca w", "EZ-Bar_Curl"],
  ["rosca na maquina", "Machine_Bicep_Curl"],
  ["rosca maquina", "Machine_Bicep_Curl"],
  ["afundo com halteres", "Dumbbell_Lunges"],
  ["afundo com barra", "Barbell_Lunge"],
  ["afundo", "Dumbbell_Lunges"],
  ["passada", "Dumbbell_Lunges"],
  ["agachamento goblet", "Goblet_Squat"],
  ["agachamento frontal", "Front_Barbell_Squat"],
  ["agachamento no smith", "Smith_Machine_Squat"],
  ["agachamento smith", "Smith_Machine_Squat"],
  ["agachamento sissy", "Weighted_Sissy_Squat"],
  ["agachamento hack", "Hack_Squat"],
  ["hack squat", "Hack_Squat"],
  ["stiff no smith", "Smith_Machine_Stiff-Legged_Deadlift"],
  ["stiff", "Romanian_Deadlift"],
  ["levantamento terra sumo", "Sumo_Deadlift"],
  ["terra sumo", "Sumo_Deadlift"],
  ["levantamento terra", "Barbell_Deadlift"],
  ["good morning", "Good_Morning"],
  ["bom dia", "Good_Morning"],
  ["ponte de gluteo", "Barbell_Glute_Bridge"],
  ["coice na polia", "One-Legged_Cable_Kickback"],
  ["coice de gluteo", "One-Legged_Cable_Kickback"],
  ["cadeira adutora", "Thigh_Adductor"],
  ["cadeira abdutora", "Thigh_Abductor"],
  ["adutora", "Thigh_Adductor"],
  ["abdutora", "Thigh_Abductor"],
  ["abdominal bicicleta", "Air_Bike"],
  ["abdominal infra", "Reverse_Crunch"],
  ["abdominal supra", "Crunches"],
  ["abdominal obliquo", "Oblique_Crunches"],
  ["abdominal russo", "Russian_Twist"],
  ["abdominal na polia", "Cable_Crunch"],
  ["abdominal na maquina", "Ab_Crunch_Machine"],
  ["abdominal maquina", "Ab_Crunch_Machine"],
  ["prancha lateral", "Side_Bridge"],
  ["elevacao de pernas", "Hanging_Leg_Raise"],
  ["escalador", "Mountain_Climbers"],
  ["caminhada do fazendeiro", "Farmers_Walk"],
  ["superman", "Superman"],
  ["inseto morto", "Dead_Bug"],
  ["flexao diamante", "Push-Ups_-_Close_Triceps_Position"],
  ["flexao fechada", "Push-Ups_-_Close_Triceps_Position"],
  ["panturrilha burro", "Donkey_Calf_Raises"],
  ["panturrilha no smith", "Smith_Machine_Calf_Raise"],
  ["panturrilha no leg", "Calf_Press_On_The_Leg_Press_Machine"],
  ["subida no banco", "Barbell_Step_Ups"],
  ["step up", "Barbell_Step_Ups"],
];

export const photoIds = new Set(photoRules.map(([, id]) => id));

function fold(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function bestPhotoMatch(name: string) {
  const text = fold(name);
  let best: { id: string; length: number } | null = null;
  for (const [phrase, id] of photoRules) {
    if (!text.includes(phrase)) continue;
    if (!best || phrase.length > best.length) best = { id, length: phrase.length };
  }
  return best;
}

export function matchPhotoId(name: string) {
  return bestPhotoMatch(name)?.id;
}

export function searchPhotoHits(query: string) {
  const text = fold(query.trim());
  if (text.length < 2) return [];
  const hits: { id: string; name: string; target: string; equipment: string; label: string }[] = [];
  const seen = new Set<string>();
  const phrases = [...photoRules].sort((a, b) => b[0].length - a[0].length);
  for (const [phrase, id] of phrases) {
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
