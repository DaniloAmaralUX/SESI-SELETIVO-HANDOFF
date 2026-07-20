# Revisão do PRD + Plano de Reaproveitamento — Sistema de RH para Gestão de Vagas

> ⚠️ **ARQUIVADO / SUPERSEDIDO.** Esta é a versão curta (taxonomia P1/P2/P3) da revisão do PRD.
> A revisão **canônica** — mais completa, com a taxonomia **B1–B8** que o PRD de fato adotou na Seção 9 —
> é [../product/PRD-review-e-plano-reaproveitamento.md](../product/PRD-review-e-plano-reaproveitamento.md).
> Mantido aqui apenas para histórico; não usar como fonte.

> Saída da revisão multi-persona (7 lentes ce-doc-review) do [PRD](../product/PRD-sistema-rh-gestao-vagas.md)
> escrito pela Q.A., cruzada com o mapeamento de reaproveitamento do template `shadcn-admin`
> (5 agentes de arquitetura). Complementa o [estudo do shadcn](../engineering/estudo-shadcn.md).
> Convenção de severidade: **P0/P1** = resolver antes de planejar · **P2** = resolver no planejamento · **P3** = ajuste fino.

---

## Sumário executivo

O PRD é **sólido no “o quê”** (25 RFs, catálogo de campos, épicos/user stories bem cobertos — nenhum
objetivo órfão), mas tem lacunas no **“como” e no “quem”** que bloqueiam o planejamento. Cinco temas
apareceram em **consenso entre 3+ personas**:

1. **Backend/persistência não especificado** — o template é *frontend-only*; CRUD, histórico, auditoria e importação dependem de uma camada de dados que o PRD não menciona.
2. **Autenticação + Autorização (RBAC) ausentes** — 5 atores com privilégios distintos, zero requisito de acesso.
3. **LGPD** — “gênero” e dados de candidatos sem postura de proteção; “não excluir fisicamente” tensiona o direito de eliminação.
4. **Modelo de estados da vaga indefinido** — `status` (RF07) e `ação atual` (RF08) nunca enumerados; RF05 sobrepõe status e ciclo de vida.
5. **Sem priorização/MVP** — 25 RFs com peso igual, embora a narrativa já trate CRUD como núcleo e planilha/relatórios como secundários.

Do lado técnico, a notícia é boa: **~40% reuso direto, ~40% adaptação, ~20% construção nova** sobre o template.

---

## 1. Achados da revisão (por severidade)

### 🔴 P1 — Resolver antes de planejar

| # | Achado | Lentes | RF | Fix proposto |
|---|---|---|---|---|
| 1 | **Backend/persistência não especificado.** Produto operacional com CRUD, histórico e auditoria sem camada de dados/identidade; risco de subdimensionar “metade do sistema”. | feasibility (+reuse) | RF01–05, RF16–22 | Declarar tier de backend/persistência + processamento server-side da importação como escopo fora do template; escolher stack no planejamento. |
| 2 | **Autenticação + RBAC ausentes.** 5 atores (RH, gestora, gestor, jurídico, admin) sem nenhum RF de login/permissão; RF05 e RF25 sem ator autorizado. | security, coherence, adversarial | RF01–05, RF25 | Adicionar RF de autenticação + autorização por papel mapeando cada ator às operações. |
| 3 | **LGPD / proteção de dados.** “Gênero” (dado sensível) e candidatos sem classificação nem controle; RF25 exporta sem restrição; “não excluir fisicamente” conflita com direito de eliminação. | security (+product) | RF14, RF25, Seç.8 | RF de proteção de dados: classificar PII sensível, restringir exportação, política de retenção/eliminação compatível com LGPD. |
| 4 | **Modelo de estados da vaga indefinido.** RF07 cita “lista padronizada” e RF08 “etapas”, mas nenhuma é enumerada; as 5 operações de RF05 se sobrepõem a status. Bloqueia o design do CRUD central. | design, coherence, scope, adversarial | RF05, RF07, RF08 | Enumerar valores canônicos de status e de ação atual; definir relação status × ação × ciclo de vida e as transições válidas. |
| 5 | **Sem priorização/MVP.** 25 RFs achatados impedem sequenciar valor e nomear a fatia mínima. | product, scope, adversarial | RF01–25 | Classificar RFs em tiers (núcleo RF01–17 vs. secundário RF18–25) e nomear o MVP. |
| 6 | **Campos obrigatórios × preenchimento progressivo (RF06).** A vaga acumula dados ao longo do processo; validar “no cadastro” sem definir o subset obrigatório na criação trava o formulário. | design | RF06 | Definir campos obrigatórios na criação vs. progressivos e declarar que vaga parcial é estado salvo válido (rascunho). |
| 7 | **Adoção do cadastro manual não validada.** ~50 campos manuais vs. planilha rápida mantida como “plano B” → risco de não-adoção; sem meta nem piloto. | product, adversarial | Seç.1/3/5 | Definir meta de adoção (vagas cadastradas direto vs. planilha) + campos mínimos + piloto antes do build completo. |
| 8 | **SLA “20 dias úteis”: calendário indefinido + prazo único.** Feriados não definidos (date-fns só exclui fim de semana); assume 20 dias uniforme por vaga. | adversarial (+reuse) | RF09/RF10 | Especificar a fonte de feriados e se o prazo é uniforme ou parametrizável por contrato/área/PCD. |
| 9 | **Importação pode sobrescrever dados manuais; reconciliação indefinida.** RF21 “e/ou” ambíguo; identificador único “possivelmente” (Seç.8); sem regra de colisão campo-a-campo. | adversarial, coherence, design | RF18–22, Seç.8 | Fixar a chave composta (nº chamado + código) e política: casar por chave e **preservar por padrão** o dado manual, mostrando divergências para confirmação explícita. |

