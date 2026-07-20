---
titulo: Análise Atualizada — Sistema de RH para Gestão de Vagas
tipo: requirements
status: em-revisao
origem: analise_atualizada_sistema_rh_gestao_vagas.pdf (autoria Q.A.)
baseline_tecnica: template shadcn-admin (React 19 + Vite + TanStack Router/Query/Table + shadcn/ui + Tailwind v4)
actors:
  - RH (Recrutador/a)
  - Gestora de RH
  - Gestor solicitante
  - Jurídico
  - Administrador do sistema
---

# Análise Atualizada — Sistema de RH para Gestão de Vagas

> **Proveniência:** transcrição fiel do PDF `analise_atualizada_sistema_rh_gestao_vagas.pdf`
> escrito pela Q.A. Acentuação restaurada; conteúdo, requisitos e user stories preservados
> sem acréscimos. Este documento é a fonte de verdade para a revisão do PRD e para o
> mapeamento de reaproveitamento sobre o template `shadcn-admin`.

Versão revisada considerando o **cadastro direto das vagas** como fonte principal dos dados e o
**upload da planilha** como entrada secundária para carga inicial, histórico ou contingência.

---

## 1. Resumo Atualizado do Sistema

O sistema será uma plataforma para o time de RH cadastrar, acompanhar e gerenciar vagas e
processos seletivos diretamente na aplicação. O cadastro manual da vaga passa a ser a fonte
principal dos dados, substituindo gradualmente o controle por planilha.

A funcionalidade de upload da planilha será mantida como recurso secundário, usada
principalmente para carga inicial das vagas já abertas, importação de histórico ou situações
excepcionais em que o RH precise atualizar informações em lote.

## 2. Objetivo Atualizado

Permitir que o RH gerencie todo o ciclo de vida das vagas dentro do sistema, desde o cadastro
inicial até o encerramento do processo seletivo, com controle de status, etapas, prazos, SLA,
jurídico, gestor, candidato selecionado, histórico e indicadores gerenciais.

## 3. Mudança Principal de Escopo

- Antes, o sistema era pensado como um **leitor de planilhas** para gerar relatórios.
- Agora, o sistema deve ser tratado como um **produto operacional de gestão de vagas**.
- O **CRUD de vagas** passa a ser o núcleo do sistema.
- A planilha permanece como apoio para carga inicial, importação de histórico ou plano B operacional.

## 4. CRUD de Vagas

| Operação | Descrição funcional |
|---|---|
| **Criar vaga** | Cadastrar uma nova vaga com dados da solicitação, área, gestor, contrato, cargo, recrutador, datas e informações do processo. |
| **Consultar vaga** | Visualizar lista de vagas, filtros, detalhe da vaga, situação atual e histórico. |
| **Editar vaga** | Atualizar status, ação atual, datas, jurídico, gestor, cronograma, resultado e candidato selecionado. |
| **Excluir/Inativar vaga** | Preferencialmente não apagar fisicamente; usar cancelamento, arquivamento ou inativação para preservar histórico e rastreabilidade. |

## 5. Campos do Cadastro da Vaga

| Grupo | Campos sugeridos |
|---|---|
| **Identificação** | Nº do chamado, código da vaga, data do recebimento, origem do cadastro, fonte dos dados. |
| **Solicitante** | Gestor solicitante, unidade/área. |
| **Perfil da vaga** | Tipo de contrato, motivo de contratação, cargo, nível, função, vaga PCD. |
| **Responsáveis** | Recrutador(a), responsável pela vaga/gestor. |
| **Processo** | Data de abertura, status, ação atual, data da ação, observações. |
| **SLA** | SLA de 20 dias úteis, contagem do SLA, resultado do SLA, vaga fechada no prazo. |
| **Gestor** | Data de encaminhamento ao gestor, data de retorno do gestor, SLA gestor. |
| **Jurídico** | Nº chamado jurídico, abertura do chamado jurídico, recebimento do parecer jurídico, contagem em dias jurídico. |
| **Cronograma** | Período de inscrição, prova, data da prova, entrevista RH, entrevista com gestor, habilitação, formulário/habilitação, admissão. |
| **Resultado** | Divulgação do resultado, previsão de admissão, candidato selecionado. |
| **Candidato** | Gênero, candidato interno, gerou banco, quantidade de candidatos aplicados. |
| **Controle** | Reabertura, data de encerramento, motivo de cancelamento/suspensão, histórico de alterações. |

