---
titulo: Design System — SESI Processo Seletivo
tipo: design-system
status: v0.1 (direção proposta + catálogo do baseline)
data: 2026-07-13
baseline_tecnica: shadcn-admin (React 19 · Vite · Tailwind v4 · shadcn/ui new-york · Radix · CVA · lucide)
fontes:
  - docs/product/PRD-sistema-rh-gestao-vagas.md
  - docs/design/arquitetura-informacao.md
  - docs/engineering/estudo-shadcn.md
  - app/src/styles/theme.css
  - app/components.json
---

# Design System — SESI Processo Seletivo

> Fonte única de verdade visual do produto. Reúne a **direção visual** (identidade), os **design tokens**,
> o **catálogo de componentes** do baseline e os **componentes de domínio** ainda a criar.
>
> **Convenções deste doc:** ✔ implementado · ⏳ em aberto · ✚ a criar (não existe no código) ·
> 🔒 sensível a LGPD. Onde há **proposta de marca**, está marcado como *validar com o manual de marca do SESI* —
> não é fato definitivo.

---

## 1. Direção visual

Identidade **industrial-institucional**, calibrada para uma **ferramenta administrativa interna e densa**
(não um site de marketing). A regra de restrição é deliberada: **a ousadia se concentra em um único lugar —
o painel de SLA** — e todo o resto permanece quieto e disciplinado.

### 1.1 Fundamentação no assunto
- **Assunto concreto:** gestão do funil de **vagas** de um processo seletivo do SESI. Cada vaga avança por
  etapas (**Status**), tem uma **Ação atual** e um **SLA em dias úteis** (regra do PRD).
- **Público:** Recrutadores e a Gestora de RH — pessoas internas que vivem em **tabelas, filtros e prazos**,
  não consumidores. A tela precisa responder num olhar: *"o que preciso agir agora e o que estourou o SLA?"*.
- **Tela-tese (lista de Vagas):** deixar o recrutador enxergar a **saúde de SLA** do funil e agir sobre as
  vagas em atenção/atrasadas.
- **Universo do sujeito:** a **indústria** (SESI = Serviço Social da Indústria, Sistema S). Vocabulário e
  materiais: chão de fábrica, força de trabalho, **sinalização de segurança**, instrumentos/medidores, prazos.
  → Daí a escolha específica desta direção: usar a **linguagem de cor da sinalização industrial**
  (verde/âmbar/vermelho como um medidor) para todo o sistema de Status/SLA. É o **risco estético justificado**.

### 1.2 Elemento-assinatura — Painel de instrumentos de SLA
O único elemento memorável e verdadeiro ao SESI. Cada vaga exibe uma **barra-medidor** (contador em fonte
mono + gauge que se esvazia conforme o prazo consome), com as cores de segurança; a faixa superior da lista
é o **mesmo medidor agregado** (quantas vagas no prazo / em atenção / estouradas). Codifica **informação real**
(saúde de SLA em dias úteis, do PRD) — não é decoração.

```
┌──────────┬───────────────────────────────────────────────┐
│  SESI    │  Vagas · Processo Seletivo                     │
│ ▮azul-p  │  ┌── PAINEL DE INSTRUMENTOS (assinatura) ────┐ │
│          │  │  ● 12 no prazo   ▲ 5 atenção   ■ 3 estour.│ │
│  Vagas   │  └──────────────────────────────────────────┘ │
│  Indica… │  [ Status ▾  Ação ▾  Recrutador ▾ ]           │
│  Relat…  │  ┌──────────────────────────────────────────┐ │
│  Admin   │  │ ▎Vaga     Status    Ação      SLA ⏱      │ │
│          │  │ ▎Soldador ●Aberta  Triagem   2d ▓▓▓░     │ │
│  ─────   │  │ ▎Analista ▲Entrev. Agendar   0d ▓▓▓▓ !   │ │
│  user    │  └──────────────────────────────────────────┘ │
└──────────┴───────────────────────────────────────────────┘
```

### 1.3 Autocrítica (contra os defaults de "cara de IA")
1. **Creme + serifa + terracota** → evitado: aço frio + azul SESI + âmbar de segurança. ✔
2. **Quase-preto + acento ácido** → evitado: paleta azul-forward; o âmbar é escolha *semântica* de
   sinalização, não acento decorativo. ✔
3. **Broadsheet (linhas capilares, raio 0, colunas de jornal)** → evitado: raio 0.625rem + cards/medidores. ✔
4. **KPI genérico** (número grande + rótulo + gradiente): mitigado — os tiles do painel são **medidores**
   (barra + contador mono + ponto de segurança), sem gradiente, cor amarrada ao status.