### 🟠 P2 — Resolver no planejamento

| # | Achado | Lentes | RF | Fix proposto |
|---|---|---|---|---|
| 10 | **Ambiguidade de “gestor”** — solicitante × responsável pela vaga × gestor do SLA: mesmo papel ou distintos? Muda a modelagem. | coherence | RF11, Seç.5 | Unificar rótulo se for o mesmo papel, ou nomear cada papel distintamente. |
| 11 | **SLA ancorado em “data de abertura” ignora “data do recebimento”** — permite adiar abertura e subestimar o prazo real. | adversarial | RF09/RF10 | Ancorar no recebimento (ou justificar) e registrar o intervalo recebimento→abertura à parte. |
| 12 | **Estados de encerramento divergem** entre Seção 4 (“Excluir/Inativar”, “preferencialmente”), RF05 (proibição absoluta) e Seção 8. | coherence | RF05, Seç.4/8 | Alinhar Seção 4 ao conjunto canônico de RF05 e remover “preferencialmente”. |
| 13 | **Prioridade de informação não definida** — ~50 campos em 12 grupos sem dizer colunas primárias da lista nem hierarquia do detalhe. | design | RF03/RF04 | Indicar colunas primárias e ordem de prioridade dos grupos na tela única. |
| 14 | **Upload sem verificação de segurança** — só valida layout; falta tipo/tamanho e neutralização de injeção de fórmula/CSV (dados vão para export). | security | RF18–22 | Adicionar validação de segurança do arquivo além do layout. |
| 15 | **Critério de sucesso indefinido** — sem linha de base (quantas vagas estouram o SLA hoje) nem meta. | product | Seç.2 | Seção de métricas de sucesso com baseline + meta. |
| 16 | **Campo “gênero” sem propósito** — nenhum dashboard/objetivo de diversidade o referencia. | product | RF14 | Amarrar a um indicador declarado ou remover do cadastro. |

### 🟡 P3 — Ajuste fino

| # | Achado | Lente | Fix |
|---|---|---|---|
| 17 | **Marco final do SLA** oscila entre “fechamento” (user story) e “divulgação do resultado” (RF10). | coherence | Padronizar em “divulgação do resultado” (RF10 ancora). |
| 18 | **Jurídico é ator sem interação/story própria** — usuário do sistema ou só dado registrado pelo RH? | coherence | Definir se tem perfil/acesso ou é parte externa; ajustar a lista de atores. |

---

## 2. Decisões em aberto (checklist a resolver antes/no planejamento)

Perguntas levantadas pelas personas que exigem stakeholders (Q.A., PO, RH, Jurídico, TI):

