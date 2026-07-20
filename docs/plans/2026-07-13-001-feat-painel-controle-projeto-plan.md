---
title: Painel de Controle do Projeto - Plan
type: feat
date: 2026-07-13
topic: painel-controle-projeto
artifact_contract: ce-unified-plan/v1
artifact_readiness: requirements-only
product_contract_source: ce-brainstorm
execution: code
---

# Painel de Controle do Projeto - Plan

## Goal Capsule

- **Objetivo:** dar ao designer do projeto um cockpit HTML standalone, só leitura, que responde em segundos "onde o projeto está, o que depende de decisão, qual o próximo passo" — com um módulo Craft que renderiza ao vivo os tokens propostos do design system.
- **Autoridade de produto:** [STRATEGY.md](../../STRATEGY.md) (roadmap e decisões em aberto) e [CONTEXT.md](../../CONTEXT.md) (termos canônicos).
- **Bloqueios em aberto:** nenhum — as premissas assumidas estão registradas em Dependencies / Assumptions.

---

## Product Contract

### Summary

Cockpit HTML standalone e só leitura que mostra num olhar o estado real do projeto SESI Processo Seletivo — retomada de sessão, roadmap com status, decisões, artefatos, atividade do agente — mais um módulo Craft que renderiza os tokens propostos do design system. Dados em arquivo separado, atualizado pelo agente a cada loop.

### Problem Frame

O roadmap está em `STRATEGY.md`, a maturidade dos docs em `docs/README.md`, as decisões pendentes espalhadas entre STRATEGY, CONTEXT e a memória do agente. Não há lugar que responda em segundos "onde o projeto está, o que está pendente, qual o próximo passo" — a releitura é textual e lenta, e o progresso real (vs. planejado) não é visível. O projeto é construído de forma automatizada no Claude Code, o que agrava o problema: o trabalho avança entre sessões e o designer precisa se re-situar a cada abertura.

### Key Decisions

- **Atualização por convenção, não por script.** O agente atualiza o arquivo de dados ao fim de cada loop (ritual no CLAUDE.md). Um gerador que varre o repo seria mais fiel, porém mais caro — pode evoluir depois. Mitigação da mentira silenciosa: carimbo "atualizado em" sempre visível.
- **Só leitura.** Nada se edita nem persiste no painel (sem localStorage de estado). Fonte de verdade única = arquivo de dados no repo.
- **Módulo Craft com dupla função.** Renderiza a paleta/tipografia/tokens propostos em `docs/design/design-system.md` — dá o prazer de craft e vira a primeira visualização viva da direção visual (hoje só prosa e ASCII). Sempre rotulado **proposta não validada**: ver a proposta aplicada não a valida com o manual de marca.
- **Standalone file://.** Abre com dois cliques, sem servidor, build ou rede obrigatória.

### Requirements

**Conteúdo**

- R1. Faixa de retomada no topo: onde parei, o que mudou no último loop, **próximo passo** em destaque.
- R2. Roadmap: fases 0–4 do `STRATEGY.md` com status real (não iniciada / em andamento / concluída) e o que falta em cada uma.
- R3. Decisões: tomadas (ADRs, com caminho) e pendentes (as 5 do STRATEGY "em aberto" + pendências como N1/N2 da planilha real), pendentes ordenadas por urgência.
- R4. Artefatos: inventário dos docs com maturidade (ex.: PRD em-revisão, design system v0.1-proposta, IA proposta).
- R5. Atividade: resumo do que o agente fez nos últimos loops (sessões/PRs).
- R6. Módulo Craft: paleta SESI proposta (azul `#0057B8`, âmbar `#F2A900`…), tokens `--status-*`/`--sla-*`, par tipográfico (Archivo / IBM Plex) e radius, renderizados de verdade e rotulados como proposta.
- R7. Carimbo "atualizado em <data>" sempre visível.

**Comportamento**

- R8. Só leitura: nenhuma edição ou persistência de estado no painel.
- R9. Interatividade client-side de leitura: expandir/recolher, tooltips/detalhe.
- R10. Abre por file:// com dois cliques; sem servidor, sem build; sem dependência obrigatória de rede (fontes remotas com fallback local).

**Dados e idioma**

- R11. Dados num arquivo separado do HTML; atualizar o painel = editar só o arquivo de dados.
- R12. Ritual no CLAUDE.md: ao fim de cada loop de trabalho, o agente atualiza o arquivo de dados.
- R13. pt-BR, com os termos canônicos do `CONTEXT.md`.

### Acceptance Examples

- AE1. **Covers R1, R7, R12.** Dado um loop concluído hoje, quando abro o painel, então a retomada mostra o próximo passo atual e o carimbo é de hoje.
- AE2. **Covers R3, R11.** Dada a decisão "Reabertura" resolvida num loop, quando o agente atualiza o arquivo de dados, então ela sai de pendentes e aparece em tomadas — sem tocar no HTML.
- AE3. **Covers R10.** Sem internet, o painel abre e é totalmente legível (tipografia em fallback).

### Success Criteria

- Em ~10 segundos da abertura, o painel responde: onde o projeto está, o que depende de decisão, qual o próximo passo.
- O módulo Craft dá leitura fiel dos tokens propostos (cores reais, specimen real), sem sugerir que a direção foi validada.

### Scope Boundaries

- Não é o dashboard do produto (`/indicadores`, Fase 4 do roadmap) — este painel é sobre o projeto, não sobre Vagas.
- Sem edição/checagem no painel.
- Sem geração automática por script (evolução futura possível, assim como um comando dedicado de atualização).
- Sem deploy — arquivo local versionado no repo.
- Público único (o designer do projeto); sem modo apresentação para stakeholders.

### Dependencies / Assumptions

- Interatividade assumida como **só leitura rica** (expandir/recolher, tooltips) — o usuário delegou o nível fino ao agente.
- A forma final do layout foi decidida por esboços A/B/C descartáveis antes da construção.
- A paleta SESI usada no módulo Craft é a **proposta** de `docs/design/design-system.md`, pendente de validação com o manual de marca.

### Sources

- `STRATEGY.md` — roadmap (fases 0–4) e as 5 decisões estratégicas em aberto.
- `docs/README.md` — inventário e maturidade dos artefatos.
- `docs/design/design-system.md` — tokens propostos (paleta, `--status-*`, tipografia, radius). O "painel de instrumentos de SLA" descrito lá (§1.2) é elemento do produto, não este cockpit.
- `docs/adr/0001-status-e-acao-como-eixos-independentes.md`, `docs/adr/0002-sla-dias-uteis-com-motor-de-feriados-proprio.md` — decisões tomadas.
- `CONTEXT.md` — linguagem ubíqua.
