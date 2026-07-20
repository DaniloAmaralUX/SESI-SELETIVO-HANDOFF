---
titulo: Arquitetura da Informação — Sistema de RH / Gestão de Vagas
tipo: information-architecture
status: proposta
autor: UX designer do projeto
data: 2026-07-13
baseline_tecnica: template shadcn-admin (React 19 + Vite + TanStack Router/Query/Table + shadcn/ui + Tailwind v4)
fontes:
  - docs/product/PRD-sistema-rh-gestao-vagas.md (fonte de verdade — Seção 9 decisões B1–B8, RF26)
  - docs/product/PRD-review-e-plano-reaproveitamento.md
  - auditoria do design system (2026-07-13)
---

# Arquitetura da Informação — Sistema de RH / Gestão de Vagas

> Este documento define **como a informação do sistema é organizada, nomeada e navegada**:
> atores, modelo mental, mapa de navegação, rotas, inventário de telas, hierarquia de conteúdo
> das telas densas e o mapeamento de cada superfície aos componentes do **shadcn/ui** já disponíveis.
> É a ponte entre o PRD (o *quê*) e o design de telas (o *como se parece*).

---

## 1. Princípios de IA

1. **A vaga é o objeto central.** Toda a navegação orbita a entidade *Vaga*; o resto é apoio
   (indicadores, administração, configuração).
2. **Dois eixos, nunca misturados.** *Status* (situação) e *Ação atual* (etapa) são independentes
   e têm representações visuais distintas — o usuário nunca deve confundir "onde a vaga está" com
   "o que está acontecendo com ela".
3. **Criar é raso; detalhar é progressivo.** A criação pede o mínimo (7 campos); os ~50 campos
   restantes se revelam ao longo do processo, agrupados por afinidade.
4. **A lista é a casa.** A tela inicial é a lista de vagas — o núcleo operacional do RH.
5. **Reuso do template acima de tudo.** Cada tela é composta de primitivos shadcn já auditados;
   só se cria componente novo quando o domínio exige (badge de status, indicador de SLA, timeline).
6. **Vocabulário único (pt-BR).** "Status", "Ação atual", "SLA", "Recrutador", "Gestora de RH" —
   termos padronizados conforme decisões B1/B7 do PRD.

---

## 2. Atores e acesso

Três papéis **com login** (decisão B7); Gestor solicitante e Jurídico são **dados referenciados**,
sem acesso ao sistema.

| Papel | O que faz | Superfícies principais |
|---|---|---|
| **RH (Recrutador/a)** | Cria, edita e acompanha vagas; importa planilha | Vagas, Detalhe, Criar/Editar, Importar |
| **Gestora de RH** | Acompanha SLAs, gargalos e resultado; supervisiona | Vagas, Dashboards, Relatórios |
| **Administrador** | Gere usuários, feriados/unidades, auditoria e exportação de dados sensíveis | Administração, Auditoria, Relatórios |

---

## 3. Modelo mental central — os dois eixos

O coração da IA. Uma vaga tem **simultaneamente** um *status* e uma *ação atual*.

**Eixo A — Status (6, decisão B1):** situação geral, controla o cronômetro de SLA.

| Status | Significado | SLA |
|---|---|---|
| Aberta | Em andamento | conta |
| Suspensa | Pausada (decisão RH/gestor) | **pausa** |
| Congelada | Pausada por bloqueio externo | **pausa** |
| Cancelada | Encerrada sem contratação (exige motivo) | encerra |
| Finalizada | Encerrada com contratação | encerra |
| Arquivada | Fora da operação, preserva histórico | — |

**Eixo B — Ação atual (10 etapas, decisão B1):** onde a vaga está no processo seletivo.
Solicitação recebida → Encaminhada ao gestor → Chamado jurídico → Inscrições → Prova →
Entrevista RH → Entrevista gestor → Habilitação → Divulgação do resultado → Admissão.

