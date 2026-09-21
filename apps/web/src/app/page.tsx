"use client";

import Link from "next/link";
import { ArrowRight, Dumbbell } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function HomePage() {
  const { user, ready } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(214,255,75,0.16),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.08),_transparent_36%)]" />
      <header className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime-300 text-[#10210f]">
            <Dumbbell className="h-4 w-4" />
          </span>
          <span className="font-[family-name:var(--font-display)] text-xl tracking-tight">nfit</span>
        </div>
        <Link href={ready && user ? "/dashboard" : "/login"} className="text-sm text-zinc-300 hover:text-white">
          Entrar
        </Link>
      </header>

      <main className="relative mx-auto max-w-5xl px-6 pb-24 pt-16 md:pt-24">
        <p className="text-xs uppercase tracking-[0.28em] text-lime-300/80">Fase 1</p>
        <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-5xl leading-[1.05] tracking-tight md:text-7xl">
          Studio do personal, no ritmo do aluno.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-400">
          Login por papel, alunos, agenda, treinos e mensalidades. Roda com mock local ou contra a API Nest em
          <code className="mx-1 rounded bg-white/5 px-1.5 py-0.5 text-sm text-lime-200">/api/v1</code>.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-5 py-2.5 text-sm font-semibold text-[#10210f]"
          >
            Abrir o app <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="http://localhost:3001/api/docs"
            className="inline-flex items-center rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-300"
          >
            Swagger da API
          </a>
        </div>
      </main>
    </div>
  );
}
