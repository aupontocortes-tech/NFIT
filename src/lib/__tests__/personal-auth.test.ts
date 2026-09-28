import { describe, expect, it } from "vitest";
import {
  findAccountByEmail,
  parsePersonalAccounts,
  type PersonalAccount,
} from "@/lib/server/personal-auth";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { signSession, verifySession } from "@/lib/session-cookie";

/** Espelha a regra do PUT /api/auth/login: setup público só se não houver nenhuma personal. */
function publicSetupBlocked(accounts: PersonalAccount[]) {
  return accounts.length > 0;
}

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

  it("cadastro público (PUT setup) bloqueado se já existe alguma personal", () => {
    expect(publicSetupBlocked(parsePersonalAccounts(null))).toBe(false);
    expect(publicSetupBlocked(parsePersonalAccounts({ accounts: [] }))).toBe(false);
    expect(
      publicSetupBlocked(parsePersonalAccounts({ email: "p@x.com", passwordHash: "h" })),
    ).toBe(true);
    expect(
      publicSetupBlocked(
        parsePersonalAccounts({
          accounts: [
            { email: "a@x.com", passwordHash: "h1" },
            { email: "b@x.com", passwordHash: "h2" },
          ],
        }),
      ),
    ).toBe(true);
  });

  it("login com 2 personais: cada e-mail autentica só a própria senha", async () => {
    const hashUma = await hashPassword("senhaUma123");
    const hashDuas = await hashPassword("senhaDuas123");
    const accounts: PersonalAccount[] = [
      { email: "uma@nfit.local", passwordHash: hashUma, name: "Uma" },
      { email: "duas@nfit.local", passwordHash: hashDuas, name: "Duas" },
    ];

    const uma = findAccountByEmail(accounts, "uma@nfit.local");
    const duas = findAccountByEmail(accounts, "duas@nfit.local");
    expect(uma).toBeTruthy();
    expect(duas).toBeTruthy();

    expect(await verifyPassword("senhaUma123", uma!.passwordHash)).toBe(true);
    expect(await verifyPassword("senhaDuas123", duas!.passwordHash)).toBe(true);
    expect(await verifyPassword("senhaUma123", duas!.passwordHash)).toBe(false);
    expect(await verifyPassword("senhaDuas123", uma!.passwordHash)).toBe(false);
    expect(findAccountByEmail(accounts, "terceira@nfit.local")).toBeNull();
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
});