5. **Marcadores numéricos 01/02/03**: usados **só** onde há sequência real (o Stepper de etapas do funil,
   onde a ordem carrega informação) — em nenhum lugar decorativo.

---

## 2. Design tokens

### 2.1 Cor — estado atual (baseline) vs. proposta SESI

O baseline usa a paleta **slate** do shadcn em **OKLCH**, definida em
[`theme.css`](../../app/src/styles/theme.css) e exposta ao Tailwind v4 via `@theme inline`
(gera utilitários como `bg-background`, `text-foreground`, `border-border`). A troca de tema = trocar as
variáveis, **nunca** os componentes.

**Tokens semânticos — valores atuais (`:root` / light):**

| Token | Atual (OKLCH) | Papel |
|---|---|---|
| `--background` | `oklch(1 0 0)` | Fundo base |
| `--foreground` | `oklch(0.129 0.042 264.695)` | Texto base |
| `--primary` | `oklch(0.208 0.042 265.755)` | Ação primária / marca |
| `--primary-foreground` | `oklch(0.984 0.003 247.858)` | Texto sobre primária |
| `--secondary` | `oklch(0.968 0.007 247.896)` | Ação/superfície secundária |
| `--muted` / `--muted-foreground` | `oklch(0.968 …)` / `oklch(0.554 …)` | Superfície/texto atenuados |
| `--accent` / `--accent-foreground` | `oklch(0.968 …)` / `oklch(0.208 …)` | Realce sutil (hover) |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Ação destrutiva / erro |
| `--border` / `--input` | `oklch(0.929 0.013 255.508)` | Bordas / bordas de campo |
| `--ring` | `oklch(0.704 0.04 256.788)` | Anel de foco |
| `--card` / `--popover` | `oklch(1 0 0)` | Superfícies elevadas |

> Dark (`.dark`) redefine os mesmos tokens (fundo `oklch(0.129 0.042 264.695)`, `--border: oklch(1 0 0 / 10%)`
> etc.). O par light/dark é dirigido por classe `.dark` no `<html>` (variante Tailwind `@custom-variant dark`).

**Proposta SESI (✚ validar com o manual de marca):** substituir a âncora slate por azul institucional +
neutros de aço. No código, converter cada hex para OKLCH (padrão do projeto).

| Token proposto | Hex (proposta) | Mapeia para | Papel |
|---|---|---|---|
| `azul-sesi` | `#0057B8` | `--primary` | Primária institucional (ações, marca) |
| `azul-profundo` | `#072B5A` | superfície de rail / ênfase | Cabeçalho do rail, estados pressionados |
| `grafite` | `#141A22` | `--foreground` | Tinta de texto |
| `aco` | `#5B6673` | `--muted-foreground` / borda forte | Texto secundário (steel, não o slate) |
| `nevoa` | `#F4F6FA` | `--background` / `--muted` | Superfície clara |
| `ambar-industrial` | `#F2A900` | assinatura + `--status-warn` | Acento de sinalização (atenção) |

### 2.2 Tokens de status — sinalização de SLA ✚ a criar

**Não existem no código.** Achado repetido da auditoria e da IA (§10 de
[arquitetura-informacao.md](arquitetura-informacao.md)). Comunicam os quatro estados de SLA. Meta = **20 dias
úteis**; início = data de abertura; marco final = divulgação do resultado (decisão B2).

| Token ✚ | Cor (proposta) | Estado de SLA | Regra |
|---|---|---|---|
| `--status-ok` | verde `#1E874B` | No prazo | dias úteis ≤ ~14 |
| `--status-warn` | âmbar `#F2A900` | Em risco | 15–20 dias úteis |
| `--status-danger` | vermelho `#C6362F` | Estourado | > 20 dias úteis |
| `--status-muted` | aço `#5B6673` | Pausado | status Suspensa/Congelada |

> Definir em `:root` **e** `.dark` (com luminosidade ajustada) e mapear em `@theme inline`
> (`--color-status-ok: var(--status-ok)` …) para gerar `bg-status-ok`, `text-status-danger`, etc.

### 2.3 Raio de borda

Base `--radius: 0.625rem` (10px), com escala derivada em `@theme inline`:

| Token | Cálculo | Valor |
|---|---|---|
| `--radius-sm` | `calc(var(--radius) - 4px)` | 6px |
| `--radius-md` | `calc(var(--radius) - 2px)` | 8px |
| `--radius-lg` | `var(--radius)` | 10px |
| `--radius-xl` | `calc(var(--radius) + 4px)` | 14px |

