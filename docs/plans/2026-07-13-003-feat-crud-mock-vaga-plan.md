---
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
execution: code
product_contract_source: ce-plan-bootstrap
title: "feat: CRUD mock de Vaga (form + transições de Status)"
date: 2026-07-13
depth: standard
---

# feat: CRUD mock de Vaga — Loop 2

Adiciona **criar/editar Vaga** e **mudança de Status** ao protótipo, sobre o mock isolado, sem
backend (B3 aberto). Fidelidade de comportamento (validação do schema, campos mínimos B5, matriz de
transições B1, motivo obrigatório em cancelamento) é o que os testes de usuária validam.

## Problem Frame

Hoje list e detalhe **leem o array estático** `features/vagas/data/vagas.ts`. Não há como criar/editar
Vaga nem mudar Status. Falta: (a) uma **porta de persistência** mutável (store) que substitua o array
estático sem reescrever telas (CLAUDE.md §3.4); (b) a **matriz B1 como dado** (PRD:164), não hard-coded;
(c) um **form** dirigido pelo schema Zod com os campos mínimos B5; (d) a **ação de mudar Status** com o
motivo obrigatório em cancelamento (ADR/CONTEXT + refine já no schema).

### Não-objetivos
- Sem backend/auth/persistência reais (B3). O store é **em memória** (some no reload) — é o seam para a
  API futura, não a API.
- Sem histórico real (RF16) além do placeholder atual.
- Sem importação (Fase 3) nem CRUD de candidato (fora de escopo, CONTEXT.md).

## Requirements

- **R1.** Matriz de transições de Status **como dado** (B1): Aberta→{Suspensa,Congelada,Cancelada,
  Finalizada}; Suspensa/Congelada→{Aberta,Cancelada}; Finalizada/Cancelada→Arquivada; Arquivada terminal.
- **R2.** Store mock mutável (porta de persistência) seedado do mock atual; list e detalhe passam a lê-lo.
- **R3.** Form de **criar** Vaga com os campos mínimos B5 obrigatórios; nasce `status='aberta'`,
  `acaoAtual='solicitacao-recebida'`, SLA inicia.
- **R4.** Form de **editar** os campos de negócio de uma Vaga (não o Status — esse tem ação própria).
- **R5.** Ação **mudar Status** na tela de detalhe, restrita às transições permitidas pela matriz;
  **motivo obrigatório** ao Cancelar (refine do schema).
- **R6.** Gate verde (`lint`/`format`/`tsc`/`test`/`build`); testes das partes puras (transições) diretos.

## Key Technical Decisions

- **KTD1 — Store via Zustand** (`features/vagas/data/vagas-store.ts`), seedado de `vagas`. Padrão do app
  (`stores/auth-store.ts`). É o seam de persistência: trocar por API = reescrever só o store.
- **KTD2 — Input schemas derivam do `vagaSchema`** (fonte única). `vagaCreateSchema` = `vagaSchema.pick`
  dos campos B5 + progressivos opcionais, **omitindo** os gerados pelo sistema (id, codigoVaga,
  slaDiasUteis, status, acaoAtual, dataAcao, origemDoCadastro). `react-hook-form` + `zodResolver`
  (`@hookform/resolvers` já é dep).
- **KTD3 — SLA no create é provisório.** `slaDiasUteis` = `differenceInBusinessDays(hoje, dataAbertura)`
  (date-fns, sem feriados). O Loop 3 troca pelo motor real (ADR 0002). Documentar no código.
- **KTD4 — Transições puras e testáveis.** `transicoesPermitidas(status): StatusVaga[]` lê a matriz-dado;
  sem I/O; testa direto no Vitest.
- **KTD5 — Reuso de primitivos.** Form usa `components/ui/*` (Form, Input, Select…) e as `data.tsx`
  options já existentes; nada de Tailwind solto.

## Implementation Units

### U1. Matriz de transições B1 como dado + testes
**Requirements:** R1. **Dependencies:** nenhuma.
**Files:** `app/src/features/vagas/data/transicoes.ts`, `app/src/features/vagas/data/transicoes.test.ts`.
**Approach:** `const TRANSICOES: Record<StatusVaga, StatusVaga[]>` com a matriz do PRD:164.
`transicoesPermitidas(status)` retorna o array; `podeTransicionar(de, para)` booleano.
**Test scenarios:** cada Status→destinos exatos da matriz; Arquivada→[]; `podeTransicionar` true/false;
cobre que Aberta não vai direto a Arquivada.
**Verification:** `pnpm test` verde para o arquivo.

