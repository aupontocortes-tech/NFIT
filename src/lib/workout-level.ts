export type WorkoutLevel = "iniciante" | "intermediario" | "experiente";

export const workoutLevels: {
  id: WorkoutLevel;
  label: string;
  hint: string;
  color: string;
}[] = [
  {
    id: "iniciante",
    label: "Iniciante",
    hint: "Máquina e movimento guiado. 2 a 3 séries, RPE 6 a 7.",
    color: "#22c55e",
  },
  {
    id: "intermediario",
    label: "Intermediário",
    hint: "Livre e máquina. 3 a 4 séries, RPE 7 a 8.",
    color: "#3b82f6",
  },
  {
    id: "experiente",
    label: "Experiente",
    hint: "Carga e técnica avançadas. 3 a 5 séries, RPE 8 ou %1RM.",
    color: "#f97316",
  },
];

export function workoutLevel(value?: string | null): WorkoutLevel {
  const text = (value ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  if (text.startsWith("ini") || text === "beginner") return "iniciante";
  if (text.startsWith("exp") || text.startsWith("ava") || text === "advanced") return "experiente";
  return "intermediario";
}

export function workoutLevelLabel(value?: string | null) {
  const id = workoutLevel(value);
  return workoutLevels.find((item) => item.id === id)?.label ?? "Intermediário";
}

export function workoutLevelRules(value?: string | null) {
  const id = workoutLevel(value);
  if (id === "iniciante") {
    return `NÍVEL: Iniciante.
- Só máquina, cabo ou peso do corpo estável. Sem barra livre, sem olímpico, sem exercício avançado.
- 2 a 3 séries. Repetições 10 a 15. Intensidade RPE 6 a 7. Sem porcentagem alta de 1RM.
- Descanso 60 a 90 segundos. No máximo 5 exercícios no dia.
- Progressão linear e lenta.`;
  }
  if (id === "experiente") {
    return `NÍVEL: Experiente.
- Pode usar barra, halter e máquina, com técnica exigente.
- 3 a 5 séries. Repetições conforme o objetivo. Intensidade RPE 8 ou %1RM.
- Descanso até 180 segundos nos compostos. Até 8 exercícios no dia.
- Progressão mais lenta, com periodização.`;
  }
  return `NÍVEL: Intermediário.
- Misture peso livre e máquina.
- 3 a 4 séries. Repetições 8 a 12. Intensidade RPE 7 a 8.
- Descanso 60 a 120 segundos. Até 6 exercícios no dia.
- Progressão gradual, no máximo 10% por semana.`;
}

export function levelSetBounds(value?: string | null) {
  const id = workoutLevel(value);
  if (id === "iniciante") return { min: 2, max: 3, fallback: 3, restMax: 90 };
  if (id === "experiente") return { min: 3, max: 5, fallback: 4, restMax: 300 };
  return { min: 3, max: 4, fallback: 3, restMax: 120 };
}