### 2.4 Tipografia

**Baseline atual:** `--font-inter` (`'Inter'`, padrão) e `--font-manrope` (`'Manrope'`) → classes `font-inter`
/ `font-manrope`; troca por usuário em `/settings/appearance` (opções `inter | manrope | system`). Sem escala
de tipo tokenizada — usa as utilidades Tailwind (`text-xs`…`text-base`…). Inputs no mobile são forçados a
`16px` para evitar zoom de foco.

**Proposta SESI (✚ validar) — par deliberado, ≠ Inter/Manrope default:**

| Função | Fonte proposta | Uso |
|---|---|---|
| Display | **Archivo** (Expanded em títulos grandes) | Títulos, números do painel — caráter de wayfinding industrial, uso restrito |
| Corpo | **IBM Plex Sans** | Texto e **tabelas densas** de admin (herança de engenharia) |
| Utilitária / dados | **IBM Plex Mono** | Contadores de SLA, IDs de vaga, datas — **algarismos tabulares** (leitura de instrumento) |

### 2.5 Famílias de token auxiliares

- **Charts** — `--chart-1` … `--chart-5` (usar sempre por token nos dashboards, RF23; ver `Chart`/Recharts).
- **Sidebar** — `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`,
  `--sidebar-border`, `--sidebar-ring`. No baseline herdam dos tokens base via `var()`; a proposta SESI
  aplica `azul-profundo` ao rail redefinindo `--sidebar` no tema.

---

## 3. Catálogo de componentes (baseline)

30 primitivos em [`src/components/ui/`](../../app/src/components/ui) (shadcn *new-york*, `cssVariables:
true`, ícones **lucide**). Apenas **4** definem variantes via `cva`; os demais expõem sub-componentes de
composição.

### 3.1 Componentes com variantes (`cva`)

**Button** — [`button.tsx`](../../app/src/components/ui/button.tsx)
| Eixo | Valores |
|---|---|
| variant | `default` · `destructive` · `outline` · `secondary` · `ghost` · `link` |
| size | `default` (h-9) · `sm` (h-8) · `lg` (h-10) · `icon` (size-9) |
- Padrões: variant `default`, size `default`. Suporta `asChild` (Slot). Exporta `buttonVariants`.
- Estados embutidos: `hover:bg-*/90`, `disabled:opacity-50 pointer-events-none`, foco
  `focus-visible:ring-ring/50 ring-[3px]`, inválido `aria-invalid:border-destructive`.

**Badge** — [`badge.tsx`](../../app/src/components/ui/badge.tsx)
| Eixo | Valores |
|---|---|
| variant | `default` · `secondary` · `destructive` · `outline` |
- Sem tamanhos. Suporta `asChild`. Base é a raiz do ✚ `StatusBadge` (§5).

**Alert** — [`alert.tsx`](../../app/src/components/ui/alert.tsx)
| Eixo | Valores |
|---|---|
| variant | `default` · `destructive` |
- Sub-componentes: `Alert` (role="alert") · `AlertTitle` · `AlertDescription`.

**Select (SelectTrigger)** — `select.tsx`
| Eixo | Valores |
|---|---|
| size | `default` (h-9) · `sm` (h-8) — via `data-size` |
- Composição: `Select` › `SelectTrigger`/`SelectValue` + `SelectContent` › `SelectGroup`/`SelectLabel`/`SelectItem`.

### 3.2 Demais primitivos (composição, sem `cva`)

| Grupo | Componentes |
|---|---|
| Formulário | `form` · `input` · `textarea` · `label` · `checkbox` · `radio-group` · `switch` · `select` · `input-otp` · `calendar` |
| Overlay | `dialog` · `alert-dialog` · `sheet` · `popover` · `dropdown-menu` · `tooltip` · `command` |
| Estrutura / navegação | `sidebar` (tem `cva` `sidebarMenuButtonVariants`: variant `default`/`outline`, size `default`/`sm`/`lg`) · `tabs` · `collapsible` · `separator` · `scroll-area` |
| Dados | `table` (`Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell`…) · `avatar` |
| Feedback | `sonner` (toasts) · `skeleton` · `alert` |
| Superfície | `card` (`Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardAction`/`CardContent`/`CardFooter`) |

---

## 4. Kits compostos (reutilizáveis)

