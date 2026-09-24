import { describe, expect, it } from "vitest";
import { normalizeWorkout } from "@/lib/server/ai-workout";

const input = { goal: "Força", daysPerWeek: 2, sessionMinutes: 60, level: "Avançado" };

describe("normalização da resposta da IA", () => {
  it("corrige tipos, limita valores e remove exercícios sem nome", () => {
    const w = normalizeWorkout(
      {
        title: "Plano",
        blocks: [
          {
            name: "Dia 1",
            exercises: [
              { name: "Agachamento", sets: "5", reps: 5, restSeconds: 999 },
              { name: "", sets: 3 },
            ],
          },
        ],
      },
      input,
    );
    expect(w.blocks).toHaveLength(1);
    expect(w.blocks[0].exercises).toEqual([
      { name: "Agachamento", sets: 5, reps: "5", restSeconds: 300, notes: undefined, order: 0 },
    ]);
    expect(w.goal).toBe("Força");
  });

  it("falha se não vier nenhum exercício", () => {
    expect(() => normalizeWorkout({ blocks: [] }, input)).toThrow();
  });
});
