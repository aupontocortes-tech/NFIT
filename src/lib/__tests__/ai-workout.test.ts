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
      {
        name: "Agachamento",
        sets: 5,
        reps: "5",
        intensity: undefined,
        restSeconds: 300,
        notes: undefined,
        alternatives: undefined,
        order: 0,
      },
    ]);
    expect(w.goal).toBe("Força");
    expect(w.warnings).toBeUndefined();
  });

  it("aceita intensidade, aquecimento, volta à calma, alternativas e avisos", () => {
    const w = normalizeWorkout(
      {
        title: "Plano hipertrofia",
        goal: "Hipertrofia",
        notes: "Revise o volume semanal.",
        warnings: [
          "Falta equipamento informado",
          "Dor no joelho — revisão humana obrigatória",
          "",
          42,
        ],
        blocks: [
          {
            name: "Dia 1 — Inferiores",
            warmUp: "5 min bike + mobilidade de quadril",
            coolDown: "Alongamento de posteriores",
            exercises: [
              {
                name: "Agachamento",
                sets: 4,
                reps: "6-8",
                intensity: "75% 1RM",
                restSeconds: 120,
                notes: "Profundidade confortável",
                alternatives: ["Leg press", "Hack squat", "", null],
              },
              {
                name: "Leg curl",
                sets: 3,
                reps: "10-12",
                intensity: "RPE 7",
                restSeconds: 60,
                alternatives: ["Nordic curl assistido"],
              },
            ],
          },
        ],
      },
      input,
    );

    expect(w.warnings).toEqual([
      "Falta equipamento informado",
      "Dor no joelho — revisão humana obrigatória",
    ]);
    expect(w.blocks[0].warmUp).toBe("5 min bike + mobilidade de quadril");
    expect(w.blocks[0].coolDown).toBe("Alongamento de posteriores");
    expect(w.blocks[0].exercises[0]).toMatchObject({
      name: "Agachamento",
      sets: 4,
      reps: "6-8",
      intensity: "75% 1RM",
      restSeconds: 120,
      notes: "Profundidade confortável",
      alternatives: ["Leg press", "Hack squat"],
      order: 0,
    });
    expect(w.blocks[0].exercises[1].intensity).toBe("RPE 7");
    expect(w.blocks[0].exercises[1].alternatives).toEqual(["Nordic curl assistido"]);
  });

  it("tolera campos opcionais ausentes sem quebrar o rascunho", () => {
    const w = normalizeWorkout(
      {
        blocks: [
          {
            name: "Dia A",
            exercises: [{ name: "Supino", sets: 3, reps: "8-10", restSeconds: 90 }],
          },
        ],
      },
      input,
    );
    expect(w.warnings).toBeUndefined();
    expect(w.blocks[0].warmUp).toBeUndefined();
    expect(w.blocks[0].coolDown).toBeUndefined();
    expect(w.blocks[0].exercises[0].intensity).toBeUndefined();
    expect(w.blocks[0].exercises[0].alternatives).toBeUndefined();
    expect(w.blocks[0].exercises[0].sets).toBe(3);
    expect(w.blocks[0].exercises[0].restSeconds).toBe(90);
  });

  it("limita séries do nível experiente e o descanso mínimo", () => {
    const w = normalizeWorkout(
      {
        blocks: [
          {
            exercises: [
              { name: "Remada", sets: 99, reps: "10", restSeconds: 5 },
            ],
          },
        ],
      },
      input,
    );
    expect(w.blocks[0].exercises[0].sets).toBe(5);
    expect(w.blocks[0].exercises[0].restSeconds).toBe(15);
  });

  it("falha se não vier nenhum exercício", () => {
    expect(() => normalizeWorkout({ blocks: [] }, input)).toThrow();
  });
});
