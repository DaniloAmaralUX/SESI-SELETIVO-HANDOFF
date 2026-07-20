---
title: "z.coerce.date() em campo obrigatório vazio bloqueia forms com 'expected date, received Date'"
date: 2026-07-13
problem_type: logic_error
category: logic-errors
track: bug
status: current
module: app
tags:
  - zod
  - react-hook-form
  - forms
  - vagas
applies_when: "Ao usar z.coerce.date() em schemas de formulário (react-hook-form + zodResolver) onde o campo pode ficar vazio"
---

# z.coerce.date() em campo obrigatório vazio bloqueia o submit

## Problem

Um `<Input type="date">` vazio, validado por um schema Zod cujo campo é
`z.coerce.date()` **sem** `.optional()`, faz o submit falhar com a mensagem
`Invalid input: expected date, received Date` — mesmo o usuário não tendo tocado
o campo.

## Symptoms

- Form de criar Vaga não envia; a mensagem aparece sob "Data de recebimento".
- `tsc`, `lint` e `build` passam — o bug só aparece em runtime, no submit.
- A mensagem é confusa: diz `received Date` (maiúsculo) quando o campo está vazio.

## Root cause

`z.coerce.date()` executa `new Date(valor)`. Com o campo vazio, o valor chega
`undefined` (ou `''`), e `new Date(undefined)` retorna um **Invalid Date** — um
objeto que É `instanceof Date`, mas `NaN`. O Zod então reporta "esperava date,
recebeu Date" (o tipo bate, o valor é inválido). Como o campo era **obrigatório**
no schema derivado (`vagaObjectSchema.pick({ dataRecebimento: true })` herdou o
`z.coerce.date()` não-opcional do objeto base), a validação trava.

## Solution

Tornar o campo **opcional** no schema de criação, já que é um dado progressivo
(B5) — o store usa `dataAbertura` como fallback:

```ts
// schema.ts — vagaCreateSchema
.extend({
  // Progressivo: não bloqueia a criação. NÃO herdar o z.coerce.date()
  // obrigatório do objeto base via pick.
  dataRecebimento: z.coerce.date().optional(),
})
```

E no store, o fallback:

```ts
dataRecebimento: input.dataRecebimento ?? input.dataAbertura,
```

## Why This Works

`.optional()` faz o Zod pular a coerção quando o valor é `undefined`, em vez de
rodar `new Date(undefined)`. Campos de data que o usuário pode deixar vazios
**nunca** devem ser `z.coerce.date()` puro num schema de formulário.

## Prevention

- Regra: em schema de **formulário**, todo campo de data não-obrigatório é
  `z.coerce.date().optional()`. Ao derivar de um objeto base via `.pick()`,
  lembre que `pick` **preserva a obrigatoriedade** do campo original — reforce a
  opcionalidade no `.extend()`.
- Este bug não é pego por `tsc`/`build`; só por **exercitar o fluxo real** (o
  smoke no browser é a rede de segurança). Ter um smoke de submit por form.
- Teste de regressão (Vitest, direto no schema):
  ```ts
  it('aceita criação sem dataRecebimento', () => {
    expect(vagaCreateSchema.safeParse(criarMinimo).success).toBe(true)
  })
  ```