## 6. Requisitos Funcionais Atualizados

| Código | Requisito funcional |
|---|---|
| **RF01** | O sistema deve permitir cadastrar uma nova vaga diretamente na aplicação. |
| **RF02** | O sistema deve permitir editar os dados de uma vaga cadastrada. |
| **RF03** | O sistema deve permitir consultar vagas por filtros como status, ação, área, gestor, recrutador, cargo e período. |
| **RF04** | O sistema deve permitir visualizar o detalhe completo de uma vaga. |
| **RF05** | O sistema deve permitir cancelar, suspender, congelar, finalizar ou arquivar uma vaga sem apagar seu histórico. |
| **RF06** | O sistema deve validar campos obrigatórios no cadastro da vaga. |
| **RF07** | O sistema deve controlar status da vaga com base em uma lista padronizada. |
| **RF08** | O sistema deve controlar a ação atual da vaga com base nas etapas do processo seletivo. |
| **RF09** | O sistema deve calcular automaticamente o SLA de 20 dias úteis a partir da data de abertura. |
| **RF10** | O sistema deve calcular a contagem do SLA até a divulgação do resultado ou até a data atual, quando a vaga estiver aberta. |
| **RF11** | O sistema deve calcular o tempo de resposta do gestor. |
| **RF12** | O sistema deve calcular o tempo de resposta do jurídico. |
| **RF13** | O sistema deve permitir registrar dados do cronograma seletivo. |
| **RF14** | O sistema deve permitir registrar candidato selecionado, gênero, candidato interno e geração de banco. |
| **RF15** | O sistema deve permitir registrar quantidade de candidatos aplicados por vaga. |
| **RF16** | O sistema deve manter histórico de alterações da vaga. |
| **RF17** | O sistema deve registrar usuário, data e hora de criação e alteração. |
| **RF18** | O sistema deve permitir upload de planilha como entrada secundária. |
| **RF19** | O sistema deve permitir usar a planilha para carga inicial de vagas abertas ou histórico. |
| **RF20** | O sistema deve validar o layout da planilha antes da importação. |
| **RF21** | O sistema deve identificar registros duplicados na importação, usando número do chamado e/ou código da vaga. |
| **RF22** | O sistema deve permitir revisar dados importados antes de confirmar a carga. |
| **RF23** | O sistema deve gerar dashboards gerenciais com indicadores de vagas e SLAs. |
| **RF24** | O sistema deve gerar relatórios analíticos por vaga, área, gestor, recrutador, status e período. |
| **RF25** | O sistema deve permitir exportar relatórios filtrados. |

## 7. Épicos, Features e User Stories

