import { describe, expect, it } from "vitest";
import { getExerciseGifUrl, normalizeExerciseName } from "@/lib/exercise-gifs";

describe("normalizeExerciseName", () => {
  it("remove acentos e normaliza espaços", () => {
    expect(normalizeExerciseName("  Supino Reto  ")).toBe("supino reto");
    expect(normalizeExerciseName("Elevação lateral")).toBe("elevacao lateral");
    expect(normalizeExerciseName("Tríceps-corda")).toBe("triceps corda");
  });
});

describe("getExerciseGifUrl", () => {
  it("retorna URL do CDN para exercícios conhecidos", () => {
    const url = getExerciseGifUrl("Supino reto");
    expect(url).toBe("https://static.exercisedb.dev/media/EIeI8Vf.gif");
  });

  it("aceita variações de capitalização e acento", () => {
    expect(getExerciseGifUrl("AGACHAMENTO LIVRE")).toContain(".gif");
    expect(getExerciseGifUrl("Elevação lateral")).toContain("DsgkuIt");
  });

  it("retorna null quando não há GIF (não quebra)", () => {
    expect(getExerciseGifUrl("")).toBeNull();
    expect(getExerciseGifUrl("   ")).toBeNull();
    expect(getExerciseGifUrl(null)).toBeNull();
    expect(getExerciseGifUrl(undefined)).toBeNull();
    expect(getExerciseGifUrl("Exercício inventado xyzzy 999")).toBeNull();
  });

  it("faz match parcial para nomes compostos conhecidos", () => {
    expect(getExerciseGifUrl("Supino reto com pausa")).toContain("EIeI8Vf");
  });
});
