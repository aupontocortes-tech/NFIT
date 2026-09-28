/**
 * Fonte única de GIFs de exercício (ExerciseDB CDN).
 * Usada no app do aluno e na interface do personal — não duplicar este mapa.
 */

const GIF_CDN = "https://static.exercisedb.dev/media";

/** id ExerciseDB → URL do GIF */
function gif(id: string): string {
  return `${GIF_CDN}/${id}.gif`;
}

/**
 * Aliases em pt-BR (e variações comuns) → id ExerciseDB.
 * Chaves devem passar por `normalizeExerciseName`.
 */
const EXERCISE_GIF_IDS: Record<string, string> = {
  // Peito
  "supino reto": "EIeI8Vf",
  "supino": "EIeI8Vf",
  "supino barra": "EIeI8Vf",
  "barbell bench press": "EIeI8Vf",
  "supino inclinado": "3TZduzM",
  "supino inclinado barra": "3TZduzM",
  "barbell incline bench press": "3TZduzM",
  "supino maquina": "DOoWcnA",
  "supino na maquina": "DOoWcnA",
  "chest press": "DOoWcnA",
  "lever chest press": "DOoWcnA",
  "crucifixo": "0CXGHya",
  "crucifixo com halteres": "0CXGHya",
  "crossover": "0CXGHya",
  "cable cross over variation": "0CXGHya",
  "peck deck": "DOoWcnA",
  "supino com halteres": "EIeI8Vf",

  // Costas
  "remada curvada": "eZyBC3j",
  "barbell bent over row": "eZyBC3j",
  "remada unilateral": "BJ0Hz5L",
  "remada com halteres": "BJ0Hz5L",
  "dumbbell bent over row": "BJ0Hz5L",
  "remada maquina": "4f8RXP8",
  "remada com elastico": "4f8RXP8",
  "puxada frente": "LEprlgG",
  "puxada frontal": "LEprlgG",
  "puxada": "LEprlgG",
  "lat pulldown": "LEprlgG",
  "cable lat pulldown full range of motion": "LEprlgG",
  "pulldown neutro": "0V2YQjW",
  "barra fixa": "kiJ4Z2K",
  "barra fixa assistida": "kiJ4Z2K",
  "assisted pull up": "kiJ4Z2K",
  "pull up neutral grip": "0V2YQjW",
  "face pull": "wqNPGCg",
  "cable rear delt row with rope": "wqNPGCg",
  "crucifixo inverso": "wqNPGCg",

  // Ombros
  "desenvolvimento": "kTbSH9h",
  "desenvolvimento militar": "kTbSH9h",
  "barbell seated overhead press": "kTbSH9h",
  "elevacao lateral": "DsgkuIt",
  "dumbbell lateral raise": "DsgkuIt",
  "elevacao frontal": "DsgkuIt",

  // Braços
  "rosca direta": "25GPyDY",
  "barbell curl": "25GPyDY",
  "rosca martelo": "2NpxjC1",
  "dumbbell hammer curl v 2": "2NpxjC1",
  "rosca scott": "25GPyDY",
  "triceps corda": "dU605di",
  "triceps pulley": "3ZflifB",
  "triceps pulley barra": "3ZflifB",
  "cable pushdown": "3ZflifB",
  "cable pushdown with rope attachment": "dU605di",
  "triceps testa": "1TVoin7",
  "mergulho banco": "9RT8oQW",
  "bench dip on floor": "9RT8oQW",
  "triceps banco maquina": "9RT8oQW",

  // Pernas
  "agachamento livre": "qXTaZnJ",
  "agachamento": "qXTaZnJ",
  "barbell full squat": "qXTaZnJ",
  "agachamento goblet": "ZA8b5hc",
  "kettlebell goblet squat": "ZA8b5hc",
  "leg press": "10Z2DXU",
  "sled 45 leg press": "10Z2DXU",
  "levantamento terra romeno": "o6LqKKP",
  "stiff": "o6LqKKP",
  "traditional barbell romanian deadlift": "o6LqKKP",
  "afundo": "IZVHb27",
  "afundo alternado": "IZVHb27",
  "walking lunge": "IZVHb27",
  "panturrilha em pe": "8ozhUIZ",
  "panturrilha": "8ozhUIZ",
  "barbell standing calf raise": "8ozhUIZ",

  // Core / peso corporal
  "prancha": "CosupLu",
  "front plank with twist": "CosupLu",
  "abdominal crunch": "8xUv4J7",
  "abdominal": "8xUv4J7",
  "crunch": "8xUv4J7",
  "cable seated crunch": "8xUv4J7",
  "flexao de braco": "LEH9jxP",
  "flexao": "LEH9jxP",
  "push up wall": "LEH9jxP",
  "burpee": "dK9394r",
  "burpee modificado": "dK9394r",
  "hanging leg raise": "I3tsCnC",
  "elevacao de pernas": "I3tsCnC",
};

/** Normaliza nome para lookup (minúsculas, sem acento, só letras/números/espaços). */
export function normalizeExerciseName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Retorna a URL do GIF do exercício, ou `null` se não houver mapeamento.
 * Nunca lança — telas devem tolerar ausência de GIF.
 */
export function getExerciseGifUrl(name: string | null | undefined): string | null {
  if (!name?.trim()) return null;
  const key = normalizeExerciseName(name);
  if (!key) return null;

  const id = EXERCISE_GIF_IDS[key];
  if (id) return gif(id);

  // Match parcial: chave contida no nome ou nome contido na chave (mín. 5 chars).
  if (key.length >= 5) {
    for (const [alias, aliasId] of Object.entries(EXERCISE_GIF_IDS)) {
      if (alias.length < 5) continue;
      if (key.includes(alias) || alias.includes(key)) return gif(aliasId);
    }
  }

  return null;
}
