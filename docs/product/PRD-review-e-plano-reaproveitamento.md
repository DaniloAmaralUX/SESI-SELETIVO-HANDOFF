---
titulo: Revisão do PRD + Mapa de Requisitos/Jornadas + Plano de Reaproveitamento shadcn-admin
relacionado: PRD-sistema-rh-gestao-vagas.md
metodo: ce-doc-review (7 personas) + bancada de reaproveitamento (5 agentes) sobre o template shadcn-admin
data: 2026-07-13
---

# Revisão do PRD — Sistema de RH para Gestão de Vagas

Companion do [PRD](PRD-sistema-rh-gestao-vagas.md). Consolida: **(A)** achados da revisão
por prioridade, **(B)** matriz de requisitos → módulos, **(C)** jornadas principais,
**(D)** plano de reaproveitamento do `shadcn-admin` e **(E)** faseamento sugerido.

---

## 0. Sumário executivo

O PRD da Q.A. é **sólido e bem estruturado** (25 RFs, catálogo de campos, épicos/user stories).
O pivô — de "leitor de planilhas" para "produto operacional com CRUD de vagas no núcleo" — é
coerente. Os achados **não são erros graves de conteúdo**; são **lacunas de especificação** que,
se não resolvidas antes de planejar, fazem dois implementadores construírem coisas diferentes.

**Reaproveitamento do template: alto.** Das ~44 capacidades mapeadas, **~3 são reuso direto,
~26 "adaptar" (herdar componente e trocar dados/campos) e ~15 "novo"** (mas quase todos os "novos"
ainda montam sobre primitives do shadcn/ui). O `shadcn-admin` cobre praticamente toda a casca,
tabelas, formulários, dialogs, gráficos e tema. O que é genuinamente novo concentra-se em
**5 motores de domínio**: cálculo de SLA em dias úteis, página de detalhe, timeline de histórico,
pipeline de importação (parser+dedup+wizard) e RBAC/guard de rota.

**3 bloqueadores** a decidir antes do planejamento técnico:
1. **Enum de status e etapas + máquina de estados** (RF05/RF07/RF08) — nunca enumerados.
2. **Regra de SLA** (RF09–RF12) — marco final, pausas e calendário de feriados indefinidos.
3. **Backend + autenticação/RBAC** — o template é frontend-only e mock; RF16/RF17 (auditoria) exigem identidade real.

---

## A. Achados da revisão (por prioridade)

Legenda: **P0/P1** = resolver antes de planejar · **P2** = resolver no planejamento · **FYI** = advisório.
Confiança (conf.) na escala ce-doc-review (75 = verificado, impacta execução).

### 🔴 Bloqueadores (cross-persona, conf. 75)

**B1 — Enum de status e "ação atual" nunca enumerados; estados divergem entre seções.**
`RF05 / RF07 / RF08 / Seção 4` — *coherence + design + scope concordam.*
A Seção 4 fala em "cancelamento, arquivamento, inativação"; o RF05 lista "cancelar, suspender,
congelar, finalizar, arquivar". O RF07 exige "lista padronizada" que o documento nunca lista, e o
RF08 depende das "etapas do processo seletivo" também não enumeradas. Sem isso, filtro (RF03),
badges, dropdown de edição e relatórios (RF24) adotam vocabulários diferentes.
→ **Ação:** enumerar (1) a lista canônica de **status** da vaga, (2) a lista de **ações/etapas**, e
(3) as **transições válidas** (máquina de estados). Consolidar termos sobrepostos (suspender≈congelar? cancelar≈inativar?).

**B2 — Regra de SLA subespecificada: marco final, pausas e feriados.**
`RF09 / RF10 / RF11 / RF12` — *coherence + adversarial.*
Três lacunas no principal indicador do produto: (a) o marco final diverge — RF10 conta "até a
divulgação do resultado", mas a user story e a Seção 5 falam em "fechamento"/"vaga fechada no
prazo" (e há ainda "data de encerramento" e "admissão", posteriores); (b) não há regra de **pausa**
do cronômetro para estados de suspensão/congelamento (RF05) nem para esperas de gestor/jurídico;
(c) "20 dias **úteis**" (RF09) não define a **fonte de feriados** (nacional/estadual/municipal).
→ **Ação:** fixar o marco (recomendado: divulgação do resultado, texto mais específico do RF10),
definir o que pausa a contagem, e a fonte do calendário de feriados.

