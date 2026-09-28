import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "@/proxy";
import { signSession } from "@/lib/session-cookie";

async function run(path: string, role?: "personal" | "aluno") {
  const headers = new Headers();
  if (role) {
    const token = await signSession(
      role === "aluno" ? { role: "aluno", studentId: "aluno-1" } : { role: "personal" },
    );
    headers.set("cookie", `nfit_session=${token}`);
  }
  const req = new NextRequest(new URL(path, "http://localhost:3000"), { headers });
  return proxy(req);
}

describe("acesso com senha", () => {
  it("sem cookie na área personal vai para o login", async () => {
    const res = await run("/alunos");
    expect(res.headers.get("location")).toBe("http://localhost:3000/login?next=%2Falunos");
  });
  it("sem cookie na área aluno vai para o login", async () => {
    const res = await run("/aluno/inicio");
    expect(res.headers.get("location")).toBe("http://localhost:3000/login?next=%2Faluno%2Finicio");
  });
  it("cookie falso não entra", async () => {
    const req = new NextRequest(new URL("/dashboard", "http://localhost:3000"), {
      headers: { cookie: "nfit_session=personal" },
    });
    expect((await proxy(req)).headers.get("location")).toContain("/login");
  });
  it("com sessão de personal em /login vai pro dashboard", async () => {
    expect((await run("/login", "personal")).headers.get("location")).toBe("http://localhost:3000/dashboard");
  });
  it("o convite do aluno abre mesmo com sessão da personal", async () => {
    expect((await run("/convite", "personal")).headers.get("location")).toBeNull();
    expect((await run("/convite")).headers.get("location")).toBeNull();
  });
  it("já com sessão personal segue normal", async () => {
    expect((await run("/alunos/s-001", "personal")).headers.get("location")).toBeNull();
  });
});
