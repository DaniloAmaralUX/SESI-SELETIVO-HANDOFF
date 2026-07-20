# Estudo do shadcn/ui — Guia de Reaproveitamento para o Processo Seletivo

> Referência de estudo para aproveitar ao máximo o shadcn/ui (CLI + biblioteca) sobre o
> template `shadcn-admin`, que é a baseline técnica do projeto **Sistema de RH para Gestão de Vagas**.
> Fontes: ui.shadcn.com/docs (cli, installation, components, blocks, charts), github.com/shadcn-ui,
> e inspeção direta do template.

---

## 1. O que é o shadcn/ui (filosofia)

shadcn/ui **não é uma biblioteca de dependência**. É um **registro de código-fonte**: a CLI
copia o código dos componentes para dentro do nosso repositório (`src/components/ui/`). Consequências:

- **Ownership total do código** — cada componente é nosso, editável, versionado no git. Sem lock-in.
- Construído sobre **Radix UI** (acessibilidade/primitivos) + **Tailwind** (estilo) + **CVA** (variantes) + **lucide** (ícones).
- Estilização por **tokens semânticos** (CSS variables): `bg-primary`, `text-muted-foreground`, `bg-background` — nunca cores cruas. Trocar o tema = trocar as variáveis, não os componentes.
- **Compor, não reinventar**: telas se montam combinando primitivos (Ex.: página de settings = Tabs + Card + Form; dashboard = Sidebar + Card + Chart + Table).

**Impacto no projeto:** já herdamos 30 componentes prontos e podemos puxar o resto sob demanda com a CLI, tudo no mesmo estilo visual.

---

## 2. Baseline técnica que o template já entrega

Do `app/components.json`:

| Config | Valor |
|---|---|
| style | `new-york` |
| base color | `slate` |
| CSS variables | `true` (tema via variáveis em `src/styles/index.css` / `theme.css`) |
| icon library | `lucide` |
| tsx | `true` · rsc | `false` (Vite SPA, não Next) |
| aliases | `@/components`, `@/components/ui`, `@/lib/utils`, `@/lib`, `@/hooks` |

Stack já instalada (do `package.json`) diretamente útil ao projeto: **React 19**, **Vite 8**,
**TanStack Router / Query / Table**, **react-hook-form + zod + @hookform/resolvers**,
**recharts**, **date-fns**, **sonner**, **zustand**, **tailwind v4**, **lucide-react**, **cmdk**, **input-otp**.

### 2.1 Componentes shadcn JÁ instalados no template (30)