**B3 — Autenticação, autorização (RBAC) e identidade ausentes.**
`Seção 6 / RF16 / RF17 / Frontmatter (5 atores)` — *security + feasibility.*
Cinco papéis declarados e **zero requisitos de login/autorização**. RF17 ("registrar usuário") e a
user story de auditoria dependem de identidade que o documento nunca exige. Além disso, o baseline
declarado (shadcn-admin) é **frontend-only** — não há backend, banco nem auth real que forneça o
"quem". → **Ação:** decidir **backend/persistência + provedor de auth** (Clerk vs próprio) e adicionar
RFs de autenticação e de autorização por papel mapeando os atores às operações.

### 🟠 Importantes (P1/P2, conf. 75)

**B4 — 25 RFs sem priorização/MVP; a hierarquia declarada na prosa não vira escopo.**
`Seção 6` — *product + scope.* O texto diz "CRUD é o núcleo, planilha/relatórios são secundários",
mas a lista RF01–RF25 é plana. → Adicionar tiers/fases (ver **Seção E**).

**B5 — Risco de adoção: cadastro manual de ~40 campos pode empurrar o RH de volta à planilha.**
`Seção 1 / Seção 5` — *product + adversarial (migração) + design.* Sem **conjunto mínimo de campos
para criar** a vaga (resto progressivo) e sem estratégia que torne o cadastro direto a fonte de
verdade, o RF18 (importação em lote) vira rota recorrente e cria duas fontes divergentes.
→ Definir campos mínimos + regra de reconciliação (cadastro direto autoritativo).

**B6 — PII/LGPD: dados de candidatos coletados e exportáveis sem postura de proteção.**
`Seção 5 / RF25` — *security.* Gênero, candidato interno/selecionado são coletados e exportáveis
(RF25) sem classificação, restrição por papel, retenção/anonimização ou base legal.
→ Adicionar RF de proteção de dados (classificação, acesso restrito, retenção, LGPD).

**B7 — Papéis "Jurídico" e "Gestor solicitante": usuários ou apenas dados?**
`Frontmatter / Seção 5 / Épicos` — *scope + product + coherence.* Ambos aparecem só como campos/SLA
medido; nenhuma user story os coloca como usuários. Ainda, "gestor" é usado em 3 papéis
(solicitante, responsável, acionado). → Definir quais atores têm login e padronizar o vocabulário de "gestor".

**B8 — Importação não define a ação sobre duplicados.**
`RF21 / RF22 / Seção 8` — *design.* A prévia detecta duplicados mas não diz o que o usuário faz
(pular/sobrescrever/mesclar). Recomendação: por padrão **não sobrescrever**, exigindo opt-in por linha.

### 🔵 FYI / advisório (conf. 50 — registrar, não bloqueiam)

- **Vocabulário de estado:** "situação atual" (Seção 4) vs "status" (RF07) vs "ação atual" (RF08) — padronizar termo.
- **"SLA gestor/jurídico" vs "tempo de resposta"** (RF11/12): reservar "SLA" (meta) para a vaga; gestor/jurídico são durações medidas — a menos que se queira meta própria.
- **Tela inicial padrão** não definida (provável: lista de vagas).
- **Planilha como entrada não confiável** (RF20 valida só layout): risco de CSV/formula-injection na reexportação — endurecer validação.
- **Acessibilidade/responsividade e estado vazio de 1º uso** não mencionados.

### ❓ Perguntas em aberto herdadas do próprio PRD (Seção 8)

- **Identificador único da vaga**: RF21 usa "nº do chamado **e/ou** código"; Seção 8 usa "**e**". Toda vaga tem nº de chamado (inclusive as criadas direto)? Afeta identidade e dedup.
- **Semântica de reabertura**: mesmo registro ou novo? O SLA reinicia ou continua?
- **"Origem do cadastro" vs "fonte dos dados"**: campos distintos ou redundantes?
- **SLA de 20 dias é uniforme** para todo tipo de contrato/cargo, ou varia?

---

## B. Matriz de Requisitos → Módulos → Reaproveitamento

