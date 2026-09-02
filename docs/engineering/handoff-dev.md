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
- **Rascunho** (revisão set/2026): a vaga nasce em `rascunho` e o SLA **só começa** em `rascunho → aberta`,
  transição que re-carimba `dataAbertura`/`dataAcao`. `rascunho → cancelada` preserva a data digitada —
  a distinção está coberta por teste em `data/vagas-store.test.ts`.
- **Observações por etapa** (revisão set/2026): trilha **append-only** por vaga, até 500 caracteres
  (`OBSERVACAO_MAX_CHARS`), validada na porta de persistência. Cada registro vira evento `observacao` no
  histórico e sai na exportação CSV. Não há edição nem remoção.
- **SLA**: 20 dias úteis, da abertura à Divulgação do resultado; feriados nacionais (inclusive móveis) +
  por Unidade; pausa aproximada nas paradas. Tempo do jurídico corre em **dias úteis** (revisão set/2026).
- **LGPD**: campos sensíveis de candidato mascarados por papel (`detalhe/campo-sensivel.tsx`); o painel
  só mostra agregados.

## Autenticação — como funciona hoje (mock) e o que a real deve cumprir

**Não há autenticação real no protótipo — é proposital.** O provedor de auth é a decisão **B3, em
aberto** (reunião de arquitetura com o TI: SSO do SESI vs. solução própria). Não procure integração
com provedor no código; o que existe é um mock funcional:

- **Login** (`app/src/features/auth/sign-in/`): o form valida os campos e grava um **token fake** —
  não há chamada a servidor. Qualquer credencial "entra".
- **Sessão** (`app/src/stores/auth-store.ts`): store Zustand que guarda usuário + token (persistido
  em cookie). É o **seam da auth real** — a troca acontece aqui, sem mexer nas telas.
- **Proteção de rota** (`app/src/routes/_authenticated/route.tsx`): layout pathless com `beforeLoad`;
  sem token → redireciona ao login preservando o destino. O **papel** (`role`) já existe no store,
  mas o RBAC fino por rota ainda não é aplicado (pendência abaixo).
- **Papéis no protótipo**: um *role-switcher* simula os 3 papéis (`recrutadora`, `gestora-rh`,
  `admin`) para testar o mascaramento LGPD (`lib/papel.ts`).

**O que o front já espera da auth real** (detalhes em
[handoff-backend.md § Autenticação e RBAC](handoff-backend.md) e [contrato-api.md](contrato-api.md)):
`Authorization: Bearer <token>`; `401` → redirecionar ao login; `403` → papel sem permissão; regra
**B7** (só `admin` vê/exporta dados sensíveis de candidato); o `por` da auditoria deriva do usuário
autenticado **no servidor**.

## Decisões em aberto (não assumir sem confirmar)

- **B3** — backend/auth/RBAC reais (reunião de arquitetura com o TI). Hoje: auth mockada, RBAC = role-switcher.
- **RBAC no `beforeLoad`** do layout `_authenticated/route.tsx` — o dado de papel existe em
  `stores/auth-store.ts`, falta aplicar o guard.
- **N1/N2** — de-para do vocabulário real (planilha) ↔ canônico 7×10. Os enums são dado remapeável.
- **Reabertura**, **feriados municipais exatos**, **baseline de SLA** — ver
  [`../product/duvidas-respostas-propostas.md`](../product/duvidas-respostas-propostas.md).

## Material de registry — leia antes de ligar um componente novo

`app/src/components/iconiq/` (119 componentes) e `app/src/components/react-bits/`
são **material de terceiros baixado sob demanda**, não código do projeto. Essas
duas pastas, mais `components/ui/`, estão fora do **ESLint**, do **Knip** e do
`include` do `tsconfig.app.json` — na prática, **o gate de qualidade não enxerga
esse código**. Um componente ligado às pressas passa no `pnpm build` e quebra no
browser.

Antes de ligar qualquer componente dessas pastas:

1. **Chamadas de rede.** Alguns buscam dados em serviços de terceiros — hoje
   `contribution-graph.tsx` (`github-contributions-api.jogruber.de`) e os que
   montam favicon via `google.com/s2/favicons` e `icons.duckduckgo.com`. Este é
   um sistema que trata dados de candidatos sob LGPD: ligar um desses é decisão
   consciente, não descuido.
2. **`process.env`.** Não existe `process` no browser com Vite. Todo o material
   já foi saneado para `import.meta.env.MODE`, mas componentes baixados depois
   voltam a trazer o padrão do Next.js.
3. **Cores hard-coded.** O projeto usa OKLCH + tokens; hexadecimal solto fura o
   tema claro/escuro e a identidade SESI.
4. **Rodar o gate depois:** `pnpm lint && pnpm build && pnpm test`.

A proveniência e a situação de licença de cada bloco estão em
[`../../NOTICE.md`](../../NOTICE.md) — inclui duas pendências para o jurídico.

## Camadas de CSS (a ordem importa)

`app/src/styles/index.css` empilha, nesta ordem:

1. `@import './theme.css'` — paleta SESI e os tokens de domínio
   `--status-*` / `--sla-*`;
2. o `:root` / `.dark` do preset shadcn `bLFpNRU7U`, que **redeclara `:root` e
   por isso vence o theme.css**;
3. a **camada de marca**, no fim do arquivo, que devolve os tokens azuis do SESI
   por cima do preset.

Sem o passo 3 o app fica com o azul genérico do preset e o `theme.css` vira
código morto. Ao aplicar um preset novo, reconferir se a camada de marca
continua **depois** do bloco do preset.

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
