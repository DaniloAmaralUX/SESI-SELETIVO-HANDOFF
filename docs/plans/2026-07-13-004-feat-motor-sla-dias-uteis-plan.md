---
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
execution: code
product_contract_source: ce-plan-bootstrap
title: "feat: Motor de SLA em dias úteis com feriados por Unidade"
date: 2026-07-13
depth: standard
---

# feat: Motor de SLA em dias úteis — Loop 3

Implementa o **motor próprio** do ADR 0002: dias úteis com **tabela de feriados por Unidade**
(nacionais fixos + móveis via Páscoa + locais), tudo como **dado injetado** (funções puras,
testáveis direto), e substitui o `slaDiasUteis` mockado (faker) por **cálculo real** sobre as datas.

## Problem Frame

Hoje `slaDiasUteis` é um número aleatório (faker) e `lib/sla.ts` só tem a severidade. O ADR 0002
exige contar **dias úteis** (excluindo fins de semana e feriados) com motor próprio, feriados
**variando por Unidade** (as 6 Unidades são municípios de PE), incluindo nacionais móveis
(Carnaval, Sexta-feira Santa, Corpus Christi). SLA da Vaga corre em dias úteis, da abertura à
Divulgação do resultado (congela lá); pausa em Suspensa/Congelada. Tempo do jurídico é dias corridos.

### Não-objetivos
- Sem tela de admin de feriados (ADR nota como funcionalidade futura). A tabela é dado no código.
- Sem histórico de suspensões: a pausa é **aproximada** congelando no `dataAcao` da vaga parada.
- Não mexer no Tempo do jurídico (já é dias corridos no detalhe).

## Requirements

- **R1.** Módulo de feriados puro: nacionais fixos + móveis (via Páscoa/Butcher) + locais por Unidade,
  como dado injetável. `feriadosDaUnidade(unidade, ano)`.
- **R2.** `diasUteis(inicio, fim, feriados)` puro: conta dias úteis (exclui sábados, domingos, feriados).
- **R3.** `calcularSlaDiasUteis(vaga, feriados)`: da abertura ao ponto de congelamento
  (Divulgação do resultado → senão encerramento → senão dataAcao). Pausa aproximada por congelar no
  dataAcao das paradas.
- **R4.** Mock (`vagas.ts`) passa a computar `slaDiasUteis` pelo motor; store `criar` usa o motor
  (abertura → hoje) com os feriados da Unidade.
- **R5.** Testes diretos (Vitest, sem mocks): Páscoa/móveis 2026, exclusão de feriado, contagem,
  por Unidade. Gate verde.

## Key Technical Decisions

- **KTD1 — Feriados como dado, motor puro.** Feriados são `Date[]` calculados/tabela; `diasUteis` e
  `calcularSla` são funções puras → testam sem I/O (arquitetura §domínio puro in-process).
- **KTD2 — Páscoa via algoritmo de Butcher** (Meeus/Gregoriano). Carnaval (seg/ter = Páscoa−48/−47),
  Sexta-feira Santa (−2), Corpus Christi (+60).
- **KTD3 — Congelamento como modelo de pausa.** Sem histórico de status, o ponto de congelamento
  (Divulgação → encerramento → dataAcao) modela tanto o "congela na divulgação" quanto a pausa em
  Suspensa/Congelada (o dataAcao não avança quando parada). Documentar a aproximação.
- **KTD4 — Unidades de PE.** Locais: Data Magna de PE (06/03) para todas + um feriado municipal
  plausível por Unidade. Dados de protótipo, a validar — comentar como tal.
- **KTD5 — Contagem [inicio, fim].** Dias úteis **após** a abertura até o ponto de congelamento
  (abertura no mesmo dia = 0). Consistente com o indicador "N/20 dias úteis".

## Implementation Units

### U1. Módulo de feriados
**Requirements:** R1. **Files:** `app/src/features/vagas/lib/feriados.ts`,
`app/src/features/vagas/lib/feriados.test.ts`.
**Approach:** `pascoa(ano)` (Butcher); `feriadosNacionais(ano)` (fixos + móveis); `FERIADOS_LOCAIS`
(Record por Unidade, dado); `feriadosDaUnidade(unidade, ano)`; helper `feriadosDaUnidadeNoIntervalo`.
**Test scenarios:** Páscoa 2026 = 05/04; Sexta-feira Santa 03/04; Carnaval 16–17/02; Corpus Christi
04/06; nacionais incluem 20/11 (Consciência Negra); unidade desconhecida cai só nos nacionais;
SESI Caruaru inclui o municipal configurado.

### U2. Motor de dias úteis + cálculo do SLA
**Requirements:** R2, R3. **Dependencies:** U1. **Files:** `app/src/features/vagas/lib/sla.ts`
(estende), `app/src/features/vagas/lib/sla.test.ts` (estende).
**Approach:** `diasUteis(inicio, fim, feriados)` iterando dia a dia; `calcularSlaDiasUteis(vaga,
feriados)` com o ponto de congelamento (KTD3). Mantém `SLA_META_DIAS_UTEIS`/`slaSeverity`.
**Test scenarios:** intervalo só de semana = 5; atravessando fim de semana exclui sáb/dom; excluir um
feriado nacional reduz 1; abertura==fim = 0; congelamento usa divulgacaoResultado quando presente,
senão encerramento, senão dataAcao.

### U3. Substituir o mock e o create pelo motor
**Requirements:** R4. **Dependencies:** U2. **Files:** `app/src/features/vagas/data/vagas.ts`,
`app/src/features/vagas/data/vagas-store.ts`.
**Approach:** `gerarVaga` calcula `slaDiasUteis = calcularSlaDiasUteis(vaga, feriadosDaUnidade(...))`
(removendo `gerarSla`); `store.criar` usa `diasUteis(dataAbertura, new Date(), feriadosDaUnidade(unidade, ano))`.
**Test scenarios:** `schema.test.ts` (mock passa no schema) segue verde; SLA agora reflete as datas.
**Verification:** lista/detalhe mostram SLA calculado; distribuição varia com as datas reais.

## Definition of Done
- R1–R5; motor puro e testado; feriados por Unidade como dado; `slaDiasUteis` calculado, não aleatório.
- Gate verde; commits por unidade; PR (integração) com CI verde.

## Sources & Research
- ADR 0002 (`docs/adr/0002-*.md`); B2 do PRD; CONTEXT.md (dias úteis × corridos, pausa).
- date-fns disponível (`differenceInBusinessDays` cobre fds mas não feriados — daí o motor próprio).