### U2. Store mock (porta de persistência)
**Requirements:** R2. **Dependencies:** U1.
**Files:** `app/src/features/vagas/data/vagas-store.ts`.
**Approach:** Zustand store seedado de `vagas`. Estado `vagas: Vaga[]`. Ações: `criar(input)`,
`atualizar(id, patch)`, `mudarStatus(id, novo, motivo?)`. Selectors/hooks `useVagas()`, `useVaga(id)`.
`criar` gera `id` (próximo `VAGA-XXXX`), `codigoVaga` (`VG-2026-NNN`), `origemDoCadastro='manual'`,
`status='aberta'`, `acaoAtual='solicitacao-recebida'`, `dataAcao=dataAbertura`, `slaDiasUteis` (KTD3).
`mudarStatus` aplica `motivoCancelamento`/`dataEncerramento` quando cancela/finaliza; valida via matriz.
**Test scenarios:** `Test expectation: none direto — comportamento coberto via U5/telas; a lógica pura
de transição vive em U1 (testada).` (Se o store crescer, extrair reducer puro e testar.)
**Verification:** list e detalhe funcionam lendo o store (U3).

### U3. Ligar store em list e detalhe
**Requirements:** R2. **Dependencies:** U2.
**Files:** `app/src/features/vagas/index.tsx`, `app/src/features/vagas/detalhe/index.tsx`.
**Approach:** trocar `import { vagas }` por `useVagas()` / `useVaga(id)`. Detalhe usa o store também para
a vaga de origem da reabertura. Comportamento visual idêntico.
**Test scenarios:** testes existentes de list/detalhe seguem verdes (comportamento observável inalterado).
**Verification:** navegação e filtros continuam funcionando.

### U4. Form de criar/editar + rotas + botões
**Requirements:** R3, R4. **Dependencies:** U2.
**Files:** `app/src/features/vagas/components/vaga-form.tsx`,
`app/src/features/vagas/data/schema.ts` (add `vagaCreateSchema`/`vagaEditSchema`),
`app/src/routes/_authenticated/vagas/nova.tsx`, `app/src/routes/_authenticated/vagas/$vagaId.editar.tsx`,
`app/src/features/vagas/index.tsx` (botão "Nova vaga"), `app/src/features/vagas/detalhe/index.tsx` (botão "Editar").
**Approach:** `<Form>` shadcn + `zodResolver`. Campos mínimos B5 obrigatórios (chamado e/ou código,
unidade/área, gestor solicitante, cargo, tipo de contrato, recrutadora, data de abertura) + progressivos
opcionais (nível, função, motivo, PCD, observações). Selects de unidade/área/tipo usam options.
Criar → `store.criar` → navega ao detalhe. Editar → pré-preenche do store → `store.atualizar`.
**Test scenarios:** validação bloqueia submit sem campo mínimo (mensagem do Zod); criar adiciona ao store
e nasce Aberta na etapa inicial; editar persiste patch. (Teste de fumaça via browser em U5.)
**Verification:** criar e editar refletem na list/detalhe.

### U5. Ação de mudar Status + gate
**Requirements:** R5, R6. **Dependencies:** U2, U3.
**Files:** `app/src/features/vagas/detalhe/mudar-status.tsx` (novo), `app/src/features/vagas/detalhe/index.tsx`.
**Approach:** botão/menu no header do detalhe listando só `transicoesPermitidas(vaga.status)`. Ao escolher
**Cancelada**, dialog exige `motivoCancelamento` (não-vazio) antes de confirmar. Chama `store.mudarStatus`.
**Execution note:** smoke-first — validar o fluxo real no browser; a regra de motivo é do refine do schema.
**Test scenarios:** transição válida muda o badge; opções ilegais não aparecem; cancelar sem motivo é
bloqueado; cancelar com motivo grava `motivoCancelamento` e `dataEncerramento`.
**Verification:** gate `lint && format:check && tsc && test && build` verde.

## Definition of Done
- R1–R6 satisfeitos; matriz B1 e motivo-em-cancelamento fiéis ao PRD/CONTEXT.
- Store é o único ponto de mutação; trocar mock por API = reescrever só o store.
- Gate verde; um commit por unidade; PR (integração) com CI verde.

## Sources & Research
- PRD B1 (`docs/product/PRD-sistema-rh-gestao-vagas.md:164`), B5 (`:149+`).
- Premissas ativas: `docs/product/duvidas-respostas-propostas.md` (6, 8, 9).
- CONTEXT.md (dois eixos, motivo em cancelamento), CLAUDE.md §3.4 (porta de persistência).
