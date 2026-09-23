import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proteção de rotas.
 * - Sem login → manda para /login (guardando a página em ?next=)
 * - Personal tentando abrir área do aluno (e vice-versa) → manda para a home dele
 * - Já logado abrindo /login ou /cadastro → manda para a home dele
 *
 * O cookie "nfit_session" é gravado pelo api.ts no login e apagado no logout.
 * Obs.: é uma proteção de navegação; a segurança real dos dados é o JWT validado pela API.
 */
const SESSION_COOKIE = "nfit_session";

const PERSONAL_PREFIXES = [
  "/dashboard",
  "/alunos",
  "/treinos",
  "/agenda",
  "/chat",
  "/cobrancas",
  "/avaliacoes",
  "/configuracoes",
];
const ALUNO_PREFIX = "/aluno";
const AUTH_ONLY_GUEST = ["/login", "/cadastro"];

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

function homeFor(role: string) {
  return role === "aluno" ? "/aluno/inicio" : "/dashboard";
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const role = request.cookies.get(SESSION_COOKIE)?.value;

  const isPersonalArea = PERSONAL_PREFIXES.some((p) => matches(pathname, p));
  const isAlunoArea = matches(pathname, ALUNO_PREFIX);

  if (isPersonalArea || isAlunoArea) {
    if (!role) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
    if ((isPersonalArea && role !== "personal") || (isAlunoArea && role !== "aluno")) {
      return NextResponse.redirect(new URL(homeFor(role), request.url));
    }
    return NextResponse.next();
  }

  if (role && AUTH_ONLY_GUEST.some((p) => matches(pathname, p))) {
    return NextResponse.redirect(new URL(homeFor(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/alunos/:path*",
    "/treinos/:path*",
    "/agenda/:path*",
    "/chat/:path*",
    "/cobrancas/:path*",
    "/avaliacoes/:path*",
    "/configuracoes/:path*",
    "/aluno/:path*",
    "/login",
    "/cadastro",
  ],
};
