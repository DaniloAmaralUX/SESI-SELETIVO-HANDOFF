---
titulo: Personas — Sistema de RH / Gestão de Vagas
tipo: personas
status: proposta (validar com usuários reais do RH SESI)
data: 2026-07-20
fontes:
  - docs/product/PRD-sistema-rh-gestao-vagas.md (Seção 9, decisões B5/B7)
  - docs/design/arquitetura-informacao.md (§2 Atores e acesso, §13 matriz RBAC)
  - CONTEXT.md (linguagem ubíqua)
---

# Personas — Sistema de RH / Gestão de Vagas

> Três personas **com login** (decisão B7 do PRD). *Gestor solicitante* e *Jurídico* são **partes
> referenciadas** — aparecem como dados da Vaga e têm seus tempos medidos (RF11/RF12), mas **não usam
> o sistema** nesta versão; por isso não têm persona. Nomes são fictícios; dores e objetivos derivam
> do PRD e devem ser **validados nos testes com usuários reais** (protótipo na Vercel).

---

## P1 — Carla, a Recrutadora (RH) · *persona primária*

| | |
|---|---|
| **Papel no sistema** | RH (Recrutador/a) — usuária mais frequente |
| **Contexto** | Analista de RH do SESI-PE; conduz 8–15 vagas simultâneas em diferentes etapas |
| **Ferramenta atual** | Planilha compartilhada (~50 colunas), e-mails e chamados avulsos |
| **Frequência de uso** | Diária, várias vezes ao dia |

**Objetivos**
- Cadastrar uma vaga nova em menos de 2 minutos (criação mínima de 7 campos, decisão B5).
- Saber, num olhar, **quais vagas precisam de ação hoje** e quais estão perto de estourar o SLA.
- Atualizar status, ação atual e cronograma sem caçar a linha certa numa planilha gigante.
- Importar a planilha legada sem medo de sobrescrever o que já cadastrou à mão (decisão B8).

**Dores hoje**
- A planilha não avisa nada: o estouro de SLA é descoberto tarde, contando dias à mão.
- Colunas demais, sem hierarquia — erra a célula, sobrescreve dado de colega.
- Não há histórico: impossível saber quem alterou o quê e quando.
- "Gestor não respondeu" e "jurídico não devolveu parecer" não ficam registrados em lugar nenhum.

**O que o sistema deve fazer por ela**
- Lista de vagas como tela inicial, com filtros por Status/Ação/Recrutador e o **SLAIndicator** visível.
- Criação rasa + detalhamento progressivo (nunca um formulário-monstro).
- Registro de datas de encaminhamento/retorno do gestor e do chamado jurídico com contagem automática.

**Frase-síntese:** *"Eu preciso saber o que está para vencer antes que vença."*

---

## P2 — Denise, a Gestora de RH · *persona de supervisão*

| | |
|---|---|
| **Papel no sistema** | Gestora de RH — supervisão e indicadores |
| **Contexto** | Coordena a equipe de recrutamento; responde pela meta de 20 dias úteis perante a direção |
| **Ferramenta atual** | Consolida a planilha em relatórios manuais mensais |
| **Frequência de uso** | Semanal (dashboards) + consultas pontuais |

**Objetivos**
- Ver a **saúde do funil**: quantas vagas no prazo / em risco / estouradas, e onde estão os gargalos.
- Medir tempo de resposta de gestores solicitantes e do jurídico (medições, não SLAs).
- Gerar relatórios por área, recrutador, status e período e **exportar** com filtros (RF24/RF25).
- Justificar com dados a taxa de estouro do SLA e o volume mensal de vagas (baseline, questão aberta #8).

**Dores hoje**
- O relatório mensal leva dias para consolidar e nasce desatualizado.
- Não consegue responder rápido "por que essa vaga demorou 40 dias?" — falta trilha de eventos.
- Sem visão agregada, os gargalos (gestor lento, jurídico lento, etapa travada) ficam invisíveis.

**O que o sistema deve fazer por ela**
- Dashboard `/indicadores` com o painel de instrumentos de SLA (elemento-assinatura do design system).
- Relatórios `/relatorios` com exportação filtrada, respeitando LGPD (RF26 — campos sensíveis por papel).
- Histórico completo por vaga (RF16/RF17) para auditar decisões.

**Frase-síntese:** *"Eu preciso provar com números onde o processo emperra."*

---

## P3 — Marcos, o Administrador do sistema · *persona de suporte*

| | |
|---|---|
| **Papel no sistema** | Administrador — configuração, usuários, auditoria |
| **Contexto** | TI/apoio administrativo do SESI; não participa do recrutamento em si |
| **Frequência de uso** | Esporádica (onboarding de usuários, ajuste de calendários, auditoria sob demanda) |

**Objetivos**
- Gerir usuários e papéis (RBAC — RH, Gestora de RH, Administrador).
- Manter a **tabela de feriados por unidade** que alimenta o motor de SLA em dias úteis (ADR 0002).
- Consultar a trilha de auditoria (quem criou/alterou, quando) e controlar exportação de dados sensíveis.

**Dores hoje**
- Nenhum controle de acesso: a planilha é editável por qualquer pessoa com o link.
- Feriados municipais não entram em cálculo nenhum — o "prazo" é impreciso.

**O que o sistema deve fazer por ele**
- `/admin/usuarios`, `/admin/calendarios` e `/admin/auditoria` (IA §6.7), visíveis só ao seu papel.
- Auditoria somente-leitura com diff das alterações (HoverCard).

**Frase-síntese:** *"Se der problema, eu preciso conseguir dizer quem fez e quando."*

---

## Anti-personas (fora do escopo desta versão)

- **Gestor solicitante** — não acessa o sistema; seus dados e tempos são registrados pelo RH.
- **Jurídico** — idem; interage por chamado externo.
- **Candidato** — não é entidade gerida (sem CRUD de candidato, ver CONTEXT.md); a Vaga guarda apenas
  campos de resultado (candidato selecionado, nº de aplicados, banco). 🔒 Dados de candidato são
  sensíveis (LGPD, RF26).

## Pendências de validação

1. Confirmar carga real de vagas por recrutadora (dimensiona filtros e paginação).
2. Confirmar se a Gestora de RH também cria/edita vagas no dia a dia (RBAC §13 da IA permite).
3. Validar dores nos testes de usabilidade do protótipo (Vercel) e atualizar este doc.
