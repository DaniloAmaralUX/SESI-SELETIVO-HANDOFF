---
title: "Porta de persistência: um store como único seam de mutação para trocar mock por API sem tocar telas"
date: 2026-07-13
problem_type: architecture_pattern
category: architecture-patterns
track: knowledge
status: current
module: app
tags:
  - arquitetura
  - zustand
  - mock
  - persistencia
  - vagas
applies_when: "Ao construir um protótipo mockado que também é handoff para dev — quando o mock precisa ser substituível por API real sem reescrever a UI"
---

# Porta de persistência: mock substituível por API

## Context

O protótipo é entregue **junto** como base para a implementação real (handoff). O CLAUDE.md exige que o
mock seja "isolado e substituível": trocar dados mockados por API real **não pode exigir reescrever
telas**. Sem uma fronteira clara, as telas importam o array mockado direto (`import { vagas }`) e cada
uma vira um ponto de acoplamento ao mock.

## Guidance

Concentre **toda leitura e mutação** da entidade num único módulo — a **porta de persistência** — e faça
as telas dependerem só da interface dele, nunca do mock.

- Store Zustand `data/vagas-store.ts` expõe: `useVagas()`, `useVaga(id)`, `criar`, `atualizar`,
  `mudarStatus`. O estado é seedado do mock (`vagas.ts`), mas as telas **não** conhecem o mock.
- As telas trocam `import { vagas }` por `const vagas = useVagas()`. Comportamento visual idêntico, agora
  reativo às mutações.
- Trocar mock por API = reescrever **só o store** (ex.: `useVagas` vira `useQuery`, `criar` vira
  `useMutation` que invalida a query). Nenhuma tela muda.
- Regras de negócio ficam **fora** do store, em módulos puros injetáveis (matriz de transições, motor de
  SLA) — o store só orquestra. Isso mantém as regras testáveis sem tocar em estado/UI.

## Why This Matters

O ponto de acoplamento ao mock passa de N (uma por tela) para **1** (o store). O handoff fica trivial: o
dev reescreve um arquivo com contrato conhecido. E o schema Zod (`data/schema.ts`) é a fronteira de
confiança — a resposta da API é validada com `vagaSchema.parse` na borda do store, então a UI nunca vê
dado fora do contrato.

## When to Apply

- Protótipo mockado que também é handoff/base para produção.
- Qualquer feature onde a fonte de dados vai mudar (mock → API, ou uma API por outra) e você quer isolar
  o impacto.
- **Não** aplique para dado verdadeiramente estático e imutável (ex.: options de enum) — aí o array
  direto é mais simples.

## Examples

```ts
// ANTES — tela acoplada ao mock:
import { vagas } from './data/vagas'
export function Vagas() {
  return <VagasTable data={vagas} />
}

// DEPOIS — tela lê a porta de persistência:
import { useVagas } from './data/vagas-store'
export function Vagas() {
  const vagas = useVagas()      // hoje: mock em memória; amanhã: useQuery(API)
  return <VagasTable data={vagas} />
}

// O store é o ÚNICO ponto de mutação:
mudarStatus: (id, novo, motivo) =>
  set((s) => ({ vagas: s.vagas.map((v) =>
    v.id === id && podeTransicionar(v.status, novo)   // regra pura, injetada
      ? { ...v, status: novo, ...(novo === 'cancelada' ? { motivoCancelamento: motivo } : {}) }
      : v) })),
```

Ver [`../../engineering/handoff-dev.md`](../../engineering/handoff-dev.md) para o passo-a-passo da troca
mock → API.
