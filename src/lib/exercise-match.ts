const rules: [string, string][] = [
  ["supino inclinado com halteres", "ns0SIbU"],
  ["supino reto com barra", "EIeI8Vf"],
  ["supino reto", "EIeI8Vf"],
  ["crucifixo no cabo", "Pr9Rhf4"],
  ["crucifixo invertido", "EAs3xL9"],
  ["paralelas", "X6C6i5Y"],
  ["triceps na polia", "dU605di"],
  ["puxada alta", "LEprlgG"],
  ["remada curvada com barra", "eZyBC3j"],
  ["remada curvada", "eZyBC3j"],
  ["remada baixa", "hvV79Si"],
  ["pulldown reto", "x69MAlq"],
  ["rosca direta com barra", "25GPyDY"],
  ["rosca direta", "NbVPDMW"],
  ["rosca alternada", "ae9UoXQ"],
  ["agachamento livre", "qXTaZnJ"],
  ["leg press", "2Qh2J1e"],
  ["panturrilha em pe", "8ozhUIZ"],
  ["panturrilha sentada", "ktsFQAZ"],
  ["desenvolvimento sentado", "znQUdHY"],
  ["elevacao lateral", "DsgkuIt"],
  ["rosca scott", "qOgPVf6"],
  ["triceps testa", "h8LFzo9"],
  ["rosca martelo", "6em2Dxj"],
  ["levantamento romeno", "wQ2c4XD"],
  ["passada no smith", "HsjbB1z"],
  ["prancha", "VBAWRPG"],
  ["flexao de braco", "I4hDWkc"],
];

function fold(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function resolveDemoId(name: string, demoId?: string | null) {
  if (demoId) return demoId;
  const text = fold(name);
  return rules.find(([phrase]) => text.includes(phrase))?.[1];
}

export function portugueseMatchIds(query: string) {
  const text = fold(query.trim());
  if (text.length < 3) return [];
  const ids = rules.filter(([phrase]) => phrase.includes(text)).map(([, id]) => id);
  return [...new Set(ids)];
}

export function portugueseLabel(id: string) {
  const phrase = rules.find(([, ruleId]) => ruleId === id)?.[0];
  if (!phrase) return undefined;
  return phrase.replace(/(^|\s)\p{L}/gu, (letter) => letter.toUpperCase());
}
