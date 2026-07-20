# Documentação — SESI Processo Seletivo

Índice único da documentação do projeto. Organizada por **audiência** (produto · design · engenharia),
mais **ADRs** (decisões duras) e **meta** (notas de tooling). O vocabulário do domínio é transversal e
mora na raiz: **[../CONTEXT.md](../CONTEXT.md)**.

> Convenções de status: `proposta` = direção a validar · `em-revisao` = em ajuste · `v0.x` = versão inicial ·
> `Aceita` = ADR em vigor · `instalada` = nota de skill/tooling · `arquivado` = histórico, não usar como fonte.

---

## Mapa geral

```
CONTEXT.md ──────────────► linguagem ubíqua (fonte da linguagem; transversal)
     │
     ├── produto ────────► o QUÊ  (PRD + revisão)
     ├── design ─────────► o COMO SE PARECE / SE NAVEGA (IA + Design System)
     ├── engenharia ─────► o COMO SE CONSTRÓI (stack + reuso + módulos)
     └── adr ────────────► decisões que amarram tudo
```

---

## Produto — o quê

| Documento | Descrição | Status |
|---|---|---|
| [product/PRD-sistema-rh-gestao-vagas.md](product/PRD-sistema-rh-gestao-vagas.md) | PRD / fonte de verdade: 25 RFs, catálogo de campos, épicos/user stories, e Seção 9 (decisões B1–B8). | `em-revisao` |
| [product/PRD-review-e-plano-reaproveitamento.md](product/PRD-review-e-plano-reaproveitamento.md) | Revisão multi-persona do PRD + matriz requisitos→módulos + jornadas + plano de reaproveitamento do template (canônico). | revisão |
| [product/personas.md](product/personas.md) | Personas dos 3 papéis com login (Recrutadora, Gestora de RH, Administrador) + anti-personas fora do escopo. | `proposta` |
| [product/fluxos-do-usuario.md](product/fluxos-do-usuario.md) | Fluxos ponta-a-ponta F1–F9 (criar vaga, acompanhar, mudar status, importar, indicadores, admin, login) com exceções e estados vazios. | `proposta` |

## Design — como se parece / se navega

| Documento | Descrição | Status |
|---|---|---|
| [design/arquitetura-informacao.md](design/arquitetura-informacao.md) | Arquitetura da Informação: atores, modelo mental (dois eixos), mapa de navegação, rotas, inventário de telas, mapeamento tela→componente shadcn. | `proposta` |
| [design/design-system.md](design/design-system.md) | Design System: direção visual, design tokens (OKLCH + tokens `--status-*` a criar), catálogo de componentes do baseline, componentes de domínio a construir. | `v0.1` |
| [design/arquitetura-informacao-apresentacao.pdf](design/arquitetura-informacao-apresentacao.pdf) | Versão apresentação (slides) da IA para stakeholders. | — |
| [design/ux-experiencia-do-usuario.md](design/ux-experiencia-do-usuario.md) | Diretrizes de UX: princípios de experiência, padrões de interação, feedback/estados, acessibilidade (WCAG 2.2 AA), microcopy, métricas de teste. | `proposta` |
| [design/checklist-design-system.md](design/checklist-design-system.md) | Checklist do design system: tokens, composição, variantes, estados e acessibilidade — por componente e por auditoria. | ativo |
| [design/checklist-ux.md](design/checklist-ux.md) | Checklist de UX: definição de pronto por tela (4 estados, hierarquia, prevenção de erro, a11y, LGPD) e por fluxo. | ativo |

## Engenharia — como se constrói

| Documento | Descrição | Status |
|---|---|---|
| [engineering/stack.md](engineering/stack.md) | Referência da stack: cada biblioteca, versão, papel no projeto e link oficial (validado via context7). | referência |
| [engineering/estudo-shadcn.md](engineering/estudo-shadcn.md) | Guia de reaproveitamento do shadcn/ui (CLI, componentes instalados, regras de uso). | referência |
| [engineering/arquitetura-de-modulos.md](engineering/arquitetura-de-modulos.md) | Deep modules & seams do domínio SESI: módulos profundos a imitar, oportunidades de deepening e onde a camada de domínio (Vaga, SLA, RBAC) se encaixa. | referência |
| [engineering/checklist-front-end.md](engineering/checklist-front-end.md) | Checklist de front-end: gate de PR (lint/test/build/knip), arquitetura de módulos, rotas, dados, forms, testes, performance, segurança e processo CE. | ativo |
| [engineering/handoff-dev.md](engineering/handoff-dev.md) | Handoff front-end: mapa do domínio, porta de persistência (trocar mock por API), regras implementadas, rodar/testar/deploy. | ativo |
| [engineering/handoff-backend.md](engineering/handoff-backend.md) | Handoff backend: modelo de dados, regras que o servidor garante, especificação do SLA/feriados, auth/RBAC (B3), critérios de aceite e sequência sugerida. | ativo |
| [engineering/contrato-api.md](engineering/contrato-api.md) | Contrato de API esperado pelo front: endpoints, query params de listagem, envelope de resposta e formato de erro. | ativo |

## ADRs — decisões duras

| ADR | Decisão | Status |
|---|---|---|
| [adr/0001-status-e-acao-como-eixos-independentes.md](adr/0001-status-e-acao-como-eixos-independentes.md) | Status (6 valores) e Ação atual (10 etapas) modelados como **dois eixos independentes**; nunca misturados. | Aceita |
| [adr/0002-sla-dias-uteis-com-motor-de-feriados-proprio.md](adr/0002-sla-dias-uteis-com-motor-de-feriados-proprio.md) | SLA em **dias úteis** por um **motor próprio** alimentado por tabela de feriados configurável por Unidade. | Aceita |

## Meta — notas de tooling

| Documento | Descrição | Status |
|---|---|---|
| [meta/skill-design-lab.md](meta/skill-design-lab.md) | Nota sobre a skill `design-lab` (exploração de UI em 5 variações) e adaptação ao stack Vite/Tailwind v4. | `instalada` |
| [meta/skill-vite.md](meta/skill-vite.md) | Nota sobre a skill `vite` (referência de build/config Vite 8) e sua conexão com o `vite.config.ts` real. | `instalada` |

## Arquivo

| Documento | Motivo |
|---|---|
| [_archive/revisao-prd-e-reaproveitamento.md](_archive/revisao-prd-e-reaproveitamento.md) | Versão curta (taxonomia P1/P2/P3) da revisão do PRD. **Supersedida** por `product/PRD-review-e-plano-reaproveitamento.md` (taxonomia B1–B8, adotada pelo PRD). Mantida só para histórico. |
