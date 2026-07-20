# ADR 0001 — Status e Ação atual como eixos independentes

- **Status:** Aceita
- **Data:** 2026-07-13
- **Decisão de origem:** B1 do PRD (RF05 / RF07 / RF08)

## Contexto

Uma Vaga precisa comunicar duas coisas que variam de forma independente:

1. a **situação** dela (está em andamento? pausada? encerrada?), que determina se o cronômetro de SLA corre; e
2. **onde** ela está no processo seletivo (da solicitação até a admissão).

O caminho convencional seria um **único enum de status** misturando as duas coisas (ex.: "Em entrevista",
"Suspensa", "Contratado", "Aguardando jurídico"). O modelo mental do RH, porém, trata as duas dimensões como
ortogonais: uma Vaga pode estar *Aberta* em *qualquer* etapa, e pode ser *Suspensa* sem perder a etapa em que
parou.

## Decisão

Modelar **dois eixos separados** em toda a stack (dados, filtros, UI):

- **Status** — 6 valores (Aberta, Suspensa, Congelada, Cancelada, Finalizada, Arquivada). Governa o SLA.
- **Ação atual** — 10 etapas ordenadas (Solicitação recebida → … → Admissão).

Na UI, Status vira badge colorido e Ação atual vira coluna/stepper; nunca são fundidos num só controle.
As definições canônicas vivem em [CONTEXT.md](../../CONTEXT.md).

## Consequências

**Positivas**
- Casa com o modelo mental do RH; filtros por situação e por etapa ficam independentes.
- O motor de SLA depende só do Status (superfície pequena e clara — ver [ADR 0002](0002-sla-dias-uteis-com-motor-de-feriados-proprio.md)).
- Cada etapa espelha um campo de data do Cronograma, facilitando a Timeline.

**Negativas / custos**
- Duas máquinas de estado para manter, com regras de transição próprias.
- Combinações inválidas (ex.: Status terminal + etapa intermediária) precisam ser prevenidas em regra, não pelo tipo.
- **Difícil de reverter:** fundir os eixos depois exigiria migrar dados e refazer lista e detalhe.

## Notas

Transições de Status propostas (a confirmar no planejamento): Aberta → {Suspensa, Congelada, Cancelada,
Finalizada}; Suspensa/Congelada → {Aberta, Cancelada}; Finalizada/Cancelada → Arquivada. A semântica de
**Reabertura** segue em aberto (ver "Termos em aberto" no CONTEXT.md).
