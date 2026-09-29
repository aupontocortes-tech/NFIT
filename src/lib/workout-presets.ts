import type { ManualExercise } from "@/components/workouts/ManualExerciseBoard";

type PresetMove = {
  name: string;
  demoId: string;
  sets: string;
  reps: string;
  rest: string;
};

export type WorkoutPreset = {
  id: string;
  label: string;
  focus: string;
  goal: string;
  color: string;
  exercises: PresetMove[];
};

export const workoutPresets: WorkoutPreset[] = [
  {
    id: "a",
    label: "Treino A",
    focus: "Peito e tríceps",
    goal: "Hipertrofia",
    color: "#e50914",
    exercises: [
      { name: "Supino reto com barra", demoId: "EIeI8Vf", sets: "4", reps: "8-10", rest: "90" },
      { name: "Supino inclinado com halteres", demoId: "ns0SIbU", sets: "3", reps: "10-12", rest: "75" },
      { name: "Crucifixo no cabo", demoId: "Pr9Rhf4", sets: "3", reps: "12", rest: "60" },
      { name: "Tríceps na polia", demoId: "dU605di", sets: "3", reps: "12", rest: "60" },
      { name: "Tríceps testa", demoId: "h8LFzo9", sets: "3", reps: "10-12", rest: "60" },
    ],
  },
  {
    id: "b",
    label: "Treino B",
    focus: "Costas e bíceps",
    goal: "Hipertrofia",
    color: "#3b82f6",
    exercises: [
      { name: "Puxada alta", demoId: "LEprlgG", sets: "4", reps: "8-10", rest: "90" },
      { name: "Remada curvada com barra", demoId: "eZyBC3j", sets: "4", reps: "8", rest: "90" },
      { name: "Remada baixa", demoId: "hvV79Si", sets: "3", reps: "10-12", rest: "75" },
      { name: "Rosca direta com barra", demoId: "25GPyDY", sets: "3", reps: "10", rest: "60" },
      { name: "Rosca martelo", demoId: "6em2Dxj", sets: "3", reps: "12", rest: "60" },
    ],
  },
  {
    id: "c",
    label: "Treino C",
    focus: "Pernas",
    goal: "Hipertrofia",
    color: "#22c55e",
    exercises: [
      { name: "Agachamento livre", demoId: "qXTaZnJ", sets: "4", reps: "8", rest: "120" },
      { name: "Leg press", demoId: "2Qh2J1e", sets: "4", reps: "10", rest: "90" },
      { name: "Cadeira extensora", demoId: "video:0073", sets: "3", reps: "12", rest: "60" },
      { name: "Mesa flexora", demoId: "video:0075", sets: "3", reps: "12", rest: "60" },
      { name: "Panturrilha em pé", demoId: "8ozhUIZ", sets: "4", reps: "12", rest: "45" },
    ],
  },
  {
    id: "d",
    label: "Treino D",
    focus: "Ombro e glúteo",
    goal: "Hipertrofia",
    color: "#a855f7",
    exercises: [
      { name: "Desenvolvimento sentado", demoId: "znQUdHY", sets: "4", reps: "8-10", rest: "90" },
      { name: "Elevação lateral", demoId: "DsgkuIt", sets: "3", reps: "12", rest: "60" },
      { name: "Crucifixo invertido", demoId: "EAs3xL9", sets: "3", reps: "12", rest: "60" },
      { name: "Hip thrust", demoId: "qKBpF7I", sets: "4", reps: "8-10", rest: "90" },
      { name: "Afundo búlgaro", demoId: "y8bYM8w", sets: "3", reps: "10", rest: "75" },
    ],
  },
  {
    id: "full",
    label: "Corpo inteiro",
    focus: "Iniciante",
    goal: "Condicionamento",
    color: "#06b6d4",
    exercises: [
      { name: "Agachamento livre", demoId: "qXTaZnJ", sets: "3", reps: "10", rest: "90" },
      { name: "Supino reto com barra", demoId: "EIeI8Vf", sets: "3", reps: "10", rest: "90" },
      { name: "Remada curvada", demoId: "eZyBC3j", sets: "3", reps: "10", rest: "75" },
      { name: "Elevação lateral", demoId: "DsgkuIt", sets: "2", reps: "12", rest: "60" },
      { name: "Prancha", demoId: "VBAWRPG", sets: "3", reps: "30s", rest: "45" },
    ],
  },
];

export function presetExercises(preset: WorkoutPreset): ManualExercise[] {
  return preset.exercises.map((exercise) => ({
    key: crypto.randomUUID(),
    ...exercise,
  }));
}
