---
titulo: Respostas propostas às dúvidas de requisitos (para o protótipo)
tipo: decisão-de-produto-e-design
status: premissas ativas — sujeitas à validação nos testes com usuárias e às instâncias externas (TI, DPO, RH)
data: 2026-07-13
fontes:
  - duvidas-requisitos.pdf (v1) · duvidas-requisitos-v2.pdf (v2 — planilha real)
  - CONTEXT.md · STRATEGY.md · docs/adr/0001, 0002
  - documentação oficial (Zod 4, date-fns, TanStack Router — viabilidade técnica)
  - decisões de design do designer do projeto (2026-07-13)
---

# Respostas propostas às dúvidas — escopo do protótipo

Cada dúvida da v1/v2 recebeu **ou** uma resposta lógica (premissa registrada, implementada no protótipo)
**ou** uma decisão de design tomada pelo designer. Nada aqui substitui as instâncias externas (TI, DPO,
RH/Gestora) — o protótipo é o instrumento para **testar** estas premissas com usuárias reais.

## Decisões de design (tomadas pelo designer, 2026-07-13)

| Decisão | Escolha |
|---|---|
| **Vocabulário do protótipo** (N1/N2) | **Canônico 6×10** — o protótipo apresenta o modelo novo (6 Status × 10 etapas); o teste com usuárias É a validação do de-para. Enums implementados como dado (arrays), remapeáveis sem refactor. |
| **Colunas da lista** (dúvida 11a) | **Operacional enxuto (7):** Chamado · Cargo · Unidade/Área · Status (badge) · Ação atual · SLA · Recrutadora. O resto vive em filtros e no detalhe. |
| **Detalhe da Vaga** (dúvida 11b) | **Tabs por grupo:** header fixo com os 2 eixos + SLA; tabs Visão geral · Processo · Gestor & Jurídico · Resultado & Candidato · Histórico. |
| **Papéis no protótipo** (dúvida 1-UX) | **Role-switcher visível** — troca entre Recrutadora/Gestora de RH/Admin no próprio protótipo; testa as 3 personas e as restrições LGPD num único deploy. |

## Respostas lógicas (premissas implementadas)

**1. Backend/auth/RBAC (B3)** — Fora do protótipo (decisão do TI). Auth mockada; RBAC simulado só como
visão de papel (role-switcher). *Nada disso é arquitetura final.*

**2. Reabertura** — Mantida a recomendação: **novo registro vinculado** (`reaberturaDe` aponta a Vaga
anterior). O detalhe mostra o vínculo; o teste guiado pergunta às usuárias se o modelo faz sentido. A
planilha real usa flag no mesmo registro — a importação (Fase 3) definirá a tradução.

**3. Identificador único** — **Nº do chamado como identificador de exibição** (evidência: a aba CRONOGRAMA
da planilha real referencia só CHAMADO). O schema guarda `chamado` e `codigoVaga`. Validar unicidade real
com a planilha 2025 preenchida.

**4. Meta de SLA** — **Uniforme: 20 dias úteis** (a planilha tem uma única coluna de meta). O motor
parametrizado só se o teste/Gestora pedirem. Severidade no protótipo: <15 ok · 15–19 atenção · ≥20 estourado.

**5. Âncora do SLA** — Início na **data de abertura** (B2). O detalhe **exibe** a data de recebimento ao
lado — o tempo pré-abertura fica visível sem virar SLA. Se as usuárias sentirem falta do indicador, vira
métrica na Fase 2.

**6. Transições de Status** — A matriz proposta no B1 será implementada **como dado** (`transicoes.ts`,
Fase de CRUD) e não hard-coded; no protótipo desta fatia (leitura), qualquer par Status×Ação coerente do
mock é exibível. Teste guiado valida a matriz.

**7. Origem × fonte** — **Campos distintos**: `origemDoCadastro` ∈ {manual, importação};
`fonteDosDados` = arquivo/aba de origem (presente só em importadas). Implementado no schema do protótipo.

**8. LGPD — retenção** — Indecidível sem o DPO. Protótipo: dados 100% sintéticos (faker com seed) e campos
sensíveis **mascarados por padrão** (visíveis só para Administrador), com badge LGPD — a política concreta
de retenção segue pendente.

**9. Gênero** — Mock com {feminino, masculino, não informado}; visível só para Admin. A **finalidade**
(indicador de diversidade declarado) continua com o DPO/Gestora — se não for confirmada, o campo sai.

**10. Baseline** — Irrespondível sem dados: **pedir à PM a planilha 2025 preenchida** (o cálculo sai em
minutos: % de vagas com resultado ≤20 dias úteis + volume mensal). Não bloqueia o protótipo.

**12. A11y/responsividade/primeiro uso** — Premissas: **WCAG AA** (contraste dos tokens de status
verificado), desktop-first responsivo, linha da tabela acessível por teclado; estado vazio orienta para a
importação (que é a Fase 3). Confirmável na evolução do design.

## Viabilidade técnica confirmada (2026-07-13)

- **Zod 4**: `z.enum([...] as const)` de array constante como fonte única de tipo + validação — padrão usado
  no schema da Vaga. `z.coerce.date()` para datas do mock.
- **date-fns**: `differenceInBusinessDays` cobre fins de semana **mas não feriados** — confirma o motor
  próprio de feriados por Unidade do ADR 0002 (Fase 2).
- **TanStack Router**: `validateSearch` com arrays Zod + `.catch()` para resiliência de URL — padrão da rota
  da lista (filtros de Status/Ação na URL).

## O que segue em aberto (donos externos)

| # | Dúvida | Dono | Próximo passo |
|---|---|---|---|
| 1 | Backend/auth/RBAC (B3) | TI SESI | Reunião de arquitetura |
| N1/N2 | De-para vocabulário real ↔ canônico | RH + Q.A. | **O próprio teste do protótipo** + sessão de mapeamento |
| N3 | Semântica das 5 colunas de SLA (DETRATOR × R&S) | Q.A. | Pedir as fórmulas da planilha |
| N4 | Carteiras (SESI × Orquestra × SENAI) | RH/Gestora | Definir se MVP segmenta |
| 8/9 | Retenção + finalidade de gênero | DPO | Consulta formal |
| 10 | Baseline | PM | **Enviar planilha 2025 preenchida** |
