import { describe, expect, it } from "vitest";
import {
  findAccountByEmail,
  parsePersonalAccounts,
  type PersonalAccount,
} from "@/lib/server/personal-auth";
import { signSession, verifySession } from "@/lib/session-cookie";

describe("contas de personal", () => {
  it("migra formato legado de uma conta", () => {
    const accounts = parsePersonalAccounts({
      email: "Ana@Studio.com",
      passwordHash: "hash1",
      name: "Ana",
    });
    expect(accounts).toEqual([{ email: "ana@studio.com", passwordHash: "hash1", name: "Ana" }]);
  });

  it("lê lista com duas professoras", () => {
    const accounts = parsePersonalAccounts({
      accounts: [
        { email: "a@x.com", passwordHash: "h1", name: "A" },
        { email: "b@x.com", passwordHash: "h2" },
      ],
    });
    expect(accounts).toHaveLength(2);
    expect(findAccountByEmail(accounts, "B@X.COM")?.passwordHash).toBe("h2");
    expect(findAccountByEmail(accounts, "c@x.com")).toBeNull();
  });

  it("lista vazia bloqueia cadastro público (hasAny = false só sem contas)", () => {
    expect(parsePersonalAccounts(null)).toEqual([]);
    expect(parsePersonalAccounts({ accounts: [] })).toEqual([]);
    const one = parsePersonalAccounts({ email: "p@x.com", passwordHash: "h" });
    expect(one.length > 0).toBe(true);
  });

  it("sessão personal guarda o e-mail da professora logada", async () => {
    const token = await signSession({ role: "personal", email: "prof2@nfit.local" });
    const session = await verifySession(token);
    expect(session).toEqual({ role: "personal", email: "prof2@nfit.local" });
  });

  it("sessão personal legada sem e-mail continua válida", async () => {
    const token = await signSession({ role: "personal" });
    const session = await verifySession(token);
    expect(session?.role).toBe("personal");
    expect(session && "email" in session ? session.email : undefined).toBeUndefined();
  });

  it("login escolhe a conta certa entre duas", () => {
    const accounts: PersonalAccount[] = [
      { email: "uma@nfit.local", passwordHash: "hash-uma", name: "Uma" },
      { email: "duas@nfit.local", passwordHash: "hash-duas", name: "Duas" },
    ];
    expect(findAccountByEmail(accounts, "duas@nfit.local")?.name).toBe("Duas");
    expect(findAccountByEmail(accounts, "uma@nfit.local")?.passwordHash).toBe("hash-uma");
  });
});
