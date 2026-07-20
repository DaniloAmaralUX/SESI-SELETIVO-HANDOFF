---
title: "'*/' acidental em comentário CSS derruba o @theme do Tailwind v4 ('Cannot apply unknown utility class border-border')"
date: 2026-07-13
problem_type: build_error
category: build-errors
track: bug
status: current
module: app
tags:
  - tailwind
  - css
  - theme
  - build
applies_when: "Ao escrever comentários em theme.css/index.css (Tailwind v4) que mencionem nomes de token com curinga, como --status-*"
---

# '*/' acidental em comentário CSS quebra o @theme

## Problem

Um comentário em `theme.css` mencionando tokens com curinga — `--status-*/--sla-*` —
contém a sequência `*/`, que **fecha o comentário CSS prematuramente**. O resto do texto
vira CSS inválido, o parser corrompe o arquivo, o bloco `@theme inline` não é registrado, e o
build falha com uma mensagem que **não aponta o comentário**.

## Symptoms

- `pnpm build` falha:
  `Error: Cannot apply unknown utility class 'border-border'` (aponta o `@apply border-border`
  do `index.css`, não o comentário real).
- `tsc` e `lint` passam — só o build de CSS (Tailwind/Lightning) quebra.
- Trocar valores de cor/fonte "não resolve" — porque o problema é o comentário, não os valores.

## What Didn't Work

- Reverter as fontes (`--font-sans`, `--font-mono`) — o erro persistiu.
- Reverter a regra `h1,h2` do `index.css` — persistiu.
- Suspeitar dos valores OKLCH — eles estão no `:root`, não afetam o registro do `@theme`.

O diagnóstico só veio ao **ler o diff** e notar a sequência `*/` dentro do comentário.

## Solution

Nunca deixe `*/` no meio de um comentário. Ao mencionar tokens com curinga, escreva sem a
barra-asterisco:

```css
/* ❌ QUEBRA: a sequência */ /* fecha o comentário aqui */
/*   ... (tokens --status-*/--sla-*) ... */

/* ✅ OK: */
/*   ... (tokens de status e SLA) ... */
```

(No exemplo acima, veja como o primeiro comentário já "vazou" — é exatamente o bug.)

## Why This Works

CSS não tem comentários aninhados: o parser fecha no **primeiro** `*/`. `--status-*/--sla-*`
contém `*/` entre `--status-*` e `--sla-*`. Remover a barra (`--status-* e --sla-*`) elimina a
sequência.

## Prevention

- Ao comentar nomes de token/classe com `*` em CSS, **não** cole um `/` logo após o `*`.
- A mensagem do Tailwind v4 (`unknown utility class border-border`) é um **sintoma** de
  `@theme` não-registrado — quando ela aparecer após editar `theme.css`, suspeite primeiro de
  **erro de parse no arquivo** (comentário mal-fechado, chave/`;` faltando), não da utility em si.
- `git diff` do arquivo CSS é o caminho mais rápido de diagnóstico.
