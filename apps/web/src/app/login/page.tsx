"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Field, inputClassName } from "@/components/ui";
import { USE_MOCK } from "@/lib/env";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("personal@nfit.local");
  const [password, setPassword] = useState("senha12345");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-[#07140f] p-12 md:flex md:flex-col md:justify-between">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime-300 text-[#10210f]">
            <Dumbbell className="h-4 w-4" />
          </span>
          nfit
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-lime-300/80">Fase 1</p>
          <h1 className="mt-3 max-w-md font-[family-name:var(--font-display)] text-5xl leading-tight">
            Entre como personal ou aluno.
          </h1>
          <p className="mt-4 max-w-sm text-zinc-400">
            Seed local: <span className="text-zinc-200">personal@nfit.local</span> e{" "}
            <span className="text-zinc-200">aluno@nfit.local</span> / senha12345
          </p>
        </div>
        <p className="text-xs text-zinc-600">{USE_MOCK ? "Modo mock ativo" : "API real"}</p>
      </section>

      <section className="flex items-center justify-center px-6 py-16">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <div className="md:hidden">
            <Link href="/" className="font-[family-name:var(--font-display)] text-xl">
              nfit
            </Link>
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl">Login</h2>
          <Field label="E-mail">
            <input
              className={inputClassName()}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Senha">
            <input
              className={inputClassName()}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </Field>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-lime-300 py-2.5 text-sm font-semibold text-[#10210f] disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
          <div className="flex gap-2 text-xs text-zinc-500">
            <button type="button" onClick={() => setEmail("personal@nfit.local")} className="underline-offset-2 hover:underline">
              personal
            </button>
            <span>·</span>
            <button type="button" onClick={() => setEmail("aluno@nfit.local")} className="underline-offset-2 hover:underline">
              aluno
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