**Implicação de IA/UX:** na lista, *status* = **Badge** colorido e *ação atual* = coluna textual/stepper;
no detalhe, *status* fica no cabeçalho e *ação atual* vira uma **timeline/stepper** horizontal.
Cada etapa espelha um campo de data do grupo Cronograma.

---

## 4. Mapa de navegação (sitemap)

Nova estrutura da sidebar (substitui os grupos de demo *General/Pages/Other* do template).
Itens visíveis por papel (ver matriz na §13).

```
Sistema de Gestão de Vagas
│
├─ OPERAÇÃO
│  ├─ Vagas ...................... /              (tela inicial — lista)
│  │   ├─ Nova vaga .............. /vagas/nova
│  │   ├─ Detalhe da vaga ........ /vagas/:id
│  │   ├─ Editar vaga ............ /vagas/:id/editar
│  │   └─ Importar planilha ...... /vagas/importar
│  │
├─ INDICADORES
│  ├─ Dashboard .................. /indicadores          (RH gestão)
│  └─ Relatórios ................. /relatorios           (analítico + exportação)
│
├─ ADMINISTRAÇÃO   (somente Administrador)
│  ├─ Usuários ................... /admin/usuarios
│  ├─ Unidades & Feriados ........ /admin/calendarios    (base do motor de SLA)
│  └─ Auditoria .................. /admin/auditoria
│
└─ CONFIGURAÇÕES
   ├─ Perfil ..................... /configuracoes
   ├─ Conta ...................... /configuracoes/conta
   ├─ Aparência .................. /configuracoes/aparencia
   └─ Notificações ............... /configuracoes/notificacoes

Fora do shell autenticado:
├─ Entrar ....................... /entrar
├─ Esqueci a senha .............. /esqueci-senha
├─ Código (OTP) ................. /otp
└─ Erros ........................ /erros/{401,403,404,500,manutencao}
```

**Header global (persistente):** busca de vagas (⌘K → Command palette), troca de tema, sino de
notificações, avatar/menu do usuário, breadcrumb contextual.

---

## 5. Mapa de rotas

Rotas em `src/routes/` (TanStack Router, file-based). O grupo `_authenticated` já existe no template
e recebe o `beforeLoad` de guarda (RBAC, decisão B3).

| Rota | Tela | Papel mínimo | Fase |
|---|---|---|---|
| `/entrar`, `/esqueci-senha`, `/otp` | Autenticação | público | 0 |
| `/` | Lista de vagas | RH | 1 |
| `/vagas/nova` | Criar vaga | RH | 1 |
| `/vagas/:id` | Detalhe da vaga | RH | 1 |
| `/vagas/:id/editar` | Editar vaga | RH | 1 |
| `/vagas/importar` | Wizard de importação | RH | 3 |
| `/indicadores` | Dashboard gerencial | Gestora de RH | 4 |
| `/relatorios` | Relatórios + exportação | Gestora de RH | 4 |
| `/admin/usuarios` | Gestão de usuários | Administrador | 0/2 |
| `/admin/calendarios` | Unidades & feriados (SLA) | Administrador | 2 |
| `/admin/auditoria` | Trilha de auditoria | Administrador | 1 |
| `/configuracoes/*` | Preferências do usuário | qualquer logado | 0 |
| `/erros/*` | Estados de erro | — | 0 |

---

## 6. Inventário de telas

Cada tela com propósito e os **componentes shadcn** que a compõem (todos já instalados, salvo os
marcados ✚ = novos a criar).

### 6.1 Lista de vagas — `/`  *(núcleo)*
Encontrar, filtrar e agir sobre vagas em massa. → **DataTable** (Table + column-header + toolbar +
faceted-filter + pagination + bulk-actions), **Badge** (status), **Input** (busca), **Select**,
**DropdownMenu** (ações de linha), **Button**. Ver anatomia na §7.

### 6.2 Detalhe da vaga — `/vagas/:id`
Visão 360° de uma vaga em tela única. → **Tabs**, **Card**, **Badge**, **Separator**, **Tooltip**,
**HoverCard**, **Avatar**, ✚ **StatusBadge**, ✚ **SLAIndicator**, ✚ **StageStepper**, ✚ **Timeline**.
Ver hierarquia na §8.

