# nfit

Monorepo do **nfit** — produto para personal trainer e educação física.

```
apps/web   Frontend Next.js (Fase 1, cliente API ao vivo)
apps/api   Backend NestJS + Prisma + PostgreSQL (o time de API cuida)
docs/api   Specs OpenAPI do backend (o time de API cuida)
```

## Frontend (`apps/web`)

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

O `.env.local` precisa de:

```
NEXT_PUBLIC_API_BASE=http://localhost:3001/api/v1
NEXT_PUBLIC_USE_MOCK=false
```

- App: [http://localhost:3000](http://localhost:3000)
- JWT: o client grava o token e manda `Authorization: Bearer …`
- Com `USE_MOCK=false` a API em `apps/api` precisa estar rodando
- Swagger: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

### Escopo da Fase 1

Auth (login / cadastro / convite), dashboard, alunos, treinos (manual + rascunho IA), agenda, chat, cobranças, avaliações, área do aluno.

### Seed (quando o back popular o banco)

- `personal@nfit.local` / `senha12345`
- `aluno@nfit.local` / `senha12345`

## Backend

O Desenvolvedor Código instala o Nest em `apps/api`. Este commit de front não cria nem altera a API.

## Sem deploy

Sem pipeline de deploy e sem chaves de APIs pagas no repositório. Não commite `.env.local`.
