# nfit web (Fase 1)

App web MVP para personal trainers e alunos.  
Stack: **Next.js App Router + React + TypeScript + Tailwind CSS**. Idioma da UI: **pt-BR**.

Cliente **ligado na API ao vivo** (`NEXT_PUBLIC_USE_MOCK=false`): fetch em `NEXT_PUBLIC_API_BASE` com **JWT Bearer** no `localStorage` (`nfit_token`).

## Como rodar

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

O `.env.local` precisa de:

```
NEXT_PUBLIC_API_BASE=http://localhost:3001/api/v1
NEXT_PUBLIC_USE_MOCK=false
```

Não commite `.env.local`. Copie a partir de `.env.example`.

Com `USE_MOCK=false` o backend Nest (`apps/api`) deve estar no ar (Swagger: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)).  
`USE_MOCK=true` usa dados locais em `src/lib/mocks.ts` (útil sem API).

```bash
npm run build   # deve passar
```

## Seed (quando o back popular o banco)

| Papel | E-mail | Senha |
| --- | --- | --- |
| Personal | `personal@nfit.local` | `senha12345` |
| Aluno | `aluno@nfit.local` | `senha12345` |

## Types a partir do OpenAPI

Os tipos em `src/types/api.d.ts` vêm do contrato OpenAPI:

```bash
npx openapi-typescript ../../docs/api/openapi.yaml -o src/types/api.d.ts
# ou apps/api/openapi.yaml, quando o back existir
```

Não edite `api.d.ts` à mão — regenere quando o contrato mudar.

## Mapa de rotas

### Auth `(auth)`
| Rota | Descrição |
|------|-----------|
| `/login` | Login Personal ou Aluno |
| `/cadastro` | Cadastro Personal |
| `/esqueci-senha` | Solicitar reset |
| `/redefinir-senha` | Nova senha |
| `/aceitar-convite` | Primeiro acesso do aluno |

### Personal `(personal)` — sidebar md+ / bottom nav mobile
| Rota | Descrição |
|------|-----------|
| `/dashboard` | Resumo e atalhos |
| `/alunos` | Lista |
| `/alunos/novo` | Criar aluno |
| `/alunos/[id]` | Detalhe (tabs) |
| `/alunos/[id]/editar` | Editar |
| `/alunos/[id]/avaliacoes/nova` | Nova avaliação |
| `/treinos` | Lista / filtros |
| `/treinos/novo` | Criar manual |
| `/treinos/[id]` | Ver/editar |
| `/treinos/[id]/atribuir` | Atribuir a alunos |
| `/treinos/gerar` | Prompt IA |
| `/treinos/gerar/rascunho` | Revisar rascunho IA |
| `/agenda` | Eventos |
| `/chat` · `/chat/[alunoId]` | Inbox e thread |
| `/cobrancas` · `/nova` · `/[id]` | Cobranças UI |
| `/avaliacoes` | Atalho avaliações |
| `/configuracoes` | Perfil e logout |

### Aluno `(aluno)` — bottom nav
| Rota | Descrição |
|------|-----------|
| `/aluno` · `/aluno/inicio` | Treino do dia |
| `/aluno/treino/[atribuicaoId]` | Execução |
| `/aluno/treino/[atribuicaoId]/resumo` | Pós-treino |
| `/aluno/agenda` | Eventos (leitura) |
| `/aluno/chat` | Chat com personal |
| `/aluno/evolucao` | Gráfico / peso |
| `/aluno/pagamentos` | Cobranças do aluno |
| `/aluno/perfil` | Conta e logout |

## Design system

Tokens em `src/app/globals.css` (brand teal `#0D9488`).

## Demo

- Home → atalhos de login
- Seed: `personal@nfit.local` / `aluno@nfit.local` — senha `senha12345`

“Gerar com IA” só envia o prompt à API; o rascunho nunca é publicado automaticamente.