| RF | Capacidade | Módulo | Épico | Reuso |
|---|---|---|---|---|
| RF01, RF06 | Criar vaga + validação obrigatória | Cadastro de Vaga | Gestão de Vagas | adaptar |
| RF02 | Editar vaga | Cadastro de Vaga | Gestão de Vagas | adaptar |
| RF03 | Listar/filtrar (status, ação, área, gestor, recrutador, cargo, período) | Lista de Vagas | Gestão de Vagas | adaptar |
| RF04 | Detalhe completo (tela única) | Detalhe da Vaga | Gestão de Vagas | **novo** |
| RF05 | Cancelar/suspender/congelar/finalizar/arquivar (soft-delete) | Ciclo de Vida | Gestão de Vagas | adaptar |
| RF07, RF08 | Status + ação atual (listas padronizadas) | Máquina de Estados | Controle de Processo | adaptar |
| RF09, RF10 | SLA 20 dias úteis (cálculo + contagem corrente) | Motor de SLA | SLA e Prazos | **novo** |
| RF11, RF12 | Timers gestor / jurídico | Motor de SLA | SLA e Prazos | **novo** |
| RF13 | Cronograma (datas + período de inscrição) | Cronograma | Controle de Processo | adaptar |
| RF14, RF15 | Resultado (candidato, gênero, interno, banco, aplicados) | Resultado | Resultado da Seleção | adaptar |
| RF16, RF17 | Histórico de alterações + auditoria (quem/quando) | Histórico & Auditoria | Histórico e Auditoria | **novo** |
| RF18 | Upload de planilha | Importação | Importação de Planilha | adaptar |
| RF19, RF22 | Wizard + carga em lote + prévia | Importação | Importação de Planilha | **novo** |
| RF20 | Validação de layout/conteúdo | Importação | Importação de Planilha | **novo** |
| RF21 | Detecção de duplicados | Importação | Importação de Planilha | **novo** |
| RF23 | Dashboards (KPIs, gráficos, gargalos) | Dashboards | Dashboards | adaptar |
| RF24 | Relatórios analíticos filtráveis | Relatórios | Relatórios | adaptar |
| RF25 | Exportar filtrado (CSV/xlsx) | Exportação | Relatórios | **novo** |

---

## C. Jornadas principais

**J1 — Ciclo de vida da vaga (núcleo).** Login → Lista de vagas → **Nova vaga** (campos mínimos;
status "aberta", SLA inicia) → atualizar **ação atual**/cronograma (inscrição→prova→entrevistas→habilitação→admissão)
→ **encaminhar ao gestor** (timer) → **chamado jurídico** (timer) → **registrar resultado**
(candidato, aplicados, banco) → **divulgação do resultado** (SLA encerra) → **encerrar/arquivar**.
Toda alteração alimenta o histórico (RF16/RF17).

**J2 — Consulta e detalhe.** Lista → filtros facetados + período → **detalhe** (12 grupos em abas) → aba **histórico**.

**J3 — Encerramento não-destrutivo.** Ação (cancelar/suspender/congelar/finalizar/arquivar) + **motivo** → preserva registro (RF05).

**J4 — Importação (secundária).** Upload → validação de layout → **dedup** (nº chamado + código) → **prévia/revisão** (resolver conflitos) → confirmar carga.

**J5 — Indicadores.** Dashboard (vagas, SLA, gargalos por etapa) → relatórios filtrados → **exportar**.

**J6 — Auditoria (admin).** Consultar logs quem/o quê/quando; timeline no detalhe da vaga.

**J7 — Administração.** Gerir usuários e papéis (RBAC).

---

## D. Plano de Reaproveitamento shadcn-admin

> `direto` = usar como está (trocar dados fake por reais) · `adaptar` = herdar componente e modificar · `novo` = construir, mas sobre primitives shadcn/ui.

