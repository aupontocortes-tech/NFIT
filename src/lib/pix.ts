/**
 * PIX "copia e cola" / QR Code estático (padrão BR Code do Banco Central).
 * 100% grátis: não usa banco nem gateway — o dinheiro cai direto na chave do personal.
 * Obs.: a confirmação do pagamento é manual ("Marcar como pago").
 */

export type PixKeyType = "cpf" | "cnpj" | "email" | "phone" | "random";

export type PixConfig = {
  key: string;
  /** Nome de quem recebe (até 25 caracteres, sem acento). */
  name: string;
  /** Cidade de quem recebe (até 15 caracteres, sem acento). */
  city: string;
};

const onlyDigits = (s: string) => s.replace(/\D/g, "");

export function detectPixKeyType(raw: string): PixKeyType | null {
  const key = raw.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) return "email";
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) return "random";
  if (/^\+55\d{10,11}$/.test(key.replace(/[\s()-]/g, ""))) return "phone";
  const d = onlyDigits(key);
  if (d.length === 11 && /^[\d.\-\s]+$/.test(key)) return isValidCpf(d) ? "cpf" : "phone";
  if (d.length === 14 && /^[\d./\-\s]+$/.test(key)) return "cnpj";
  if ((d.length === 10 || d.length === 11) && /^[\d()\-\s+]+$/.test(key)) return "phone";
  return null;
}

/** Deixa a chave no formato que o PIX espera. */
export function normalizePixKey(raw: string): string {
  const type = detectPixKeyType(raw);
  const key = raw.trim();
  switch (type) {
    case "cpf":
    case "cnpj":
      return onlyDigits(key);
    case "phone": {
      const d = onlyDigits(key);
      return d.startsWith("55") && d.length >= 12 ? `+${d}` : `+55${d}`;
    }
    case "email":
      return key.toLowerCase();
    case "random":
      return key.toLowerCase();
    default:
      return key;
  }
}

function isValidCpf(cpf: string) {
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

/** Remove acentos e caracteres fora do padrão. */
function clean(text: string, max: number) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 .,\-/@]/g, "")
    .trim()
    .slice(0, max);
}

function field(id: string, value: string) {
  return id + String(value.length).padStart(2, "0") + value;
}

/** CRC16-CCITT (0x1021, inicial 0xFFFF) — exigido pelo BR Code. */
export function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixPayload({
  config,
  amount,
  txid,
  description,
}: {
  config: PixConfig;
  amount?: number;
  /** Identificador da cobrança (até 25 letras/números). */
  txid?: string;
  description?: string;
}) {
  const key = normalizePixKey(config.key);
  const desc = description ? clean(description, 40) : "";
  const merchantAccount = field(
    "26",
    field("00", "br.gov.bcb.pix") + field("01", key) + (desc ? field("02", desc) : ""),
  );
  const id = (txid ?? "").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";

  const payload =
    field("00", "01") +
    merchantAccount +
    field("52", "0000") +
    field("53", "986") +
    (amount && amount > 0 ? field("54", amount.toFixed(2)) : "") +
    field("58", "BR") +
    field("59", clean(config.name, 25) || "RECEBEDOR") +
    field("60", clean(config.city, 15) || "BRASIL") +
    field("62", field("05", id)) +
    "6304";

  return payload + crc16(payload);
}
