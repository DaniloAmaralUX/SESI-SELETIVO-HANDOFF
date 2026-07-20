# CLAUDE.md — Contrato operacional do SESI Processo Seletivo

Todo agente lê este arquivo a cada sessão. É o contrato do repositório: o que é o projeto, como rodar,
que linguagem usar e como trabalhamos (o loop Compound Engineering). Mantenha-o curto e atual.

## O que é

Sistema de RH/**Gestão de Vagas** do SESI. A entidade central é a **Vaga**. O produto vive num monorepo
simples: os **docs** e o conhecimento na raiz, o **app** (SPA React) em `app/`.

**Natureza da entrega — leia antes de codar.** Quem conduz este repo é o **designer** do projeto. A entrega
é um **protótipo de alta fidelidade com dados mockados** (deploy na **Vercel**) para testes de UX/regras com
usuários reais, **e** um **handoff para desenvolvedor(a)** — os dois ao mesmo tempo. Consequências:

- **Qualidade de código, organização e documentação são requisito de entrega.** O dev que receber o repo
  julga o trabalho pelo que encontrar. Nada de gambiarra "porque é protótipo".
- **Mock isolado e substituível.** Dados mockados vivem atrás de uma camada clara (`features/*/data/` hoje;
  porta de persistência quando crescer — arquitetura §3.4). Trocar mock por API real não pode exigir
  reescrever telas.
- **O descartável é o dado, nunca o código.** Fidelidade de comportamento (filtros, estados, validações,
  fluxos) importa porque os testes de usuário validam lógica e regras de negócio, não só aparência.
- Sem backend/auth/persistência reais neste estágio (decisão B3 em aberto) — não introduzir sem decisão.

- Fundação de produto/domínio: [`CONTEXT.md`](CONTEXT.md) (linguagem ubíqua — **fonte única de termos**),
  [`docs/product/PRD-sistema-rh-gestao-vagas.md`](docs/product/PRD-sistema-rh-gestao-vagas.md),
  [`docs/adr/`](docs/adr/) (decisões duras), [`docs/design/`](docs/design/) (IA + design system).
- Norte de arquitetura de front: [`docs/engineering/arquitetura-de-modulos.md`](docs/engineering/arquitetura-de-modulos.md).
- Stack e versões: [`docs/engineering/stack.md`](docs/engineering/stack.md).

## Como rodar (o app vive em `app/`)

```bash
cd app
pnpm install
pnpm dev            # dev server (Vite 8 / Rolldown, HMR)
pnpm build          # tsc -b + build de produção
pnpm lint           # ESLint 10
pnpm format:check   # Prettier 3 (checagem)
pnpm knip           # código/exports mortos
pnpm test           # Vitest 4 (browser mode, Playwright/chromium)
pnpm test:browser:install   # instala o chromium do Playwright (1ª vez / no CI)
```

Antes de abrir PR: `cd app && pnpm lint && pnpm format:check && pnpm test && pnpm build` devem passar.
O CI (`.github/workflows/ci.yml`, na **raiz**) roda esse mesmo conjunto sobre `app/`.

## Linguagem ubíqua (invariantes que NÃO se violam)

Use sempre os termos canônicos do [`CONTEXT.md`](CONTEXT.md). Os inegociáveis:

- **Dois eixos independentes.** Toda Vaga tem, ao mesmo tempo, um **Status** (situação: Aberta, Suspensa,
  Congelada, Cancelada, Finalizada, Arquivada) e uma **Ação atual** (uma de 10 etapas ordenadas). Eles
  **nunca se misturam** (ADR [0001](docs/adr/0001-status-e-acao-como-eixos-independentes.md)).
- **SLA pertence só à Vaga.** Meta de **20 dias úteis**; começa na abertura, congela na *Divulgação do
  resultado*; **pausa** em Suspensa/Congelada. *Tempo do gestor* e *Tempo do jurídico* são **medições, não
  SLAs** — nunca chamá-los de "SLA de X".
- **Dia útil** exclui fins de semana, feriados nacionais (inclusive móveis) e **feriados próprios da Unidade**
  (ADR [0002](docs/adr/0002-sla-dias-uteis-com-motor-de-feriados-proprio.md)). *Tempo do jurídico* corre em
  dias **corridos**.
- **Atores com login:** Recrutador/a (RH), Gestora de RH, Administrador. *Gestor solicitante* e *Jurídico*
  são **dados, não usuários**.
- **Fora do escopo:** candidato **não** é entidade gerida (sem CRUD de candidato). A Vaga guarda só campos
  (candidato selecionado, nº aplicados, banco).
- **Em aberto ⏳:** semântica de **Reabertura** (novo registro vinculado vs. reuso) — decisão de produto
  pendente; não assuma sem confirmar.
- 🔒 **LGPD:** *Gênero* é dado sensível de candidato (exige finalidade). Trate dados pessoais com cuidado.

## Convenções de código

Siga [`docs/engineering/arquitetura-de-modulos.md`](docs/engineering/arquitetura-de-modulos.md). Em resumo:

- **Módulos profundos, interface pequena.** Modelo a imitar: `app/src/hooks/use-table-url-state.ts`
  (config declarativa + dependências **injetadas** + retorno de dados, sem efeitos escondidos). Reuse os
  primitivos de `app/src/components/data-table/` e as utils puras de `app/src/lib/`.
- **Schema como fonte única.** Entidades e search params de rota derivam de **Zod** (`features/*/data/schema.ts`).
- **Domínio puro é in-process.** O motor de SLA e a matriz Status↔Ação são funções puras (feriados são
  **dado injetado**, não I/O) → testam direto no Vitest, sem mocks. Não misturar com renderização.
- **Cores por token.** Status/SLA leem tokens `--status-*` / `--sla-*` em `app/src/styles/theme.css`
  (OKLCH, dentro de `@theme`), não strings de Tailwind soltas.
- **RBAC no `beforeLoad`** do layout pathless `app/src/routes/_authenticated/route.tsx` (o dado de papel já
  existe em `stores/auth-store.ts`; falta só aplicar).
- **Teste na interface** do módulo (comportamento observável), não no estado interno. Ao aprofundar um
  módulo raso, **substitua** os testes antigos — não empilhe camadas.

## Como trabalhamos — loop Compound Engineering

O trabalho flui por **brainstorm → plan → work → simplify → review → compound**. Regras:

- **Plan-first.** Feature nasce de um plano (`/ce-brainstorm` → `/ce-plan`, salvo em `docs/plans/`) antes de
  código. Bug começa em `/ce-debug`.
- **Review antes de merge.** `/ce-code-review` no branch/PR; CI verde é obrigatório.
- **Compõe no fim.** Ao resolver algo não-óbvio, `/ce-compound` documenta o aprendizado em
  [`docs/solutions/`](docs/solutions/) — é o que faz o próximo loop começar mais esperto.
- **Isolamento.** Trabalho não-trivial em branch/worktree (`/ce-worktree`).
- **Painel atualizado.** Ao fim de cada loop, atualize [`painel/dados.js`](painel/dados.js) (retomada,
  fases, decisões, artefatos, atividade e `atualizadoEm`) — é a fonte do Painel de Controle do projeto
  ([`painel/index.html`](painel/index.html)); o HTML não se edita.
- **`CONCEPTS.md` = `CONTEXT.md`.** Este projeto **não** cria um `CONCEPTS.md` separado; o mapa de conceitos
  canônico é o [`CONTEXT.md`](CONTEXT.md). `ce-compound`/`ce-compound-refresh` devem atualizar o `CONTEXT.md`
  quando surgir vocabulário durável de domínio.
- Âncora de produto upstream: [`STRATEGY.md`](STRATEGY.md) (lida por ideate/brainstorm/plan).

### Tooling autorizado (auto-trigger)

O agente está **autorizado a executar sem pedir permissão**, quando a tarefa pedir:

- **`npx ctx7 setup --claude`** (Context7 CLI) — configurar/reparar o acesso a documentação atualizada de
  bibliotecas. Usar o Context7 (MCP ou CLI `ctx7 library`/`ctx7 docs`) sempre que precisar de API/config de
  lib (TanStack, Tailwind, Vite, etc.).
- **`npx ui-skills start`** (ui-skills.com) — iniciar a bancada de skills de UI (origem dos especialistas
  `dc-*` do Design Compound) e usar seus recursos em trabalho visual/de interface.

A autorização cobre o auto-trigger desses dois comandos e seus recursos; permanecem sujeitos ao
sandbox/permissões do harness.

## Estado atual (2026-07)

Protótipo funcional com **domínio SESI implementado** (frontend-only/mock, sem backend — B3 em aberto). O
template `shadcn-admin` foi limpo (Loop 0: sem features demo, Clerk, branding). Entregue:

- **Vagas** (`app/src/features/vagas/`): schema Zod (fonte única), lista + detalhe (dois eixos, tabs),
  **CRUD** (criar/editar via form) e **mudança de Status** pela matriz de transições B1.
- **Store mock** (`data/vagas-store.ts`) — a **porta de persistência**: único ponto de mutação; trocar mock
  por API = reescrever só este arquivo. Guia: [`docs/engineering/handoff-dev.md`](docs/engineering/handoff-dev.md).
- **Domínio puro** (`lib/`): motor de **SLA em dias úteis** + **feriados por Unidade** (ADR 0002),
  matriz de **transições B1** (`data/transicoes.ts`) — funções puras, testadas direto no Vitest.
- **Painel da Gestora de RH** (`app/src/features/dashboard/`): indicadores de SLA e pipeline (recharts),
  agregações puras (`lib/indicadores.ts`).
- **Deploy-ready** para a Vercel: `app/vercel.json` (rewrites SPA). O deploy exige a conta Vercel do
  usuário (importar o repo em vercel.com/new, Root Directory = `app`) — ver handoff.

**Pendências conhecidas:** RBAC no `beforeLoad` (papel já existe em `stores/auth-store.ts`); backend/auth
reais (B3); histórico de status real (RF16, hoje placeholder); N1/N2 do vocabulário (validação com RH).
Sequência de referência da arquitetura de módulos §5 já percorrida até persistência (mock).