### D1. Casca, navegação, tema (majoritariamente `direto`)
- **`direto`**: `layout/authenticated-layout.tsx`, `app-sidebar.tsx`, `header.tsx`, `ui/sidebar.tsx`, busca global (`command-menu.tsx` deriva do sidebar-data), tema/aparência/densidade/fonte (`context/*-provider.tsx`, `config-drawer.tsx`) — tudo persistido em cookie.
- **`adaptar`**: `layout/data/sidebar-data.ts` (trocar Dashboard/Tasks/Apps/Chats/Users/Clerk pelos módulos de Vagas/Dashboards/Relatórios/Importação/Auditoria); `profile-dropdown.tsx`/`nav-user.tsx` (ligar ao usuário real); `team-switcher.tsx` → `app-title.tsx` (rebrand).

### D2. CRUD de vagas
- **Formulário (RF01/02/06)** — `adaptar` de `features/users/components/users-action-dialog.tsx` (padrão `useForm`+`zodResolver`+`<Form>`). O dialog de coluna única **não comporta ~40 campos**: migrar para **página de formulário dedicada com abas por grupo** (ou Sheet largo, padrão `tasks-mutate-drawer.tsx`). Datas via `date-picker.tsx`; booleanos (PCD, interno, banco) via `ui/switch`.
- **Lista + filtros (RF03)** — `adaptar` de `features/users/components/users-table.tsx` + `components/data-table/*` (toolbar, faceted-filter, pagination, view-options) + `hooks/use-table-url-state.ts` (filtros/paginação na URL). **Gap:** filtro por **período** (o faceted-filter só faz multi-select) → construir range com Calendar.
- **Status/ação (RF07/08)** — `adaptar` do padrão `features/tasks/data/data.tsx` (listas `{label,value,icon}`) + `ui/badge`. **Gap:** máquina de transições não existe.
- **Detalhe (RF04)** — **`novo`**: o template só tem lista+dialog. Criar rota `routes/_authenticated/vagas/$id.tsx` (ref: `errors/$error.tsx`) + layout `Card`/`Tabs`.
- **Soft-delete (RF05)** — `adaptar` de `confirm-dialog.tsx`, mas **reescrever a semântica** (os delete-dialogs do template dizem "permanently remove"). Capturar motivo.
- **Histórico/auditoria (RF16/17)** — **`novo`**: sem timeline no template; montar com `Card`+`Separator`+`Avatar`+`Badge`+`ScrollArea` + `date-fns`.

### D3. SLA, cronograma, resultado
- **Motor de SLA (RF09–RF12)** — **`novo`**: criar `src/lib/sla.ts` com `date-fns` (`addBusinessDays`, `differenceInBusinessDays`). **Gap crítico:** `date-fns` exclui só fins de semana, **não feriados** (inclusive móveis: Carnaval, Corpus Christi).
- **Indicador de prazo** — `adaptar` `ui/badge` (adicionar variantes `success`/`warning` ao cva).
- **Cronograma/datas (RF13)** — `adaptar` `date-picker.tsx` (padrão `account-form.tsx` campo `dob`). **Gaps:** (a) o DatePicker bloqueia **datas futuras** (`disabled date > new Date()`) — inviável p/ prova/admissão; (b) formata em inglês → `dd/MM/yyyy` + locale ptBR; (c) **período de inscrição** precisa de `DateRangePicker` (Calendar já suporta `mode='range'`, o wrapper não).
- **Resultado (RF14/15)** — `adaptar` (SelectDropdown/Switch/Input number).

### D4. Importação de planilha
- **Upload (RF18)** — `adaptar` de `features/tasks/components/tasks-import-dialog.tsx` (já é RHF+zod+input file!): trocar `accept` p/ `.xlsx,.xls,.csv` e o `onSubmit` fake por parse real.
- **Prévia (RF22)** — `adaptar` do stack `data-table` (grid com seleção de linhas, bulk-actions, paginação).
- **Validação (RF20), dedup (RF21), wizard+commit (RF19/22)** — **`novo`**: sem parser, sem dedup, sem stepper no template.
- **Gap/dependência:** **não há parser de planilha** → adicionar **`xlsx` (SheetJS)** (cobre .xlsx/.xls/.csv). Wizard sobre `ui/tabs`; confirmação com `ConfirmDialog` + `toast.promise` (sonner) do padrão `tasks-multi-delete-dialog.tsx`.

