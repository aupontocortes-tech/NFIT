import { describe, expect, it } from "vitest";
import {
  isPhoneBR,
  parseMoneyBR,
  passwordProblem,
  validateInvoice,
  validateSignup,
  validateStudent,
} from "@/lib/validators";

describe("validações", () => {
  it("valor em reais", () => {
    expect(parseMoneyBR("350")).toBe(350);
    expect(parseMoneyBR("350,50")).toBe(350.5);
    expect(parseMoneyBR("1.234,56")).toBe(1234.56);
    expect(parseMoneyBR("R$ 99,90")).toBe(99.9);
    expect(parseMoneyBR("abc")).toBeNaN();
  });

  it("telefone BR", () => {
    expect(isPhoneBR("(11) 99999-9999")).toBe(true);
    expect(isPhoneBR("+55 11 99999-9999")).toBe(true);
    expect(isPhoneBR("")).toBe(true);
    expect(isPhoneBR("123")).toBe(false);
  });

  it("senha", () => {
    expect(passwordProblem("curta1")).toBeTruthy();
    expect(passwordProblem("somenteletras")).toBeTruthy();
    expect(passwordProblem("senha12345")).toBeNull();
  });

  it("aluno", () => {
    expect(validateStudent({ name: "A", email: "x", phone: "1" })).toMatchObject({
      name: expect.any(String),
      email: expect.any(String),
      phone: expect.any(String),
    });
    expect(validateStudent({ name: "Carlos", email: "c@x.com", phone: "" })).toEqual({});
  });

  it("cobrança", () => {
    const ok = validateInvoice(
      { studentId: "s-1", description: "Mensalidade", amount: "350", dueDate: "2026-10-10" },
      "2026-09-23",
    );
    expect(ok).toEqual({});
    const bad = validateInvoice(
      { studentId: "", description: "", amount: "0", dueDate: "2026-01-01" },
      "2026-09-23",
    );
    expect(Object.keys(bad).sort()).toEqual(["amount", "description", "dueDate", "studentId"]);
  });

  it("cadastro", () => {
    expect(
      validateSignup({ name: "Ana", email: "a@b.co", password: "senha12345", confirm: "x" }).confirm,
    ).toBeTruthy();
  });
});
