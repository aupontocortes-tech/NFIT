import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Por enquanto o app é aberto (só uso familiar) — sem login.
 * Sem cookie, assume "personal" e grava a sessão para as telas seguirem.
 * Quando voltar auth de verdade: tire OPEN_ACCESS e restaure o redirect para /login.
 */
const SESSION_COOKIE = "nfit_session";
const OPEN_ACCESS = true;

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

function withSession(request: NextRequest, role: string) {
  const res = NextResponse.next();
  res.cookies.set(SESSION_COOKIE, role, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return res;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  let role = request.cookies.get(SESSION_COOKIE)?.value;

  const isPersonalArea = PERSONAL_PREFIXES.some((p) => matches(pathname, p));
  const isAlunoArea = matches(pathname, ALUNO_PREFIX);

  if (OPEN_ACCESS) {
    if ((isPersonalArea || isAlunoArea) && !role) {
      role = isAlunoArea ? "aluno" : "personal";
      return withSession(request, role);
    }
    if (role && AUTH_ONLY_GUEST.some((p) => matches(pathname, p))) {
      return NextResponse.redirect(new URL(homeFor(role), request.url));
    }
    return NextResponse.next();
  }

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