### 6.3 Criar / Editar vaga — `/vagas/nova`, `/vagas/:id/editar`
Cadastro mínimo + preenchimento progressivo. → **Form** (FieldGroup + Field), **Input**, **Select**,
**Combobox**, **DatePicker** (Calendar + Popover), **Textarea**, **Switch**, **Checkbox**,
**Button**, **Sonner** (toast de sucesso). Ver fluxo na §9.

### 6.4 Importar planilha — `/vagas/importar`  *(Fase 3)*
Carga secundária com validação e prévia. → ✚ **Stepper**, **Card**, **Alert** (erros de layout),
**Table** (prévia), **Checkbox** (opt-in de sobrescrita por linha), **Progress**, **Button**,
**AlertDialog** (confirmar carga). Ver fluxo na §11.

### 6.5 Dashboard — `/indicadores`  *(Fase 4)*
Indicadores de vagas, SLA, gargalos. → **Chart** (Recharts), **Card** (KPIs), **Badge**, **Select**
(período), **Tabs**. 

### 6.6 Relatórios — `/relatorios`  *(Fase 4)*
Relatórios analíticos + exportação filtrada (respeitando LGPD, RF26). → **DataTable**, **Select**,
**DatePicker**, **Button** (exportar), **AlertDialog** (confirmação de exportar dados sensíveis).

### 6.7 Administração — `/admin/*`
Usuários (**DataTable** + **Sheet** de edição), Unidades & Feriados (**DataTable** + **Calendar** +
**DatePicker**), Auditoria (**DataTable** somente-leitura + **HoverCard** de diff).

### 6.8 Configurações — `/configuracoes/*`
Reaproveitadas do template (**Tabs** + **Form** + controles). Rebranding pt-BR.

### 6.9 Estados de sistema
Vazio → ✚ **Empty**; carregando → **Skeleton**; sem permissão → páginas `/erros/*`; feedback →
**Sonner** + **Alert**. Ver §14.

---

## 7. Anatomia — Lista de vagas