### D5. Dashboards, relatórios, export
- **`adaptar` (muito reuso):** shell `features/dashboard/index.tsx` (Header/Main/Tabs — habilitar aba "Reports" hoje disabled); KPI cards; `overview.tsx` (BarChart recharts); `analytics-chart.tsx` (AreaChart); `SimpleBarList` de `analytics.tsx` (gargalos por etapa, sem dependência); `recent-sales.tsx` (vagas recentes); tabela de relatório = clone de `users-table.tsx`.
- **`novo`:** gráfico **pizza/rosca** de status (só há Bar/Area); **camada de agregação** (todos os dados do template são `Math.random()`/hardcoded); **exportação** — CSV pode ser **sem dependência** (Blob), **.xlsx exige `xlsx`**. O botão "Download" do dashboard hoje é no-op.

### D6. Auth, RBAC, i18n
- **Auth real (RF17)** — `adaptar` `stores/auth-store.ts` + `user-auth-form.tsx` (trocar `sleep`+mockUser por POST real). `main.tsx` já trata 401.
- **Guard de rota** — **`novo`**: `routes/_authenticated/route.tsx` **não tem `beforeLoad`** (área "autenticada" é aberta). Adicionar redirect p/ `/sign-in`.
- **RBAC** — **`novo`**: `AuthUser.role` já é `string[]` e há enum de papéis em `users/data` — remapear p/ RH/gestora/gestor/jurídico/admin e criar `hasRole()`/`RequireRole`. Páginas Forbidden/Unauthorized já existem.
- **i18n pt-BR** — **`novo`**: template é 100% inglês, sem lib. Adicionar `i18next`+`react-i18next`, extrair strings. Datas já cobertas por `date-fns` (locale ptBR).

### D7. Resíduos do template a remover (baseline limpo)
Rotas/features de exemplo **Tasks, Apps, Chats** e o diretório **`routes/clerk/`** + dep `@clerk/react` (se não usar Clerk como IdP); dados `@faker-js/faker`; branding "Shadcn Admin"/"Acme"/avatares fake; metadados do autor (LICENSE, README, index.html, CHANGELOG, `.github/`). *(Este é o passo de limpeza que iniciamos antes — retomável a qualquer momento.)*

---

## E. Faseamento sugerido (MVP incremental)

| Fase | Escopo | RFs | Depende de |
|---|---|---|---|
| **0 — Fundações** | Limpar template + rebrand + nav pt-BR; auth real + guard + RBAC; i18n; camada de dados (TanStack Query + backend); modelo de dados + **enum de status/ação** | (B1, B3) | decisões B1, B3 |
| **1 — Núcleo CRUD** | Lista+filtros, form criar/editar, detalhe, soft-delete, histórico/auditoria | RF01–08, RF16, RF17 | Fase 0 |
| **2 — SLA & Processo** | Motor de SLA (dias úteis+feriados), cronograma, timers, resultado | RF09–15 | B2 |
| **3 — Importação** | Parser xlsx, validação, dedup, wizard/prévia | RF18–22 | B8 + `xlsx` |
| **4 — Indicadores** | Dashboards, relatórios, export | RF23–25 | Fase 1–2 |

## F. Dependências a adicionar
- **`xlsx` (SheetJS)** — parse de importação **e** export .xlsx (RF18–22, RF25). *(CSV export dispensa dependência.)*
- **`i18next` + `react-i18next` + `i18next-browser-languagedetector`** — pt-BR.
- **Feriados brasileiros** — `date-holidays` **ou** tabela própria de feriados (incl. móveis) para o SLA em dias úteis.
- *(Opcionais)* `react-dropzone` (UX de upload), `file-saver` (download robusto), `papaparse` (se a entrada for só CSV).

## G. Decisões pendentes (para você)
1. **Status/etapas + transições** (B1) — definir as listas e a máquina de estados.
2. **SLA** (B2) — marco final, pausas, fonte de feriados.
3. **Backend + auth** (B3) — Clerk vs próprio; papéis com login.
4. **Atores** (B7) — Jurídico e Gestor solicitante são usuários ou dados?
5. **Campos mínimos** de criação vs progressivos (B5).
6. **Identificador único** (chamado+código) e **reabertura**.
7. **LGPD** (B6) — retenção/anonimização + restrição por papel.
8. **Export** — só CSV (sem dep) ou também .xlsx.
9. **MVP** — aprovar o faseamento da Seção E.
