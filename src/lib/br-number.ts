/** Número digitado no Brasil: 62,5 ou 62.5. */
export function parseBrNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : Number.NaN;
  if (typeof value !== "string") return Number.NaN;
  const cleaned = value.trim().replace(/[^\d,.-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === "," || cleaned === ".") return Number.NaN;
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : Number.NaN;
}

/** 170 ou 1,70 passam a centímetros. */
export function heightToCm(value: unknown): number {
  const n = parseBrNumber(value);
  if (!Number.isFinite(n)) return Number.NaN;
  const cm = n > 0 && n < 3 ? n * 100 : n;
  return Math.round(cm * 10) / 10;
}
