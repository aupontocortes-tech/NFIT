import Link from "next/link";
import { Button } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-bg px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-brand text-2xl font-bold text-text-inverse">
          P
        </div>
        <h1 className="text-display">nfit</h1>
        <p className="mt-2 text-body-sm text-text-muted">
          Gestão simples para personal trainers e alunos
        </p>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-3">
        <Link href="/login">
          <Button size="lg" className="w-full">
            Entrar
          </Button>
        </Link>
        <Link href="/cadastro">
          <Button size="lg" variant="secondary" className="w-full">
            Criar conta (Personal)
          </Button>
        </Link>
        <Link
          href="/dashboard"
          className="text-center text-sm text-brand hover:underline"
        >
          Ir para demo Personal →
        </Link>
        <Link
          href="/aluno"
          className="text-center text-sm text-brand hover:underline"
        >
          Ir para demo Aluno →
        </Link>
      </div>
    </div>
  );
}
