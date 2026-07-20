---
title: "Gotchas do tooling do app (routeTree gerado, Vitest browser-mode flaky, knip)"
date: 2026-07-13
problem_type: developer_experience
category: developer-experience
track: knowledge
status: current
module: app
tags:
  - tanstack-router
  - vitest
  - knip
  - ci
  - windows
applies_when: "Ao rodar ou depurar o portão de qualidade do app (app/), remover rotas, ou interpretar falhas de teste/knip locais vs CI"
---

# Gotchas do tooling do app

Três armadilhas do tooling do `app/` (Vite + TanStack Router + Vitest browser-mode) que confundem a
leitura do portão de qualidade. Descobertas na limpeza inicial do template shadcn-admin.
O comportamento é do
tooling, não do código — saber disso evita "corrigir" um falso problema.

## Contexto

O portão local é `pnpm lint && pnpm format:check && pnpm knip && pnpm test && pnpm build`
(CONTRIBUTING.md). Ao remover rotas/features e rodar esse portão em máquina Windows, três sinais enganam:
o `routeTree.gen.ts` fica dessincronizado, a suíte de testes falha de forma não-determinística, e o
`knip` acusa "erros" que não são regressão.

## Guidance

### 1. `routeTree.gen.ts` é gerado — regenere pelo Vite, não à mão nem por `npx tsr`

`app/src/routeTree.gen.ts` é gerado pelo plugin `@tanstack/router-plugin/vite` (ver `vite.config.ts`).
Ao **adicionar/remover arquivos de rota**, ele precisa ser regenerado, senão o `tsc -b` do build falha
apontando rotas inexistentes.

- **Não** existe `@tanstack/router-cli` instalado. `npx tsr generate` baixa o pacote **errado**
  (`tsr`, um detector de exports não-usados) e quebra com `Cannot read properties of undefined
  (reading 'readFile')`.
- **Forma correta:** rodar o dev brevemente para o plugin regenerar o arquivo:
  ```bash
  cd app && timeout 25 pnpm dev   # o plugin reescreve routeTree.gen.ts no startup
  ```
  Depois confirme (`git status src/routeTree.gen.ts` muda) e rode `npx tsc -b` para validar.

### 2. Vitest browser-mode é flaky no Windows — uma run limpa é a verdade; o CI Linux é o árbitro

`pnpm test` roda em **browser mode** (Playwright/chromium). Em Windows, ele falha de forma
**não-determinística**: os erros **mudam a cada execução** e vivem sempre na camada de tooling, nunca
em asserções do código:

- `TypeError: Cannot read properties of null (reading 'useState')` no `input-otp` (corrida do
  optimize-deps do Vite);
- `Vitest failed to find the runner`;
- `error when mocking a module` (hoisting de `vi.mock`);
- erros no `RouteHandler` do playwright-core.

**Como ler isso:** rode a suíte 1–2 vezes; **uma run limpa passa 103/103, 17/17**. Se os erros mudam
entre runs, é flakiness de ambiente, não regressão. O **CI (Linux)** é estável e é o árbitro real —
sempre abra PR e confie no CI para o veredito de testes. Limpar `node_modules/.vite` ajuda quando o
cache de deps otimizadas está corrompido, mas pode gerar uma primeira run "runner not found".

### 3. `knip` está desligado no CI e seu `ignore` não governa exports mortos

O passo `pnpm knip` está **comentado** no CI (`.github/workflows/ci.yml`) — não é gate bloqueante.
Além disso, o campo `ignore` do `knip.config.ts` governa **arquivos** mortos, **não exports** mortos.
Por isso o `knip` lista exports não-usados das libs `src/components/ui/**` e `src/components/data-table/**`
mesmo estando no `ignore` — é ruído **pré-existente** de manter bibliotecas de componentes com a
superfície de API completa (verificável: os mesmos exports já eram não-usados no commit base).

**Como agir:** ao rodar `knip`, separe o ruído pré-existente do que **você** orfanou. Confirme com
`git grep` no commit base se um export/arquivo já era não-usado antes. Só remova o que a sua mudança
tornou morto (ex.: ao remover a feature `apps`, as `brand-icons` que só ela usava ficaram órfãs —
`IconGithub`/`IconFacebook` seguem em uso pelas telas de auth, o resto foi deletado).

## Why This Matters

Sem esse mapa, um agente "corrige" um falso problema: edita o `routeTree.gen.ts` à mão (que será
sobrescrito), trata a flakiness de teste como bug de código e reverte mudanças boas, ou tenta zerar o
`knip` deletando exports de biblioteca que o handoff quer manter. Os três sinais são do tooling/ambiente,
não do código — e o CI Linux é a fonte de verdade do gate de testes.

## When to Apply

- Ao remover ou renomear rotas em `app/src/routes/**` (gatilho do #1).
- Ao ver falhas de `pnpm test` que **mudam entre execuções** em Windows (gatilho do #2).
- Ao interpretar a saída de `pnpm knip`, especialmente após remover features/arquivos (gatilho do #3).

## Examples

```bash
# Fluxo ao remover rotas/features:
cd app
git rm -r src/features/apps src/routes/_authenticated/apps   # remove
timeout 25 pnpm dev                                            # regenera routeTree.gen.ts
npx tsc -b                                                     # valida tipos/rotas
pnpm test; pnpm test                                          # 1–2 runs; espere uma verde limpa
pnpm build                                                     # gate determinístico (confiável local)
# knip: só investigue o que a remoção orfanou; ruído de ui/** e data-table/** é pré-existente
```
