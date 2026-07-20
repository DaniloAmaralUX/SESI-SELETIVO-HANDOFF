---
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
execution: code
titulo: "Loop 1 — Fatia vertical de Vagas: lista + detalhe com os dois eixos"
data: 2026-07-13
numero: "001"
tipo: feat
branch: feat/vagas-lista-detalhe
fontes:
  - CONTEXT.md
  - STRATEGY.md (roadmap B4 — Fases 0/1)
  - docs/adr/0001-status-e-acao-como-eixos-independentes.md
  - docs/engineering/arquitetura-de-modulos.md (§2.1, §3.1, §3.3, §5)
  - docs/product/PRD-sistema-rh-gestao-vagas.md (RF03, RF04, RF07, RF08)
---

# Loop 1 — Fatia vertical de Vagas: lista + detalhe

## Objetivo & escopo

Provar o loop CE entregando a **primeira tela de domínio**: uma **lista de Vagas** filtrável e um **detalhe**
de Vaga, com os **dois eixos** (Status × Ação atual) como cidadãos de primeira classe. É a "tela-tese" do
produto (STRATEGY: tela inicial = lista de Vagas) e a fundação sobre a qual Fases 2–4 (SLA, importação,
dashboards) se apoiam.

**Dentro do escopo:** schema Zod da Vaga (dois eixos como enums), o `<DataTable>` genérico que paga a
duplicação do template, dados mock via `faker`, colunas da lista (Status badge + Ação atual + campos-chave),
filtros facetados por Status e Ação, tela de detalhe por rota param, tokens `--status-*`, entrada na nav, e
testes na interface (schema + `<DataTable>`).

**Fora do escopo (fases seguintes):** motor de SLA e timers (Fase 2), CRUD real/persistência (só mock aqui),
formulário criar/editar, importação, dashboards, RBAC enforcement (o guard `beforeLoad` fica para depois — a
rota só é adicionada). Limpeza total do template (Loop 0) não é pré-requisito; adiciona-se `vagas` ao lado.

## Critérios de sucesso

- Navegar para `/vagas` mostra a lista de Vagas mock com colunas de domínio e badge de Status colorido por token.
- Filtrar por **Status** e por **Ação atual** (facetado) e buscar por chamado/cargo funciona e reflete na URL.
- Clicar numa Vaga abre `/vagas/$vagaId` com os dois eixos e os campos-chave visíveis.
- `cd app && pnpm lint && pnpm format:check && pnpm test && pnpm build` verde; CI verde no PR.

## Unidades de implementação

### U1 — Schema da Vaga (fonte única) · *in-process*
- **Novo** `app/src/features/vagas/data/schema.ts`: `zod` com os enums canônicos —
  `statusVaga` (6: aberta, suspensa, congelada, cancelada, finalizada, arquivada) e
  `acaoAtual` (10 etapas ordenadas do CONTEXT.md), mais campos-chave da Vaga (id, chamado, códigoVaga,
  unidade, área, cargo, tipoContrato, recrutador, gestorSolicitante, dataAbertura, pcd, dataAcao).
  `export type Vaga = z.infer<...>`. Espelha o padrão de `features/tasks/data/schema.ts`, porém com **enums
  fortes** (não `z.string()`), pois são o vocabulário travado em tipos (ADR 0001).
- **Novo** `app/src/features/vagas/data/data.tsx`: arrays `statusOptions` e `acaoOptions`
  (`{ label, value, icon }`) no mesmo formato de `features/tasks/data/data.tsx`, consumidos pelas colunas e
  pelos filtros facetados. Ícones lucide.

### U2 — `<DataTable>` genérico (deepening — arquitetura §2.1)
- **Novo** `app/src/components/data-table/data-table.tsx`: componente genérico `<TData>` que absorve o
  scaffold hoje **copiado** em `features/tasks/components/tasks-table.tsx` (config do `useReactTable`, o
  `useEffect(ensurePageInRange)`, o loop de render `<Table>` e o slot da toolbar/bulk-actions). Interface
  pequena: `{ data, columns, search, navigate, toolbar?, bulkActions?, globalFilter?, columnFilters? }`,
  com `navigate`/`search` **injetados** (mesma disciplina de `hooks/use-table-url-state.ts`).
- Reusa os primitivos existentes `@/components/data-table` (`DataTableToolbar`, `DataTablePagination`) e
  `@/hooks/use-table-url-state`. Exportar via `app/src/components/data-table/index.ts`.
- **Não** refatorar `tasks`/`users` para o genérico neste loop (evita escopo); o genérico nasce aqui e a
  primeira consumidora é a lista de Vagas. (Migrar `tasks`/`users` vira aprendizado/loop futuro.)

### U3 — Dados mock · *true-external simulado*
- **Novo** `app/src/features/vagas/data/vagas.ts`: gera N Vagas com `@faker-js/faker` respeitando os enums
  (Status/Ação coerentes), no padrão de `features/tasks/data/tasks.ts`. É o adapter mock até existir backend
  (arquitetura §3.4).

### U4 — Colunas + lista
- **Novo** `app/src/features/vagas/components/vagas-columns.tsx`: colunas usando `DataTableColumnHeader`;
  coluna **Status** renderiza um **badge por token** (U6); coluna **Ação atual** com ícone; colunas chamado,
  cargo, unidade, recrutador, dataAbertura. Link da linha/uma célula para o detalhe.
- **Novo** `app/src/features/vagas/components/vagas-table.tsx`: fino — monta colunas + `<DataTable>` (U2) +
  toolbar com filtros facetados por `status` e `acao`. Muito menor que `tasks-table.tsx` graças a U2.
