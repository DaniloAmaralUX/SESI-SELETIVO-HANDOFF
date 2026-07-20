# Handoff para desenvolvedor(a)

Guia de quem recebe o repositório para evoluir o protótipo. Leia junto com
[`../../CONTEXT.md`](../../CONTEXT.md) (vocabulário) e
[`arquitetura-de-modulos.md`](arquitetura-de-modulos.md) (padrões). Quem vai construir a **API real**
tem um guia dedicado: [handoff-backend.md](handoff-backend.md).

## O que é este código

Protótipo de alta fidelidade do **Sistema de RH / Gestão de Vagas** do SESI. **Frontend-only, dados
mockados** — não há backend, auth ou persistência reais (decisão B3 em aberto). A entrega é dupla:
protótipo para testes de UX/regras com usuárias **e** base para a implementação real. Por isso, a
**fidelidade de comportamento** (validações, filtros, estados, matriz de transições, SLA) é fiel ao
domínio — o descartável é o **dado**, nunca o código.

Stack: Vite + React 19 + TanStack Router/Query/Table + shadcn/ui + Tailwind v4 + Zod. Ver
[`stack.md`](stack.md). Roda em `app/` (`pnpm dev|test|build`).

## Mapa do domínio (tudo em `app/src/features/vagas/`)

| Camada | Arquivos | Papel |
|---|---|---|
| **Schema (fonte única)** | `data/schema.ts` | Entidade `Vaga` + enums (Status, Ação, Papel) + schemas de criar/editar, todos em **Zod**. Tipos derivam daqui. |
| **Porta de persistência** | `data/vagas-store.ts` | Store Zustand — **único ponto de mutação**. É o seam para a API real (ver abaixo). |
| **Mock** | `data/vagas.ts` | 60 vagas sintéticas (faker com seed fixa). Descartável. |
| **Regras como dado** | `data/transicoes.ts` | Matriz de transições de Status (B1) — dado remapeável, não hard-coded. |
| **Domínio puro** | `lib/sla.ts`, `lib/feriados.ts` | Motor de SLA em **dias úteis** + **feriados por Unidade** (ADR 0002). Funções puras (feriados são dado injetado), testadas direto. |
| **Papel/RBAC** | `lib/papel.ts` | Papel atual e mascaramento de campos sensíveis (LGPD). |
| **UI** | `index.tsx` (lista), `detalhe/`, `components/`, `vaga-form-page.tsx` | Telas. Leem o store via `useVagas()`/`useVaga(id)`; nunca o mock direto. |

O **painel da Gestora** está em `app/src/features/dashboard/` (`lib/indicadores.ts` = agregações puras).

## Como trocar o mock por uma API real (a porta de persistência)

Toda mutação e leitura de Vagas passa por `data/vagas-store.ts`. As telas dependem só da sua interface
(`useVagas`, `useVaga`, `criar`, `atualizar`, `mudarStatus`) — **não** do mock. Trocar por API =
reescrever **só este arquivo**, sem tocar telas.

Passos sugeridos:

1. **Servidor de estado.** O projeto já tem `@tanstack/react-query` (usado no `main.tsx`). Substitua o
   estado em memória do Zustand por hooks de Query/Mutation:
   - `useVagas()` → `useQuery({ queryKey: ['vagas'], queryFn: () => api.listarVagas() })`.
   - `useVaga(id)` → `useQuery({ queryKey: ['vagas', id], queryFn: () => api.obterVaga(id) })`.
   - `criar`/`atualizar`/`mudarStatus` → `useMutation` que chama a API e invalida `['vagas']`.
2. **Contrato de dados.** A API deve devolver objetos que passam no `vagaSchema` (`data/schema.ts`).
   Valide a resposta com `vagaSchema.array().parse(...)` na borda — o schema é a fronteira de confiança.