- **DataTable** — [`src/components/data-table/`](../../app/src/components/data-table): sobre
  `@tanstack/react-table` + o primitivo `table`. Peças: `DataTablePagination`, `DataTableColumnHeader`,
  `DataTableToolbar`, `DataTableBulkActions`, `faceted-filter`, `view-options`. **É o padrão da lista de Vagas.**
  Referência de uso: features `tasks/` e `users/`.
- **Layout shell** — [`src/components/layout/`](../../app/src/components/layout): `app-sidebar`,
  `header`, `nav-group`, `nav-user`, `team-switcher`, `top-nav`, `authenticated-layout`, `main`. Config de nav
  em `layout/data/sidebar-data.ts` (⏳ ainda com dados do template — trocar por nav pt-BR do SESI).

---

## 5. Componentes de domínio ✚ a criar

Compostos a partir de primitivos, **usando tokens semânticos** (incluindo `--status-*`). Specs a partir de
§6/§8/§10/§15 de [arquitetura-informacao.md](arquitetura-informacao.md). Nenhum existe no código ainda.

| Componente ✚ | Composto de | Papel | Estados / variantes | Acessibilidade |
|---|---|---|---|---|
| **StatusBadge** | `Badge` + `--status-*` + ícone lucide | Status da vaga (Aberta/Suspensa/…) na lista e no cabeçalho do detalhe | um por Status; cor por token de status | não depender só de cor: ícone + rótulo textual |
| **SLAIndicator** | `Progress` + `Badge` + `Tooltip` | O medidor de SLA (assinatura §1.2) | `ok` · `warn` · `danger` · `muted` (§2.2) | `role="progressbar"` + `aria-valuenow`; tooltip com dias/meta |
| **StageStepper** | passos + `Separator` + `Tooltip` | Etapa atual no funil (Ação atual), no cabeçalho do detalhe | passo atual destacado; passos concluídos/pendentes | numeração só porque a **ordem é real**; `aria-current="step"` |
| **Timeline** | lista + `Avatar` + `Separator` | Histórico/auditoria da vaga (aba Processo) | evento; agrupamento por data | lista semântica; texto de cada evento |
| **Stepper** | `Card` + `Alert` + `Progress` | Wizard de importação de planilha (4 passos, Fase 3) | Upload → Validação → Prévia → Confirmação | `aria-current="step"`; erros anunciados |

> `Progress` e `Empty` ainda **não** estão instalados — adicionar via CLI (`pnpm dlx shadcn@latest add progress empty`).

---

## 6. Regras de uso (consistência)

Consolidado do §7 de [estudo-shadcn.md](../engineering/estudo-shadcn.md):

- **Só tokens semânticos** de cor — `bg-primary`, `text-muted-foreground`, `bg-status-danger`. Nunca cor crua
  (`bg-blue-500`) nem hex inline.
- **`className` só para layout**, nunca para sobrescrever cor/tipografia do componente.
- **Espaçamento com `flex` + `gap-*`** — nada de `space-x/space-y`. Coluna: `flex flex-col gap-*`.
- **`size-*`** quando largura = altura (`size-9`, não `w-9 h-9`); **`truncate`** no lugar do combo manual.
- **Sem `dark:` manual** e **sem `z-index` manual** em overlays — deixar os tokens/primitivos resolverem.
- **`cn()`** (`@/lib/utils`) para classes condicionais.
- **Composição obrigatória**: `SelectItem`→`SelectGroup`, `TabsTrigger`→`TabsList`, `Avatar`+`AvatarFallback`;
  `Dialog`/`Sheet` sempre com `Title`.
- **Piso de acessibilidade**: foco visível (o `ring` já vem nos primitivos), rótulos/ARIA em controles só-ícone,
  status nunca apenas por cor (ícone + texto), respeitar `prefers-reduced-motion`.

---

## 7. Referências

- [`theme.css`](../../app/src/styles/theme.css) · [`index.css`](../../app/src/styles/index.css) ·
  [`components.json`](../../app/components.json)
- [PRD — Sistema RH / Gestão de Vagas](../product/PRD-sistema-rh-gestao-vagas.md) (SLA, catálogo de campos, RF01–RF26)
- [Arquitetura da Informação](arquitetura-informacao.md) (§8 anatomia, §10 SLA, §15 mapa IA→componente)
- [Estudo shadcn/ui](../engineering/estudo-shadcn.md) (§2 instalados, §4 a instalar, §7 regras)

> **Status:** direção visual = **proposta a validar** com o manual de marca do SESI; tokens `--status-*` e os
> componentes de domínio da §5 são **✚ a criar** (não implementados). Aplicar ao código (`theme.css` +
> componentes) é tarefa de follow-up separada.