- **Novo** `app/src/features/vagas/index.tsx`: composição da página (Header/Main + título "Vagas" + tabela),
  espelhando `features/tasks/index.tsx` (sem provider/dialogs neste loop).

### U5 — Detalhe da Vaga
- **Novo** `app/src/features/vagas/detalhe/index.tsx` (ou `components/vaga-detalhe.tsx`): tela única que
  recebe a Vaga e mostra os **dois eixos** em destaque (badge de Status + stepper/legenda de Ação atual) e os
  campos-chave agrupados. Hierarquia dos ~50 campos completa é questão aberta do PRD (#10) — aqui só o
  subconjunto da fatia.

### U6 — Tokens de status · *seam de design (arquitetura §3.3)*
- **Editar** `app/src/styles/theme.css`: adicionar tokens `--status-*` (um por Status) em OKLCH dentro de
  `@theme`, com par claro/escuro. O badge de Status (U4) lê o token, não string Tailwind solta. Substitui o
  padrão hardcoded que o template usa em `features/users/data/data.ts` (`callTypes`).

### U7 — Rotas + navegação
- **Novo** `app/src/routes/_authenticated/vagas/index.tsx`: rota da lista, com `validateSearch` (Zod) para
  os search params (filter, page, pageSize, status[], acao[]) — mesmo padrão de
  `routes/_authenticated/tasks/index.tsx`. Renderiza `features/vagas/index.tsx`.
- **Novo** `app/src/routes/_authenticated/vagas/$vagaId.tsx`: rota do detalhe; resolve a Vaga (mock por id)
  e renderiza U5. (Árvore de rotas é gerada pelo `@tanstack/router-plugin`.)
- **Editar** `app/src/components/layout/data/sidebar-data.ts`: adicionar item de nav **"Vagas"** (ícone
  lucide, rota `/vagas`) — o "ponto único de edição" da navegação (arquitetura §3.6).

### U8 — Testes (na interface)
- **Novo** `app/src/features/vagas/data/schema.test.ts`: valida o schema (enums aceitam os valores canônicos,
  rejeitam inválidos) — in-process, sem mocks.
- **Novo** `app/src/components/data-table/data-table.test.tsx`: teste de comportamento do genérico (render de
  linhas, estado vazio "Nenhum resultado", integração com toolbar) no Vitest browser mode.

## Reuso (não reinventar)
- `app/src/hooks/use-table-url-state.ts` — estado de tabela ↔ URL (injetar em U2).
- `app/src/components/data-table/*` — `DataTableToolbar`, `DataTablePagination`, `DataTableFacetedFilter`,
  `DataTableColumnHeader`, `DataTableBulkActions`.
- `app/src/components/ui/badge.tsx`, `table.tsx` — primitivos shadcn.
- Padrões a espelhar: `features/tasks/{data/schema.ts,data/data.tsx,components/tasks-table.tsx,index.tsx}` e
  `routes/_authenticated/tasks/index.tsx` (validateSearch).

**Tooling (auto-trigger autorizado — ver CLAUDE.md):** usar **Context7** (`ctx7`/MCP) para validar APIs da
stack (TanStack Router/Table, Tailwind v4 `@theme`) durante a implementação, e **ui-skills** (`npx ui-skills
start`, especialistas `dc-*`) para o trabalho visual (tokens `--status-*`, badges, hierarquia do detalhe).

## Verificação (end-to-end)
1. `cd app && pnpm dev` → navegar `/vagas`: lista renderiza; badges de Status coloridos; filtros por Status e
   Ação atualizam a URL; busca por chamado/cargo filtra.
2. Clicar numa linha → `/vagas/$vagaId`: detalhe mostra Status + Ação atual + campos-chave.
3. `cd app && pnpm lint && pnpm format:check && pnpm test && pnpm build` verdes localmente.
4. Abrir PR → CI verde. Depois: `/ce-simplify-code` → `/ce-code-review` → merge → `/ce-compound`
   (documentar o aprendizado do `<DataTable>` genérico e da modelagem dos dois eixos em `docs/solutions/`).

## Contexto de entrega (atualização 2026-07-13)

- **A entrega do repo é um protótipo de alta fidelidade com dados mockados + handoff para dev** (ver
  STRATEGY.md § Natureza da entrega). Esta fatia é a primeira tela desse protótipo: comportamento fiel
  (filtros, URL state, estados vazios) importa tanto quanto aparência; mock isolado em `features/vagas/data/`.
- **Deploy alvo: Vercel** (não Netlify — o `app/netlify.toml` é resíduo do template; remover na limpeza).
- **Dependência de produto (dúvidas N1/N2 — docs/product/duvidas-requisitos-v2.pdf):** o vocabulário real
  da planilha (10 STATUS / 34 AÇÕES) diverge dos enums canônicos (6/10). Até o de-para com o RH, os enums
  canônicos entram como **proposta** — implementar como dado (arrays em `data/data.tsx`), não como
  hard-code espalhado, para o remapeamento ser barato. O protótipo serve justamente para validar isso nos
  testes com usuários.

## Riscos / notas
- **Não** implementar SLA aqui — só os eixos. Misturar puxaria a Fase 2 inteira.
- Manter o genérico `<DataTable>` com interface pequena; se crescer demais, é sinal de aprofundar errado.
- `validateSearch` deve casar exatamente com as chaves usadas em `use-table-url-state` (status/acao/filter/page).
- Detalhe: só o subconjunto de campos da fatia; a IA completa dos ~50 campos é decisão de design posterior.
