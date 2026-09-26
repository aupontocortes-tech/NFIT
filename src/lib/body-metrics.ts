export type Sex = "f" | "m";

export type BodyInput = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  chestCm: number;
  bicepsCm: number;
  forearmCm: number;
  waistCm: number;
  abdomenCm: number;
  hipCm: number;
  thighCm: number;
};

export type BodyResult = {
  bmi: number;
  bmiLabel: string;
  whr: number;
  whrLabel: string;
  girthSumCm: number;
  bodyFatPercent: number;
  leanMassKg: number;
};

function round(n: number, digits: number) {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

export function bmiLabel(bmi: number) {
  if (bmi < 18.5) return "Abaixo do peso";
  if (bmi < 25) return "Peso normal";
  if (bmi < 30) return "Sobrepeso";
  if (bmi < 35) return "Obesidade grau I";
  if (bmi < 40) return "Obesidade grau II";
  return "Obesidade grau III";
}

export function whrLabel(sex: Sex, whr: number) {
  if (sex === "f") {
    if (whr < 0.8) return "Baixo";
    if (whr <= 0.85) return "Moderado";
    return "Alto";
  }
  if (whr < 0.9) return "Baixo";
  if (whr < 1) return "Moderado";
  return "Alto";
}

/** Densidade corporal feminina: Weltman et al., 1988. Medidas em cm e idade em anos. */
function femaleDensity(abdomenCm: number, hipCm: number, heightCm: number, age: number) {
  return (
    1.168297 -
    0.002824 * abdomenCm +
    0.0000122098 * abdomenCm * abdomenCm -
    0.000733128 * hipCm +
    0.000510477 * heightCm -
    0.000216161 * age
  );
}

/** Gordura por cintura e idade no homem: Lean et al., 1996. */
function maleBodyFat(waistCm: number, age: number) {
  return 0.567 * waistCm + 0.101 * age - 31.8;
}

function siri(density: number) {
  return 495 / density - 450;
}

export function bodyMetrics(input: BodyInput): BodyResult {
  const heightM = input.heightCm / 100;
  const bmi = input.weightKg / (heightM * heightM);
  const whr = input.waistCm / input.hipCm;
  const girthSumCm =
    input.chestCm +
    input.bicepsCm +
    input.forearmCm +
    input.waistCm +
    input.abdomenCm +
    input.hipCm +
    input.thighCm;
  const rawFat =
    input.sex === "f"
      ? siri(femaleDensity(input.abdomenCm, input.hipCm, input.heightCm, input.age))
      : maleBodyFat(input.waistCm, input.age);
  const bodyFatPercent = round(Math.min(70, Math.max(3, rawFat)), 2);
  const leanMassKg = round(input.weightKg * (1 - bodyFatPercent / 100), 2);
  return {
    bmi: round(bmi, 2),
    bmiLabel: bmiLabel(bmi),
    whr: round(whr, 2),
    whrLabel: whrLabel(input.sex, whr),
    girthSumCm: round(girthSumCm, 1),
    bodyFatPercent: bodyFatPercent,
    leanMassKg,
  };
}
