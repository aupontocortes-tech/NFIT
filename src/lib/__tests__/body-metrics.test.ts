import { describe, expect, it } from "vitest";
import { bodyMetrics } from "@/lib/body-metrics";

const sample = {
  sex: "f" as const,
  age: 27,
  heightCm: 163,
  weightKg: 62.5,
  chestCm: 89,
  bicepsCm: 30,
  forearmCm: 23,
  waistCm: 69,
  abdomenCm: 76,
  hipCm: 102,
  thighCm: 59,
};

describe("cálculos da avaliação", () => {
  const result = bodyMetrics(sample);

  it("soma as sete medidas", () => {
    expect(result.girthSumCm).toBe(448);
  });

  it("calcula IMC e RCQ com a classificação", () => {
    expect(result.bmi).toBe(23.52);
    expect(result.bmiLabel).toBe("Peso normal");
    expect(result.whr).toBe(0.68);
    expect(result.whrLabel).toBe("Baixo");
  });

  it("deriva a massa magra da gordura calculada", () => {
    const lean = Math.round(sample.weightKg * (1 - result.bodyFatPercent / 100) * 100) / 100;
    expect(result.leanMassKg).toBe(lean);
    expect(result.bodyFatPercent).toBeGreaterThan(15);
    expect(result.bodyFatPercent).toBeLessThan(50);
  });
});