| Épico | Feature | User story |
|---|---|---|
| Gestão de Vagas | Criar vaga | Como usuário do RH, quero cadastrar uma nova vaga diretamente no sistema para iniciar o acompanhamento do processo seletivo. |
| Gestão de Vagas | Editar vaga | Como usuário do RH, quero atualizar os dados de uma vaga para manter o processo seletivo sempre atualizado. |
| Gestão de Vagas | Consultar vagas | Como usuário do RH, quero listar e filtrar vagas para encontrar rapidamente processos específicos. |
| Gestão de Vagas | Detalhe da vaga | Como gestor, quero visualizar todas as informações de uma vaga em uma tela única. |
| Gestão de Vagas | Arquivar/cancelar vaga | Como usuário do RH, quero cancelar ou arquivar uma vaga sem perder seu histórico. |
| Controle de Processo | Status da vaga | Como usuário do RH, quero atualizar o status da vaga para refletir a situação atual do processo. |
| Controle de Processo | Ação atual | Como usuário do RH, quero registrar a ação atual da vaga para acompanhar em qual etapa ela está. |
| Controle de Processo | Cronograma | Como usuário do RH, quero registrar datas de inscrição, prova, entrevistas, habilitação e admissão. |
| SLA e Prazos | SLA da vaga | Como gestora de RH, quero acompanhar automaticamente o prazo de 20 dias úteis para fechamento da vaga. |
| SLA e Prazos | SLA gestor | Como gestora de RH, quero medir quanto tempo o gestor demora para responder quando acionado. |
| SLA e Prazos | SLA jurídico | Como gestora de RH, quero medir quanto tempo o jurídico demora para emitir parecer. |
| Resultado da Seleção | Candidato selecionado | Como usuário do RH, quero registrar o candidato selecionado para concluir o acompanhamento da vaga. |
| Resultado da Seleção | Candidatos aplicados | Como gestora de RH, quero informar a quantidade de candidatos aplicados para analisar atratividade das vagas. |
| Resultado da Seleção | Banco de candidatos | Como usuário do RH, quero registrar se a vaga gerou banco para apoiar futuras contratações. |
| Histórico e Auditoria | Histórico da vaga | Como gestora de RH, quero visualizar todas as alterações feitas em uma vaga ao longo do tempo. |
| Histórico e Auditoria | Auditoria | Como administradora do sistema, quero saber quem criou ou alterou uma vaga e quando. |
| Importação de Planilha | Upload secundário | Como usuário do RH, quero importar uma planilha para realizar carga inicial ou atualizar dados em situações excepcionais. |
| Importação de Planilha | Validação de planilha | Como usuário do RH, quero ser avisado sobre erros no arquivo antes de confirmar a importação. |
| Importação de Planilha | Prévia da importação | Como usuário do RH, quero revisar os dados importados antes de gravá-los no sistema. |
| Dashboards | Indicadores gerenciais | Como gestora de RH, quero visualizar indicadores de vagas, SLAs, status e gargalos em dashboard. |
| Relatórios | Relatórios analíticos | Como gestora de RH, quero gerar relatórios por área, recrutador, gestor, status e período. |

## 8. Observações para Refinamento

- O campo **quantidade de candidatos aplicados** deve entrar no cadastro, pois é um indicador desejado e não estava claro na planilha original.
- A **exclusão física** de vagas deve ser evitada para preservar histórico, auditoria e indicadores.
- A **importação por planilha** deve ter revisão antes da confirmação para evitar sobrescrever dados cadastrados manualmente.
- O **identificador único** da vaga deve ser definido, possivelmente combinando número do chamado e código da vaga.

---

## 9. Esclarecimentos e Decisões da Revisão (2026-07-13)

> Seção adicionada na revisão do PRD (não altera o texto original da Q.A. acima).
> Registra as resoluções acordadas achado a achado (taxonomia **B1–B8**). Referências: ver
> [PRD-review-e-plano-reaproveitamento.md](PRD-review-e-plano-reaproveitamento.md) (revisão canônica, origem
> das decisões B1–B8) e [estudo-shadcn.md](../engineering/estudo-shadcn.md). A versão curta anterior desta
> revisão foi arquivada em [../_archive/revisao-prd-e-reaproveitamento.md](../_archive/revisao-prd-e-reaproveitamento.md).

### B1 — Modelo de estados da vaga (RF05 / RF07 / RF08) ✔ decidido

**Status (estado geral da vaga) — lista padronizada canônica (RF07):**

| Status | Significado | SLA |
|---|---|---|
| **Aberta** | Vaga em andamento no processo seletivo | conta |
| **Suspensa** | Pausada temporariamente (decisão do RH/gestor) | **pausa** |
| **Congelada** | Pausada por bloqueio externo (orçamento, headcount) | **pausa** |
| **Cancelada** | Encerrada sem contratação (exige motivo) | encerra |
| **Finalizada** | Encerrada com resultado/contratação | encerra |
| **Arquivada** | Pós-encerramento; sai da operação, preserva histórico | — |

- Esta lista substitui os termos soltos da Seção 4 ("cancelamento/arquivamento/inativação"): **"inativar" = "Arquivada"**.
- Nenhuma exclusão física (RF05); toda transição registra no histórico (RF16/RF17).
- **Transições propostas (a confirmar no planejamento):** Aberta → {Suspensa, Congelada, Cancelada, Finalizada}; Suspensa/Congelada → {Aberta, Cancelada}; Finalizada/Cancelada → Arquivada. Reabertura: ver questão pendente (Seção G).

