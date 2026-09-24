import { describe, expect, it } from "vitest";
import { buildPixPayload, crc16, detectPixKeyType, normalizePixKey } from "@/lib/pix";

describe("PIX", () => {
  it("CRC16 segue o padrão CCITT-FALSE", () => {
    expect(crc16("123456789")).toBe("29B1");
  });

  it("detecta o tipo da chave", () => {
    expect(detectPixKeyType("123.456.789-09")).toBe("cpf");
    expect(detectPixKeyType("12.345.678/0001-95")).toBe("cnpj");
    expect(detectPixKeyType("ana@nfit.dev")).toBe("email");
    expect(detectPixKeyType("(11) 98765-4321")).toBe("phone");
    expect(detectPixKeyType("123e4567-e89b-12d3-a456-426614174000")).toBe("random");
    expect(detectPixKeyType("abc")).toBeNull();
  });

  it("normaliza celular com +55", () => {
    expect(normalizePixKey("(11) 98765-4321")).toBe("+5511987654321");
  });

  it("gera payload válido com valor, nome sem acento e CRC correto", () => {
    const p = buildPixPayload({
      config: { key: "ana@nfit.dev", name: "Ana Souza", city: "Brasília" },
      amount: 350,
      txid: "inv-001",
      description: "Mensalidade",
    });
    expect(p.startsWith("000201")).toBe(true);
    expect(p).toContain("br.gov.bcb.pix");
    expect(p).toContain("5406350.00");
    expect(p).toContain("6008Brasilia");
    expect(p).toContain("0506inv001");
    const body = p.slice(0, -4);
    expect(crc16(body)).toBe(p.slice(-4));
  });
});
