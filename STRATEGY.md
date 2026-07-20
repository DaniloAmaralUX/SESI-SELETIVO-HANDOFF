---
titulo: STRATEGY — SESI Processo Seletivo
tipo: strategy
status: v1 (viva)
data: 2026-07-13
fontes:
  - docs/product/PRD-sistema-rh-gestao-vagas.md
  - docs/product/PRD-review-e-plano-reaproveitamento.md (decisões B1–B8)
  - CONTEXT.md (linguagem ubíqua)
  - docs/adr/ (0001 eixos independentes · 0002 SLA dias úteis)
---

# STRATEGY — SESI Processo Seletivo

Âncora de produto **upstream**. É lida por `/ce-ideate`, `/ce-brainstorm` e `/ce-plan` como grounding — as
escolhas aqui devem fluir para toda feature. Mantê-la curta e viva; revisitar a cada fase entregue.

## Visão

Ser o **produto operacional** de gestão de vagas do RH do SESI: cadastrar, acompanhar e encerrar todo o
ciclo de vida de uma **Vaga** dentro do sistema — com controle de status, etapas, prazos e SLA — substituindo
o controle por planilha. A planilha vira apoio (carga inicial / contingência), não o sistema de registro.

## Natureza da entrega (este repositório)

Este repo é conduzido pelo **designer do projeto**, que faz o **design + front-end**. A entrega tem dois
clientes, e os dois importam igualmente:

1. **Protótipo validável** — front de alta fidelidade com **dados mockados**, deployado na **Vercel**, usado
   como "protótipo" em testes com usuários reais (guiados e não guiados) para validar experiência, lógica,
   regras de negócio e funcionalidade do MVP. Tudo deve *parecer e se comportar* como o produto — sem
   backend real.
2. **Handoff para desenvolvedor(a)** — o código será entregue a um dev para evoluir (backend, auth,
   persistência). **Qualidade de código, organização, documentação e nomes são requisito de entrega, não
   luxo**: camada de mock isolada e substituível (a porta de persistência do doc de arquitetura), schema
   como fonte única, decisões registradas (ADRs), docs em dia. O dev deve conseguir trocar o mock por API
   real sem reescrever telas.

Implicação prática: nunca sacrificar a arquitetura "porque é só protótipo" — o protótipo é o MVP front
de verdade; o que é descartável é **apenas o dado**, não o código.

## Problema & mudança de altitude

Hoje o processo mora em planilha: sem SLA automático, sem histórico auditável, sem visão de gargalos. O
produto muda o eixo de **"leitor de planilha que gera relatório"** para **"sistema de registro operacional"**
onde o **CRUD de Vaga é o núcleo** e o SLA de 20 dias úteis é calculado, não digitado.

## Usuários (3 com login)

- **Recrutador/a (RH)** — opera o dia a dia: cria, edita, acompanha e importa Vagas. *Usuário primário.*
- **Gestora de RH** — supervisiona: acompanha SLAs, gargalos e resultados.
- **Administrador** — gere usuários, Unidades, feriados, auditoria e exportação de dados sensíveis.

*Referenciados (dados, não usuários):* Gestor solicitante e Jurídico — seus tempos são medidos, mas não
acessam o sistema nesta versão. (Ver [CONTEXT.md](CONTEXT.md) e B7.)

## Princípios de produto (restrições que valem para toda feature)

1. **Dois eixos independentes.** Status (situação) e Ação atual (etapa) nunca se misturam (ADR 0001).
2. **SLA é do sistema, não do usuário.** 20 dias úteis calculados; pausa em Suspensa/Congelada; dia útil com
   feriados por Unidade (ADR 0002). *Tempo do gestor/jurídico são medições, não SLAs.*
3. **Nunca apagar.** Sem exclusão física — cancela/finaliza/arquiva, sempre com histórico (RF05/16/17).
4. **Criar é rápido, detalhe é progressivo.** RF06 valida só o subconjunto mínimo (B5); ~50 campos preenchem
   ao longo do processo. Mitiga risco de adoção.
