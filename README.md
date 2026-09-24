# nfit

App Next.js para personal trainer e educação física.

```
/          Frontend Next.js (raiz do repo — deploy Vercel)
apps/api   Backend NestJS + Prisma (quando existir)
docs/      Specs e docs
```

## Rodar local

```bash
cp .env.example .env.local
npm install
npm run dev
```

`.env.local`:

```
NEXT_PUBLIC_API_BASE=http://localhost:3001/api/v1
NEXT_PUBLIC_USE_MOCK=true
```

- App: [http://localhost:3000](http://localhost:3000)
- Com `USE_MOCK=false` a API precisa estar no ar

### Seed (quando o back popular o banco)

- `personal@nfit.local` / `senha12345`
- `aluno@nfit.local` / `senha12345`

## Vercel

Root Directory: **deixe vazio** (o Next está na raiz).  
Env: `NEXT_PUBLIC_USE_MOCK=true`, `NEXT_PUBLIC_API_BASE=http://localhost:3001/api/v1`

Não commite `.env.local`.
