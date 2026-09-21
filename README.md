# nfit

Monorepo do **nfit** — produto para personal trainer e educação física.

```
apps/web   Frontend Next.js (Fase 1) — este pacote
apps/api   Backend NestJS + Prisma + PostgreSQL (o time de API cuida)
docs/api   Specs OpenAPI do backend (o time de API cuida)
```

Não há API neste commit de front. `apps/api` e `docs/api` ficam reservados para o backend.

## Frontend (Fase 1)

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000)
- API base: `NEXT_PUBLIC_API_BASE=http://localhost:3001/api/v1`
- Mock: `NEXT_PUBLIC_USE_MOCK=true` (padrão) — não precisa do backend para abrir a UI

### Escopo da Fase 1

Login (personal / aluno), dashboard, alunos, agenda, treinos e pagamentos.

### Contas seed (quando o back popular o banco)

- `personal@nfit.local` / `senha12345`
- `aluno@nfit.local` / `senha12345`

As mesmas contas funcionam no mock local.

Swagger da API (quando `apps/api` estiver no ar): [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

## Backend

O Desenvolvedor Código instala o Nest em `apps/api`. Não crie nem altere a API a partir do front.

## Sem deploy

Este repositório não inclui pipeline de deploy nem chaves de APIs pagas.