5. **LGPD por padrão.** Campos sensíveis de candidato (gênero, interno, selecionado) classificados, com
   visão/exportação restrita por papel e finalidade declarada (RF26 / B6).
6. **Planilha é entrada não confiável.** Validar layout/tipo, dedup por chave, prévia antes de gravar, nunca
   sobrescrever cadastro manual sem opt-in (B8); neutralizar CSV/formula injection.

## Roadmap (faseamento aprovado — B4)

| Fase | Escopo | RFs |
|---|---|---|
| **0 — Fundações** | Limpar template + rebrand + nav pt-BR; camada de dados; schema/enum de Status·Ação (B1); guard de rota (RBAC) | — |
| **1 — Núcleo CRUD** | Lista+filtros · form criar/editar · detalhe · soft-delete · histórico/auditoria | RF01–08, RF16–17 |
| **2 — SLA & Processo** | Motor de SLA (B2) · cronograma · timers gestor/jurídico · resultado | RF09–15 |
| **3 — Importação** | Parser · validação · dedup · wizard/prévia | RF18–22 |
| **4 — Indicadores** | Dashboards · relatórios · exportação | RF23–25 |

*Tela inicial padrão:* **lista de Vagas** (núcleo operacional).

## Como medir sucesso (a instrumentar)

- **North-star candidato:** % de Vagas com **resultado divulgado em ≤ 20 dias úteis** (taxa de SLA no prazo).
- Secundárias: tempo mediano até resultado; nº de Vagas ativas por gargalo (Ação atual); tempo médio de
  gestor e de jurídico; adoção (Vagas criadas direto vs. importadas).
- **Baseline pendente:** medir hoje a taxa de estouro do SLA e o volume mensal de Vagas para justificar o
  build e avaliar resultado (questão aberta #8 do PRD). Alimenta `/ce-product-pulse` pós-deploy.

## Tooling padrão do fluxo

- **Context7** (`npx ctx7 setup --claude`) — docs atualizadas de bibliotecas; fonte preferida para API/config
  da stack. **Auto-trigger autorizado.**
- **ui-skills** (`npx ui-skills start`, ui-skills.com) — bancada de especialistas de UI/design (`dc-*` do
  Design Compound) para o trabalho visual. **Auto-trigger autorizado.**

Detalhe operacional da autorização: [CLAUDE.md](CLAUDE.md) § Tooling autorizado.

## Não-objetivos (evitar scope creep)

- **Candidato como entidade** — sem CRUD/pipeline por pessoa; a Vaga só guarda campos de candidato.
- Portal externo para candidato/gestor solicitante/jurídico (esta versão é interna ao RH).
- Motor de SLA configurável por contrato/cargo antes de validar a meta única de 20 dias.

## Decisões estratégicas em aberto (destravar cedo)

1. **Backend + auth + RBAC (B3)** — API própria vs BaaS vs mock; auth (SSO SESI vs Clerk vs JWT). Condiciona
   histórico/auditoria reais. *Decidir com infra/TI.*
2. **Reabertura** — novo registro vinculado vs. reuso do mesmo; efeito no SLA/histórico. *Recomendação atual:
   novo registro vinculado.* (CONTEXT.md ⏳)
3. **Identificador único da Vaga** — nº do chamado **e** código, ou **e/ou**?
4. **Meta de SLA** — 20 dias úteis uniforme ou varia por tipo de contrato/cargo?
5. **LGPD** — política concreta de retenção/anonimização (prazo), com o DPO, antes do go-live.

> As decisões duras já tomadas viram ADR em [docs/adr/](docs/adr/). Aprendizados de execução viram
> [docs/solutions/](docs/solutions/). Vocabulário durável vai para [CONTEXT.md](CONTEXT.md).