`alert-dialog`, `alert`, `avatar`, `badge`, `button`, `calendar`, `card`, `checkbox`,
`collapsible`, `command`, `dialog`, `dropdown-menu`, `form`, `input-otp`, `input`, `label`,
`popover`, `radio-group`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`,
`sonner`, `switch`, `table`, `tabs`, `textarea`, `tooltip`.

> Além destes, o template traz componentes **compostos próprios** já feitos em cima do shadcn:
> `components/data-table/*` (toolkit de tabela sobre @tanstack/react-table), `date-picker.tsx`,
> `command-menu.tsx`, `confirm-dialog.tsx`, `password-input.tsx`, `select-dropdown.tsx`,
> `long-text.tsx`, e todo o shell de layout (`sidebar`, `header`, `nav-*`).

---

## 3. CLI do shadcn — comandos que vamos usar

> Rodar sempre com o runner do projeto. O template usa **pnpm** → **`pnpm dlx shadcn@latest ...`**
> (equivalentes: `npx shadcn@latest`, `bunx --bun shadcn@latest`).
> **Executar dentro da pasta que tem o `components.json`** (hoje `app/`).

| Comando | Para quê |
|---|---|
| `init` | Inicializa config shadcn (já feito no template). Suporta `--template vite`, `--base radix\|base`, `--preset`. |
| `add <comp...>` | Instala componente(s) + dependências em `src/components/ui/`. Flags: `--overwrite`, `--all`, `--dry-run`, `--diff [file]`, `--path`. |
| `search / list @reg -q "..."` | Busca itens em um registro (oficial `@shadcn` ou comunidade). |
| `view @shadcn/<item>` | Inspeciona um item do registro **sem** instalar. |
| `docs <comp...>` | Retorna URLs de documentação/exemplos/API de um componente. **Rodar antes de usar/criar um componente.** |
| `info [--json]` | Reporta contexto do projeto (framework, aliases, style, base, paths resolvidos). |
| `add <comp> --diff` | Compara upstream vs. local (para atualizar componente preservando mods locais). |
| `preset resolve / decode / apply` | Inspeciona/aplica presets de tema+fonte (`--only theme,font`). |
| `migrate icons\|radix\|rtl` | Migrações: trocar lib de ícones, unificar imports radix, converter para RTL. |
| `build` / `eject` | Gerar registro próprio / inlinar css do shadcn (irreversível). |

**Registros com namespace `@`:** `@shadcn` (oficial), `@v0`, e comunidades (`@tailark`, `@magicui`, etc.).
Regra: **nunca adivinhar o registro** — se o pedido não especifica, perguntar qual usar.
Depois de instalar item de comunidade: **revisar o arquivo**, corrigir imports (`@/…`) e trocar ícones para `lucide`.

---

## 4. Catálogo completo — o que falta e vamos adicionar

Componentes do catálogo shadcn **ainda não** no template, com uso direto no Processo Seletivo:

| Componente | Uso no projeto | Reuso |
|---|---|---|
| **Chart** (wrapper de Recharts) | Dashboards gerenciais RF23 (ChartContainer/ChartConfig/ChartTooltip). recharts já instalado. | adicionar |
| **Progress** | Barra visual do **SLA de 20 dias úteis** (RF09/RF10) e SLA gestor/jurídico. | adicionar |
| **Breadcrumb** | Navegação Vagas › Detalhe da vaga (RF04). | adicionar |
| **Accordion** | Seções colapsáveis do formulário de vaga (11 grupos de campos) e do detalhe. | adicionar |
| **Toggle / Toggle Group** | Filtros rápidos de status/ação na listagem (RF03/RF07). | adicionar |
| **Combobox** (Popover+Command) | Selects buscáveis: cargo, gestor, área, recrutador. Popover+Command já existem → é composição. | compor |
| **Drawer** | Painel inferior (mobile) para ações rápidas. | opcional |
| **Empty** | Estado vazio da lista de vagas / resultados de filtro. | adicionar (ou usar `coming-soon`) |
| **Spinner** | Loading de ações assíncronas (compor com Button). | adicionar |

Já cobertos por equivalentes do template (não precisa adicionar): **Data Table** (`components/data-table/*`),
**Date Picker** (`date-picker.tsx` + `calendar`), **Pagination** (`data-table/pagination`), **Sidebar/Nav**, **Toast** (`sonner`).

Provavelmente **não necessários agora**: Carousel, Resizable, Aspect Ratio, Slider, Kbd, Hover Card,
Context Menu, Menubar, Navigation Menu.

### 4.1 Comandos de `add` sugeridos para começar
```bash
# dentro de app/
pnpm dlx shadcn@latest add chart progress breadcrumb accordion toggle toggle-group
# opcionais conforme necessidade:
pnpm dlx shadcn@latest add empty spinner drawer
```

### 4.2 Dependências fora do shadcn (gaps de biblioteca)
- **Parser de planilha** (RF18–RF22): SheetJS `xlsx` ou `read-excel-file` — o template **não** tem parser. `pnpm add`.
- **Dias úteis com feriados** (RF09/RF10): `date-fns` tem `differenceInBusinessDays`, mas **feriados nacionais/locais** exigem lista própria ou lib (ex.: cálculo manual + tabela de feriados). Decidir na fase de plano.

---

## 5. Blocks — aceleradores de página inteira

Blocks são páginas completas copy-paste, instaláveis por `pnpm dlx shadcn@latest add <block>`:

- **dashboard** (`dashboard-01`): sidebar + charts + data table — referência direta para RF23/RF24.
- **sidebar** (`sidebar-01`…`sidebar-16`): sidebars colapsáveis, com submenus, team switcher, user nav.
- **login / authentication** (`login-01`…`login-05`): formulários de login, layouts split com imagem.
- **calendar**: blocos de calendário/agendamento.

> **Cuidado:** o template `shadcn-admin` **já tem** seu próprio shell (sidebar, header, auth pages).
> Usar blocks aqui é mais para **referência/inspiração** de layout de dashboard do que para substituir o shell.
> Instalar um block sobrescreve/adiciona arquivos — usar `--dry-run`/`--diff` antes.

---

## 6. Charts (para os dashboards — RF23)

`Chart` embrulha o **Recharts** (já instalado) com 3 peças: **ChartContainer** (wrapper + tema),
**ChartConfig** (config de séries/labels/cores por token), **ChartTooltip** (tooltip estilizado).
Tipos: **área, barra, linha, pizza, radar, radial**. Cores sempre por token semântico.

Uso no projeto: vagas por status/área, SLA cumprido vs. estourado, gargalos por etapa, tempo médio
de gestor/jurídico, candidatos aplicados por vaga. O template já usa recharts direto em
`features/dashboard/*` — podemos migrar para o wrapper `Chart` para padronizar tooltip/tema.

---

## 7. Regras críticas de uso (para manter a consistência)

Do guia oficial do shadcn (aplicar em todo código novo do projeto):

- **`className` só para layout**, nunca para sobrescrever cor/tipografia do componente.
- **Espaçamento com `flex` + `gap-*`** — nada de `space-x/space-y`. Coluna: `flex flex-col gap-*`.
- **`size-*`** quando largura = altura (`size-10`, não `w-10 h-10`). **`truncate`** em vez do combo manual.
- **Sem `dark:` manual** — usar tokens semânticos; sem `z-index` manual em overlays.
- **`cn()`** para classes condicionais.
- **Cores semânticas** (`bg-primary`, `text-muted-foreground`) — nunca `bg-blue-500`.
- **Composição obrigatória**: `SelectItem`→`SelectGroup`, `TabsTrigger`→`TabsList`, `Avatar`+`AvatarFallback`, Dialog/Sheet/Drawer sempre com Title.
- **Usar componente, não markup**: callout→`Alert`, vazio→`Empty`, toast→`sonner`, divisor→`Separator`, loading→`Skeleton`, tag→`Badge`.
- **Ícones em Button** com `data-icon="inline-start|inline-end"`, sem classes de tamanho no ícone.

> **Nota de geração:** o template está no estilo **`new-york` (geração radix clássica)** e usa o padrão
> `form.tsx` (react-hook-form `Form`/`FormField`/`FormItem`). A geração mais nova do shadcn introduz
> `Field`/`FieldGroup`/`InputGroup`. Para **consistência**, o projeto segue o padrão de formulário que
> já existe no template; adotar a API `Field` nova seria uma migração opcional a decidir — não misturar os dois.

---

## 8. Mapa rápido — recurso shadcn → onde usar

| Necessidade do PRD | Componentes/recursos shadcn |
|---|---|
| Cadastrar/editar vaga (RF01/RF02/RF06) | `form` + `input`/`select`/`textarea`/`switch`/`checkbox`/`radio-group` + `date-picker` + `accordion` (grupos) |
| Listar/filtrar vagas (RF03) | `data-table/*` + `toggle-group` (status) + `command`/combobox (busca) + `badge` |
| Detalhe da vaga (RF04) | `card` + `tabs` + `breadcrumb` + `separator` + `badge` |
| Status/ação padronizados (RF07/RF08) | `select`/`badge` + máquina de estados (código) |
| Arquivar/cancelar sem apagar (RF05) | `alert-dialog`/`confirm-dialog` (soft-delete) |
| SLA e prazos (RF09–RF12) | `progress` + `badge` + `date-fns` (dias úteis) |
| Cronograma/resultado (RF13/RF14) | `form` + `date-picker` + `calendar` |
| Histórico/auditoria (RF16/RF17) | `table`/`data-table` + `scroll-area` + `avatar` |
| Importar planilha (RF18–RF22) | input de arquivo + `tabs`/stepper + `data-table` (prévia) + `alert` + **`xlsx` (novo)** |
| Dashboards/relatórios/export (RF23–RF25) | `chart` (recharts) + `card` + `data-table` + export CSV (novo) |
| Shell/nav/auth (transversal) | `sidebar` + `header` + `nav-*` + auth pages + `sonner` |

---

## 9. Próximos passos práticos
1. Concluir a limpeza do template (remover demos: apps, chats, clerk, dashboard fake) — baseline enxuta.
2. Rodar os `add` da seção 4.1 para completar os componentes do projeto.
3. Adicionar `xlsx` e definir estratégia de dias úteis/feriados.
4. Reescrever `sidebar-data.ts` com a navegação do produto de vagas.
5. Modelar `Vaga` (zod schema) a partir do catálogo de campos do PRD e reusar `features/tasks|users` como referência de CRUD.