3. **Cálculos que ficam no cliente ou migram para o servidor.** O motor de SLA (`lib/sla.ts`) e a matriz
   B1 (`data/transicoes.ts`) são puros. Decida se `slaDiasUteis` passa a ser calculado no backend
   (recomendado, para relatórios) ou permanece no cliente. A regra de motivo-obrigatório-ao-cancelar já
   vive no schema (`superRefine`) e deve ser espelhada no servidor.
4. **Datas.** O mock usa `Date`. Numa API JSON, as datas chegam como string ISO — `z.coerce.date()` no
   schema já coage. ⚠️ Em **formulários**, campos de data opcionais devem ser `z.coerce.date().optional()`
   (ver [`../solutions/logic-errors/zod-coerce-date-campo-opcional-em-forms.md`](../solutions/logic-errors/zod-coerce-date-campo-opcional-em-forms.md)).
5. **Nada de tela muda.** Se a interface do store for preservada, lista, detalhe, form e painel continuam
   funcionando sem edição.

## Regras de negócio já implementadas (fiéis ao domínio)

- **Dois eixos independentes** (ADR 0001): Status (situação) e Ação atual (etapa) nunca se misturam.
- **Transições de Status** pela matriz B1 (`transicoes.ts`); **motivo obrigatório** ao Cancelar.
- **SLA**: 20 dias úteis, da abertura à Divulgação do resultado; feriados nacionais (inclusive móveis) +
  por Unidade; pausa aproximada nas paradas. Tempo do jurídico corre em **dias corridos**.
- **LGPD**: campos sensíveis de candidato mascarados por papel (`detalhe/campo-sensivel.tsx`); o painel
  só mostra agregados.

## Decisões em aberto (não assumir sem confirmar)

- **B3** — backend/auth/RBAC reais (reunião de arquitetura com o TI). Hoje: auth mockada, RBAC = role-switcher.
- **RBAC no `beforeLoad`** do layout `_authenticated/route.tsx` — o dado de papel existe em
  `stores/auth-store.ts`, falta aplicar o guard.
- **N1/N2** — de-para do vocabulário real (planilha) ↔ canônico 6×10. Os enums são dado remapeável.
- **Reabertura**, **feriados municipais exatos**, **baseline de SLA** — ver
  [`../product/duvidas-respostas-propostas.md`](../product/duvidas-respostas-propostas.md).

## Rodar, testar, buildar

```bash
cd app
pnpm install
pnpm dev            # dev server
pnpm test           # Vitest (browser mode); em Windows a suíte é flaky — ver docs/solutions
pnpm build          # tsc -b + build de produção
pnpm lint && pnpm format:check
```

CI na raiz (`.github/workflows/ci.yml`) roda lint/format/test/build sobre `app/`.

## Deploy na Vercel

O app está **deploy-ready**: `app/vercel.json` tem os rewrites de SPA (necessários para o roteamento
client-side do TanStack Router em deep-links). Para publicar:

**Importar o repositório (auto-deploy a cada push):**
1. Em [vercel.com/new](https://vercel.com/new) (ou no projeto já existente → **Settings → Build &
   Deployment**), defina **Root Directory = `app`**. O app vive nesse subdiretório e a **raiz do repo
   não tem `package.json`** — sem esse ajuste, o Vercel builda a raiz vazia e serve **404**.
2. Com Root Directory = `app`, o Vercel detecta **Vite + pnpm** nativamente (via `app/pnpm-lock.yaml`)
   e usa o `app/vercel.json` (rewrites de SPA para os deep-links do TanStack Router).
3. Deploy. A cada push, o Vercel refaz (preview em branches, produção na principal).

> ⚠️ **Não** tente evitar o Root Directory com um `vercel.json` na raiz que faz `cd app` — o Vercel não
> detecta o pnpm fora do subdiretório e o build falha. O caminho nativo (Root Directory = `app`) é o
> confiável.

**Opção CLI (precisa de login/token):**
```bash
cd app
npx vercel        # login interativo; ou: npx vercel --token <SEU_TOKEN>
npx vercel --prod # deploy de produção
```

O deploy exige a **conta Vercel do time** — é o único passo que depende de credencial do usuário.