**Colunas primárias** (arquitetura da informação da tabela — resolve a questão em aberto #10 do PRD):

| Coluna | Conteúdo | Componente |
|---|---|---|
| Seleção | checkbox de linha (ações em massa) | Checkbox |
| Código / Chamado | identificador da vaga | texto + link |
| Cargo | cargo + unidade/área (subtítulo) | texto 2 linhas |
| Status | Aberta/Suspensa/… | ✚ StatusBadge |
| Ação atual | etapa corrente | Badge outline |
| SLA | dias decorridos / meta 20, com estado | ✚ SLAIndicator (Progress) |
| Recrutador | responsável | Avatar + nome |
| Abertura | data | texto (date-fns) |
| Ações | ver/editar/arquivar | DropdownMenu |

**Toolbar:** busca textual + **faceted-filters** por Status, Ação, Unidade/Área, Recrutador, Gestor,
Período. **Ações em massa** (seleção): arquivar, exportar. **Densidade** e **colunas visíveis** via
view-options.

---

## 8. Anatomia — Detalhe da vaga (hierarquia dos ~50 campos)

Resolve a questão em aberto #10: como hierarquizar ~50 campos sem virar formulário-monstro.

**Cabeçalho (sempre visível):** Cargo + Código/Chamado · **StatusBadge** · **StageStepper**
(ação atual) · **SLAIndicator** · botões Editar / Arquivar.

**Coluna principal — Tabs por afinidade:**

| Tab | Grupos de campos (Seção 5 do PRD) |
|---|---|
| **Visão geral** | Identificação, Solicitante, Perfil da vaga, Responsáveis |
| **Processo** | Status, Ação atual, data da ação, observações + StageStepper detalhado |
| **SLA & Prazos** | SLA da vaga, contagem, timer gestor, timer jurídico |
| **Jurídico** | nº chamado jurídico, abertura, parecer, dias corridos |
| **Cronograma** | inscrição, prova, entrevistas, habilitação, admissão |
| **Resultado** | divulgação, previsão de admissão, candidato selecionado |
| **Candidato** 🔒 | gênero, interno, banco, qtd. aplicados *(campos sensíveis LGPD — RF26)* |
| **Histórico** | timeline de alterações (quem/quando) — RF16/RF17 |

**Trilho lateral (resumo persistente):** SLA em destaque, responsáveis, datas-chave, atalhos.
Cada Tab é um **Card** com **FieldGroup**; campos sensíveis (🔒) só aparecem conforme papel (RBAC).

---

## 9. Fluxo — Criar / Editar vaga

**Criar (mínimo, decisão B5):** nº do chamado e/ou código, unidade/área, gestor solicitante, cargo,
tipo de contrato, recrutador, data de abertura. → vaga nasce **Aberta**, SLA inicia, toast de sucesso,
redireciona ao **Detalhe**.

**Progressivo:** os demais grupos (cronograma, jurídico, resultado, candidato) são preenchidos no
Detalhe, tab a tab, sem bloquear a criação. Validação (RF06) só sobre o subconjunto mínimo.

Padrão de UI: página dedicada `/vagas/nova` para a criação (foco), **Sheet** lateral para edições
rápidas de um grupo a partir do Detalhe. Datas via **DatePicker**; seleções via **Select/Combobox**.

---

## 10. Visualização de SLA (estados)

O **SLAIndicator** ✚ (composto de **Progress** + **Badge** + **Tooltip**) comunica quatro estados —
que exigem **tokens de cor de status** ainda inexistentes (achado da auditoria):

| Estado | Regra | Cor semântica (a criar) |
|---|---|---|
| No prazo | dias úteis ≤ ~14 | `--status-ok` (verde) |
| Em risco | 15–20 dias úteis | `--status-warn` (amber) |
| Estourado | > 20 dias úteis | `--status-danger` (vermelho) |
| Pausado | status Suspensa/Congelada | `--status-muted` (neutro) |

Início = data de abertura; marco final = divulgação do resultado (decisão B2). Pausa em
Suspensa/Congelada. Motor em `src/lib/sla.ts` (date-fns + tabela de feriados por unidade).

---

## 11. Fluxo — Importação de planilha (Fase 3)

Wizard de 4 passos (**Stepper** ✚):

1. **Upload** — arquivo `.xlsx`; valida tipo/tamanho e layout (RF20); **Alert** para erros.
2. **Mapeamento** — casar colunas da planilha → campos do sistema.
3. **Prévia & duplicados** — **Table** marca duplicados (chave nº chamado + código); por padrão
   **não sobrescreve** (decisão B8); **Checkbox** de opt-in por linha para sobrescrever.
4. **Confirmação** — **AlertDialog** + **Progress**; novos entram, duplicados só com opt-in.

Segurança: neutralizar conteúdo de célula que possa virar fórmula na reexportação (CSV/formula injection).

---

## 12. Dashboards & Relatórios (Fase 4)

**Dashboard (`/indicadores`):** KPIs em **Card** (vagas abertas, % no prazo, tempo médio, gargalos por
etapa), gráficos **Chart** (funil por etapa, SLA por unidade, volume por período), filtro de período.

**Relatórios (`/relatorios`):** **DataTable** analítica por área/gestor/recrutador/status/período,
com **exportação filtrada** (RF25) — dados sensíveis de candidato mascarados/condicionados ao papel
(RF26), confirmação via **AlertDialog**.

---

## 13. Matriz RBAC (papel × operação)

| Operação | RH | Gestora de RH | Administrador |
|---|:--:|:--:|:--:|
| Ver lista/detalhe de vagas | ✅ | ✅ | ✅ |
| Criar / editar vaga | ✅ | ✅ | ✅ |
| Arquivar / cancelar vaga | ✅ | ✅ | ✅ |
| Importar planilha | ✅ | — | ✅ |
| Ver campos sensíveis (candidato) 🔒 | parcial | parcial | ✅ |
| Dashboards & Relatórios | ✅ | ✅ | ✅ |
| Exportar relatórios | — | ✅ | ✅ |
| Gerir usuários | — | — | ✅ |
| Unidades & Feriados | — | — | ✅ |
| Ver auditoria | — | — | ✅ |

> Mapeamento inicial — a confirmar no planejamento de B3 (backend + auth + RBAC) com infra/TI.

---

## 14. Estados do sistema

Todo caminho tem seus quatro estados desenhados desde o início:

| Estado | Quando | Componente |
|---|---|---|
| **Vazio (1º uso)** | nenhuma vaga cadastrada | ✚ **Empty** + CTA "Criar primeira vaga" / "Importar planilha" |
| **Carregando** | busca/lista/detalhe | **Skeleton** (linhas de tabela, cards) |
| **Erro / sem permissão** | falha ou papel insuficiente | páginas `/erros/*` (401/403/404/500) |
| **Feedback de ação** | salvar, importar, arquivar | **Sonner** (toast) + **Alert** inline |

---

## 15. Mapeamento IA → componentes shadcn

Resumo do reuso (auditoria: 30 primitivos instalados; ✚ = a criar/instalar).

| Camada | Já instalado | A criar/instalar |
|---|---|---|
| **Casca** | Sidebar, Header, Breadcrumb, Command (⌘K) | nav pt-BR nova |
| **Lista** | Table, DataTable (column-header/toolbar/faceted-filter/pagination/bulk-actions), Badge, Input, Select, DropdownMenu | ✚ StatusBadge, ✚ SLAIndicator |
| **Detalhe** | Tabs, Card, Separator, Tooltip, HoverCard, Avatar | ✚ StageStepper, ✚ Timeline |
| **Formulários** | Form, Input, Select, Combobox, Textarea, Switch, Checkbox, DatePicker (Calendar+Popover), Sheet | — |
| **Importação** | Card, Alert, Table, Checkbox, Progress*, AlertDialog | ✚ Stepper (*instalar Progress) |
| **Indicadores** | Chart, Card, Badge | — |
| **Feedback/estados** | Sonner, Alert, Skeleton | ✚ Empty (instalar) |

**Instalar via CLI (shadcn):** `progress`, `empty` (e, se necessário, `accordion`, `slider`).
**Novos de domínio (compor a partir de primitivos):** `StatusBadge`, `SLAIndicator`, `StageStepper`,
`Timeline`, `Stepper` — todos usando tokens semânticos, incluindo os `--status-*` a definir.

---

## 16. Roadmap de entrega por fase

| Fase | Entrega de IA | Telas |
|---|---|---|
| **0 — Fundações** | nav pt-BR, rotas, guarda, tokens (incl. `--status-*`) | shell, auth, erros, configurações |
| **1 — Núcleo CRUD** | Lista, Detalhe, Criar/Editar, Histórico | §6.1–6.3, 6.7(auditoria) |
| **2 — SLA & Processo** | SLAIndicator, StageStepper, Cronograma, Calendários | §8, §10, admin/calendarios |
| **3 — Importação** | Wizard de importação | §11 |
| **4 — Indicadores** | Dashboard, Relatórios, Exportação | §12 |

---

## 17. Questões de IA ainda abertas (do PRD)

- Colunas primárias definitivas da lista e ordenação padrão (proposta na §7 — validar com RH).
- Identificador único da vaga (chamado **e** código, ou "e/ou") — afeta rótulos e busca.
- Semântica de reabertura (mesmo registro vs novo) — afeta a Timeline e o SLA.
- Metas concretas de acessibilidade e responsividade (mobile do RH em campo?).
- Finalidade do campo "gênero" (indicador de diversidade declarado?) — LGPD exige finalidade.

---

*Documento vivo. Próximo passo de design: detalhar wireframes da Lista e do Detalhe, e especificar
os componentes de domínio (`StatusBadge`, `SLAIndicator`, `StageStepper`) com seus tokens `--status-*`.*