- [ ] **Backend**: qual camada de persistência/API? (condiciona quase todos os RFs)
- [ ] **Exposição**: internet ou rede interna? Há SSO/identidade corporativa para reusar?
- [ ] **LGPD**: confirmar regime e base legal para “gênero” e dados de candidatos com o Jurídico.
- [ ] **Status × Ação**: quais os valores canônicos e quais transições são válidas?
- [ ] **Ciclo de vida**: “inativar/suspender/congelar/finalizar/arquivar” são estados distintos ou há redundância?
- [ ] **Rascunho**: vaga pode ser salva parcial e completada ao longo do processo?
- [ ] **SLA**: feriados considerados (nacional/estadual/municipal)? Prazo uniforme ou parametrizável? Reabertura reinicia/pausa/continua o relógio? Âncora = recebimento ou abertura?
- [ ] **Identificador único** da vaga: nº do chamado + código (confirmar) — resolve dedup (RF21) e reconciliação.
- [ ] **Papéis**: quais atores têm acesso de escrita? Jurídico é usuário do sistema?
- [ ] **MVP**: vale uma fatia fina (CRUD + lista/filtros) para validar adoção antes de dashboards/relatórios/importação?
- [ ] **Planilha**: entrada permanente (“plano B”) ou aposentada após a carga inicial?
- [ ] **Baseline/meta**: volume mensal de vagas e taxa atual de estouro do SLA.

---

## 3. Mapa de Requisitos → Jornadas

Jornadas principais derivadas dos RFs (ciclo de vida da vaga):

| # | Jornada | Passos | RFs |
|---|---|---|---|
| J1 | **Cadastrar e abrir vaga** | Recebe solicitação → cria vaga (identificação/solicitante/perfil/responsáveis) → valida obrigatórios → status inicial | RF01, RF06, RF07 |
| J2 | **Acompanhar o processo** | Atualiza ação atual pelas etapas → registra cronograma (inscrição→prova→entrevistas→habilitação→admissão) | RF02, RF08, RF13 |
| J3 | **Fluxo do gestor** | Encaminha ao gestor → registra retorno → SLA gestor | RF11 |
| J4 | **Fluxo jurídico** | Abre chamado → recebe parecer → SLA jurídico | RF12 |
| J5 | **SLA da vaga** | Relógio de 20 dias úteis desde a abertura → indicador no prazo/em risco/estourado | RF09, RF10 |
| J6 | **Resultado e encerramento** | Candidato selecionado/gênero/interno/banco + qtd aplicados → divulgação → finaliza/arquiva sem apagar | RF14, RF15, RF05 |
| J7 | **Consultar e ver detalhe** | Lista com filtros (status/ação/área/gestor/recrutador/cargo/período) → tela única de detalhe | RF03, RF04 |
| J8 | **Auditar** | Timeline de alterações + carimbo usuário/data/hora | RF16, RF17 |
| J9 | **Importar planilha** | Upload → validação de layout → dedup → prévia → confirmar | RF18–22 |
| J10 | **Analisar (gestão)** | Dashboards de indicadores → relatórios filtrados → exportar | RF23–25 |

> ⚠️ Jornadas transversais **não cobertas pelo PRD** e necessárias: **J0 Autenticar/autorizar** (login + RBAC) e **J-adm Gerir usuários/papéis** — ver achados #2 e #3.

---

## 4. Plano de Reaproveitamento do template (veredito)

Detalhe por área no journal do workflow; catálogo de biblioteca em [estudo-shadcn.md](../engineering/estudo-shadcn.md).

### 🟢 Reuso DIRETO (herdar quase como está — ~40%)
- **Casca autenticada**: `layout/authenticated-layout`, `main`, `header`, `ui/sidebar`, providers de layout/tema/fonte/direção; `__root.tsx` (loading bar, toaster).
- **Tema/aparência**: claro-escuro, fonte, `config-drawer`, `theme-switch`, shell de Settings (`sidebar-nav` + `content-section`).
- **Tabela (todo o toolkit)**: `components/data-table/*` (toolbar, faceted-filter, pagination, view-options, bulk-actions) + `use-table-url-state` → serve listagem (RF03), relatórios (RF24) e prévia de importação (RF22).
- **URL-state de filtros** (`use-table-url-state`) → relatórios filtrados compartilháveis (RF24→RF25).
- **Login UI** (form+zod+`PasswordInput`+OTP), **logout** (`sign-out-dialog`), **top-nav**.