**Ação atual (etapa do processo seletivo) — lista padronizada (RF08):**
Solicitação recebida → Encaminhada ao gestor → Chamado jurídico → Inscrições → Prova →
Entrevista RH → Entrevista gestor → Habilitação → Divulgação do resultado → Admissão.

- Os **status** (acima) e a **ação atual** (etapas) são **eixos independentes**: uma vaga "Aberta" pode estar em qualquer etapa.
- Cada etapa espelha um campo de data do grupo **Cronograma** (Seção 5).

### B2 — Regra do SLA (RF09 / RF10 / RF11 / RF12) ✔ decidido

- **Início:** data de abertura da vaga.
- **Marco final (SLA da vaga):** **divulgação do resultado** (conforme RF10). "Vaga fechada no prazo" = resultado divulgado em **≤ 20 dias úteis**. A "data de encerramento" e a "admissão" são eventos **posteriores** que não contam para o SLA.
- **Contagem corrente:** enquanto a vaga estiver Aberta, conta até hoje; ao divulgar o resultado, congela no valor final (RF10).
- **Pausas:** o cronômetro **pausa** nos status **Suspensa** e **Congelada** (B1). Nos demais períodos mede tempo de relógio (incluindo esperas de gestor/jurídico, que têm timers próprios).
- **Dias úteis:** exclui **sábados/domingos + feriados nacionais** (incluindo móveis: Carnaval, Sexta-feira Santa, Corpus Christi) **+ tabela de feriados própria, configurável por unidade/município**. Implementação: `src/lib/sla.ts` com `date-fns` + tabela de feriados própria (evita dependência externa).
- **Timers auxiliares:** **gestor (RF11)** = dias **úteis** entre encaminhamento e retorno; **jurídico (RF12)** = "contagem em dias" **corridos** (conforme Seção 5) entre abertura do chamado e recebimento do parecer.
- **Terminologia:** "SLA" (com meta de 20 dias úteis) refere-se à **vaga**; os tempos de gestor/jurídico são **durações medidas** (sem meta fixa nesta versão) — resolve o drift "SLA gestor/jurídico" vs "tempo de resposta".

### B3 — Backend, autenticação e RBAC ⏳ em aberto

Decisão de arquitetura a definir com o time de infra/TI (não bloqueia a modelagem funcional, mas
condiciona RF16/RF17 reais). Pontos a decidir: **camada de backend/persistência** (API própria vs
BaaS vs mock temporário), **mecanismo de auth** (JWT próprio vs SSO corporativo SESI vs Clerk) e o
**RBAC** (mapear papéis → operações — depende de B7). Independentemente da escolha: adicionar
`beforeLoad` de guarda em `routes/_authenticated/route.tsx` e substituir o mock do `auth-store`.

### B4 — Priorização / MVP (faseamento) ✔ decidido

Faseamento aprovado (a lista plana RF01–RF25 passa a ter ordem de entrega):

| Fase | Escopo | RFs |
|---|---|---|
| **0 — Fundações** | Limpar template + rebrand + nav pt-BR; i18n; camada de dados; modelo + enum de status/ação (B1); guard de rota | — |
| **1 — Núcleo CRUD** | Lista+filtros, form criar/editar, detalhe, soft-delete, histórico/auditoria | RF01–08, RF16, RF17 |
| **2 — SLA & Processo** | Motor de SLA (B2), cronograma, timers, resultado | RF09–15 |
| **3 — Importação** | Parser, validação, dedup, wizard/prévia | RF18–22 |
| **4 — Indicadores** | Dashboards, relatórios, exportação | RF23–25 |

### B5 — Campos mínimos para criar a vaga (RF06) ✔ decidido

**Obrigatórios na criação** (conjunto enxuto operacional): nº do chamado e/ou código da vaga,
unidade/área, gestor solicitante, cargo, tipo de contrato, recrutador, data de abertura.
Ao criar, a vaga nasce com **status = Aberta** e o SLA inicia.

