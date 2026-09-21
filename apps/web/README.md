# nfit web (Fase 1)

Frontend Next.js App Router do **nfit** — gestão para personal trainer e alunos.

## Como rodar

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

| Variável | Padrão | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE` | `http://localhost:3001/api/v1` | Base da API Nest (`apps/api`) |
| `NEXT_PUBLIC_USE_MOCK` | `true` | `true` usa dados locais; `false` chama a API |

Não commite `.env.local`. Copie a partir de `.env.example`.

## Escopo da Fase 1

- Login por papel (personal / aluno)
- Visão geral
- Alunos (personal)
- Agenda de sessões
- Treinos
- Pagamentos / mensalidade

Fora da Fase 1: WhatsApp, push, login social, cobrança automática, deploy.

## API

- Base: `http://localhost:3001/api/v1`
- Swagger (quando o back estiver no ar): `http://localhost:3001/api/docs`

Contrato esperado pelo client (`src/lib/api.ts`):

- `POST /auth/login` → `{ accessToken, user }`
- `GET /auth/me`
- `GET /dashboard`
- `GET /students` e `GET /students/:id`
- `GET /sessions`
- `GET /workouts`
- `GET /payments`

## Seed (depois que o back popular o banco)

| Papel | E-mail | Senha |
| --- | --- | --- |
| Personal | `personal@nfit.local` | `senha12345` |
| Aluno | `aluno@nfit.local` | `senha12345` |

No mock local as mesmas contas já funcionam sem backend.