### 🟡 ADAPTAR (existe, precisa modificar — ~40%)
- **Formulário de vaga**: padrão `useForm`+`zodResolver`+`<Form>` de `tasks-mutate-drawer`/`users-action-dialog`, mas expandido para **multi-seção** (~12 grupos → Tabs/Accordion) e `vagaSchema` completo. Muitos campos de data reusam `date-picker` (via wrapper `FormField`).
- **Colunas/facetas da tabela**: trocar colunas e options de `tasks/users` → vaga (status, ação, área, gestor, recrutador, cargo, SLA).
- **Status/Ação por lista padronizada**: padrão `{label,value,icon}` (`tasks/data/data.tsx`) + mapa de cores por estado (`users/data/data.ts`) + `Badge`. (As *transições* são novas — ver abaixo.)
- **Soft-delete/ciclo de vida (RF05)**: `confirm-dialog` + row-actions viram **ações de mudança de status** (não delete), capturando “motivo”.
- **Auth real**: `auth-store` + `user-auth-form` (mock: token fixo, `sleep(2000)`) → chamada `axios` ao backend + JWT; `role:string[]` vira base dos papéis.
- **Admin de papéis**: feature `users/` (CRUD completo) → trocar enum de roles para (rh, gestora_rh, gestor, juridico, admin) pt-BR.
- **Dashboard**: shell + stat-cards + gráficos `recharts` (`overview`, `analytics-chart`) → trocar dados `Math.random()` por dados reais agregados.
- **Import**: `tasks-import-dialog` (já tem `<Input type=file>` + zod validando `FileList`) → aceitar `.xlsx/.csv` + parse real; estrutura `provider`/`dialogs`/`primary-buttons` como esqueleto do fluxo.

### 🔵 NOVO (construir, reusando primitives — ~20%)
- **Página de detalhe da vaga** (`/vagas/$vagaId`) — o template não tem detalhe de registro (só listas); montar com Card/Tabs/Badge, hospedando abas de Histórico e Auditoria.
- **Máquina de estados** — mapa de transições Status↔Ação + guards (as listas do template são planas).
- **Timeline de histórico/auditoria** (RF16/RF17) — não existe; construir com Card/Separator/Badge/Avatar/ScrollArea + `date-fns`.
- **SLA/dias úteis** — `lib/sla.ts` com `addBusinessDays`/`differenceInBusinessDays` + indicador semântico (no prazo/risco/estourado); `date-fns` só cobre fim de semana → feriados à parte.
- **DateRangePicker + filtro de período** (RF03/RF24) — `ui/calendar` já suporta `mode='range'`, falta o wrapper.
- **Wizard/stepper de importação** (RF18–22) — não há stepper; montar com `ui/tabs` + estado.
- **Parser + validação de layout + dedup** (RF20/RF21) — `vagaImportRowSchema` (zod) + chave composta; **sem parser no template**.
- **Exportação CSV/XLSX** (RF25) — não há geração de arquivo (o botão “Download” do dashboard é placeholder morto).
- **RBAC + guard de rota** — `_authenticated/route.tsx` **não tem `beforeLoad`** (qualquer um acessa); filtrar `navGroups` por papel + `beforeLoad` por papel + `can()/hasRole()`; páginas 401/403 já existem.
- **i18n pt-BR** — template 100% em inglês; traduzir strings (ou `i18next`); `date-fns` já tem locale pt-BR.

### 📦 Dependências a adicionar
| Pacote | Para | Necessidade |
|---|---|---|
| `xlsx` (SheetJS) | Import (RF18/20) **e** export .xlsx (RF25) | **Alta** (custo compartilhado) |
| `papaparse` (+`@types/papaparse`) | Parse robusto de CSV | Média |
| `date-holidays` ou lista local de feriados BR | Descontar feriados no SLA | Condicional (se SLA considerar feriados) |
| `i18next` + `react-i18next` | i18n gerenciada | Opcional (vs. strings pt-BR diretas) |
| `file-saver` | Download de Blob cross-browser | Opcional (nativo `<a download>` basta) |
| **via shadcn CLI (sem npm novo)** | `chart`, `progress`, `breadcrumb`, `accordion`, `toggle-group` | Recomendado |

### ⚙️ Gaps de infraestrutura (fora do shadcn)
- **Camada de dados real**: `@tanstack/react-query` está instalado mas **não é usado** nas features (dados são faker; mutações só chamam `showSubmittedData`). Precisa do data layer contra o backend.
- **Backend + Auth real + RBAC** — ver achados #1 e #2.

---

## 5. Próximos passos sugeridos
1. **Resolver o checklist da Seção 2** com os stakeholders (principalmente backend, status/ação canônicos, LGPD, MVP).
2. **Limpar o template** (remover demos: apps, chats, clerk, dashboard fake) → baseline enxuta.
3. **Adicionar componentes/deps** (Seção 4) e reescrever `sidebar-data.ts` para a navegação de vagas.
4. **Modelar `vagaSchema`** (zod) a partir do catálogo de campos e reusar `features/users|tasks` como referência de CRUD.
5. **Fatia fina primeiro** (CRUD + lista/filtros + detalhe) para validar a adoção do cadastro manual antes de dashboards/relatórios/importação.