**Preenchíveis ao longo do processo** (não bloqueiam a criação): cronograma, dados de gestor/jurídico,
resultado (candidato selecionado, previsão de admissão), candidato (gênero, interno, banco, aplicados),
controle (encerramento, motivo). O RF06 valida **apenas o subconjunto obrigatório acima**.
Isso mitiga o risco de adoção (B5/produto): criar é rápido; o detalhe é progressivo.

### B6 — Proteção de dados de candidatos / LGPD ✔ decidido

**Novo requisito (RF26 — Proteção de dados pessoais):** o sistema deve
(a) **classificar** os campos sensíveis de candidato (gênero, candidato interno, candidato selecionado);
(b) **restringir** a visualização e a **exportação** (RF25) desses campos por papel;
(c) aplicar **política de retenção/anonimização** de dados de candidatos em vagas encerradas;
(d) registrar a **base legal** sob a LGPD (minimização e finalidade).
Detalhamento da política de retenção a validar com o DPO do SESI antes do go-live.

### B7 — Atores: usuários vs partes referenciadas ✔ decidido

**Usuários com login (3):** RH (Recrutador/a), Gestora de RH, Administrador do sistema.
**Partes referenciadas (sem login):** **Gestor solicitante** e **Jurídico** — seus dados são
inseridos pelo RH e seus tempos são medidos (RF11/RF12), mas não acessam o sistema nesta versão.
- Resolve o termo "gestor" sobrecarregado (C3): "gestor solicitante" e "responsável pela vaga" são
  atributos de dados da vaga; a usuária é a **Gestora de RH**. Padronizar o vocabulário nesse sentido.
- O **RBAC** (B3) mapeia operações a esses 3 papéis (ex.: RH cria/edita/importa; Administrador gere usuários e acessa auditoria/exportação de campos sensíveis).

### B8 — Ação sobre duplicados na importação ✔ decidido

A prévia (RF22) **marca** cada duplicado (chave = nº do chamado + código da vaga, ver questão em aberto)
e **por padrão NÃO sobrescreve** o registro existente (protege o cadastro manual). Sobrescrever exige
**opt-in explícito por linha** na tela de prévia. Registros novos entram normalmente.

### FYI aplicados (baixa prioridade)

- **Vocabulário de estado:** "status" = estado geral (B1); "ação atual" = etapa (B1). Substituir "situação atual" (Seção 4) por "status".
- **Tela inicial padrão:** **lista de vagas** (núcleo operacional).
- **Planilha como entrada não confiável:** além do layout (RF20), validar tipo/tamanho do arquivo e neutralizar conteúdo de célula que possa virar fórmula na reexportação (mitigar CSV/formula injection).

### Perguntas ainda em aberto (resolver no planejamento)

1. **B3 — Backend + auth + RBAC** (arquitetura, com infra/TI).
2. **Identificador único da vaga:** confirmar chave (nº do chamado **e** código? ou "e/ou"?). Toda vaga criada direto tem nº de chamado?
3. **Reabertura** (campo Controle): mesmo registro ou novo? O SLA reinicia ou continua?
4. **"Origem do cadastro" vs "fonte dos dados":** campos distintos ou redundantes?
5. **SLA de 20 dias úteis:** uniforme para todo contrato/cargo/nível, ou varia por tipo?
6. **LGPD:** política de retenção/anonimização concreta (prazo) — com o DPO.
7. **Acessibilidade/responsividade** e **estado vazio de 1º uso** — definir metas no design.
8. **Baseline & meta de sucesso:** medir a taxa atual de estouro do SLA de 20 dias e o volume mensal de vagas, para justificar o build e permitir avaliar resultado (achado product-lens P2).
9. **SLA — âncora inicial:** B2 fixou o início na "data de abertura"; medir/exibir também o intervalo "recebimento → abertura" para não ocultar o tempo pré-abertura (achado adversarial P2).
10. **Arquitetura da informação:** definir as colunas primárias da lista de vagas e a hierarquia dos ~50 campos na tela única de detalhe (achado design-lens P2).
11. **Finalidade do campo "gênero":** confirmar se responde a um indicador de diversidade declarado — a LGPD (B6) exige finalidade e minimização, e hoje nenhum dashboard o referencia (achado product-lens P2).
