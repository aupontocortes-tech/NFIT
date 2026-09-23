import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "@/proxy";

function run(path: string, role?: string) {
  const req = new NextRequest(new URL(path, "http://localhost:3000"), {
    headers: role ? { cookie: `nfit_session=${role}` } : {},
  });
  return proxy(req).headers.get("location");
}

describe("proteção de rotas", () => {
  it("sem login vai para /login com ?next", () => {
    expect(run("/alunos")).toBe("http://localhost:3000/login?next=%2Falunos");
  });
  it("personal não entra na área do aluno", () => {
    expect(run("/aluno/inicio", "personal")).toBe("http://localhost:3000/dashboard");
  });
  it("aluno não entra na área do personal", () => {
    expect(run("/dashboard", "aluno")).toBe("http://localhost:3000/aluno/inicio");
  });
  it("logado não vê /login", () => {
    expect(run("/login", "personal")).toBe("http://localhost:3000/dashboard");
  });
  it("acesso permitido segue normal", () => {
    expect(run("/alunos/s-001", "personal")).toBeNull();
    expect(run("/aluno/chat", "aluno")).toBeNull();
  });
});
