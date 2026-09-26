import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "@/proxy";

function run(path: string, role?: string) {
  const req = new NextRequest(new URL(path, "http://localhost:3000"), {
    headers: role ? { cookie: `nfit_session=${role}` } : {},
  });
  return proxy(req);
}

describe("acesso aberto (sem login)", () => {
  it("sem cookie na área personal segue e grava sessão", () => {
    const res = run("/alunos");
    expect(res.headers.get("location")).toBeNull();
    expect(res.cookies.get("nfit_session")?.value).toBe("personal");
  });
  it("sem cookie na área aluno segue e grava sessão aluno", () => {
    const res = run("/aluno/inicio");
    expect(res.headers.get("location")).toBeNull();
    expect(res.cookies.get("nfit_session")?.value).toBe("aluno");
  });
  it("com cookie de personal em /login vai pro dashboard", () => {
    expect(run("/login", "personal").headers.get("location")).toBe(
      "http://localhost:3000/dashboard",
    );
  });
  it("o convite do aluno abre mesmo com sessão da personal", () => {
    expect(run("/convite", "personal").headers.get("location")).toBeNull();
    expect(run("/convite").headers.get("location")).toBeNull();
  });
  it("já com sessão personal segue normal", () => {
    expect(run("/alunos/s-001", "personal").headers.get("location")).toBeNull();
  });
});
