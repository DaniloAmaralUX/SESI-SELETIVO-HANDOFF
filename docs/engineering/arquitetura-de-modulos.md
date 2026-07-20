---
titulo: Arquitetura de Módulos — Deep Modules & Seams do Domínio SESI
tipo: engineering-reference
status: referência
baseline_tecnica: app/ (React 19 · Vite 8 · TanStack Router/Query/Table · shadcn/ui · Tailwind v4)
metodo: skill codebase-design (mattpocock) aplicada ao app + linguagem ubíqua do CONTEXT.md
fontes:
  - .agents/skills/codebase-design/{SKILL,DEEPENING,DESIGN-IT-TWICE}.md
  - auditoria de arquitetura do app/ (2026-07-13)
  - ../adr/0001-status-e-acao-como-eixos-independentes.md
  - ../adr/0002-sla-dias-uteis-com-motor-de-feriados-proprio.md
---

# Arquitetura de Módulos — Deep Modules & Seams do Domínio SESI

> Norte de arquitetura para o trabalho de **design + front**. Aplica o vocabulário da skill
> **codebase-design** (module · interface · seam · adapter · depth · leverage · locality) ao estado atual
> do `app/` e define **onde** e **como** a camada de domínio SESI (Vaga, eixos, SLA, RBAC) deve entrar.
>
> Termos do domínio seguem o [CONTEXT.md](../../CONTEXT.md); termos de arquitetura seguem a skill.

## Vocabulário (resumo)

- **Módulo** — qualquer coisa com uma **interface** e uma **implementação** (função, hook, pasta, tier).
- **Interface** — tudo que um chamador precisa saber para usar o módulo: assinatura + invariantes, ordem,
  modos de erro, config exigida, características de performance.
- **Profundidade (depth)** — *alavancagem na interface*: muito comportamento atrás de pouca interface.
  Fundo = interface pequena, implementação grande. Raso = interface quase do tamanho da implementação.
- **Seam** — o lugar onde a interface de um módulo vive (onde dá pra trocar comportamento sem editar ali).
- **Adapter** — algo concreto que satisfaz a interface num seam (ex.: repositório HTTP vs. in-memory).
- **Leverage / Locality** — o que a profundidade entrega: alavancagem para chamadores, e mudança/bugs/teste
  concentrados em um lugar para quem mantém.

## Ponto de partida (estado atual)

O `app/` é hoje **~100% o template `shadcn-admin`**: **não há código de domínio SESI** (Vaga, candidato,
SLA). É **frontend-only / mock** — dados vêm de `faker` (`features/*/data/*.ts`) e "mutações" só chamam
`showSubmittedData()` (um toast). O `QueryClient` está configurado, mas **sem consumidores**.

Isso é uma **vantagem**: dá para fixar a arquitetura de módulos **antes** de construir o domínio, imitando
os módulos profundos que o template já traz de bom e evitando repetir suas duplicações.

---

## 1. Módulos profundos existentes (modelos a imitar)

Bons exemplos já no repo — interface pequena, comportamento real, testável pela interface:

| Módulo | Interface (pequena) | Comportamento (escondido) | Por que é fundo |
|---|---|---|---|
| `hooks/use-table-url-state.ts` | config declarativa `{ search, navigate, pagination, globalFilter, columnFilters[] }` → handlers `onXChange` | sincroniza estado da tabela ↔ URL, remove defaults da URL, `ensurePageInRange`, serialize/deserialize por filtro | **O melhor do repo.** `navigate`/`search` são **injetados** (DI) → puro e unit-testado; sobrevive a refactors internos. |
| `components/data-table/bulk-actions.tsx` | 3 props: `{ table, entityName, children }` | toolbar flutuante com a11y completa (roving tabindex, live region, Escape) | muito comportamento de acessibilidade atrás de 3 props. |
| `components/data-table/{column-header,toolbar,faceted-filter,pagination}.tsx` | props genéricas `<TData>` finas | ordenação/ocultação, filtro facetado, paginação com elipse | primitivos finos sobre a `Table` do TanStack. |
| `lib/utils.ts`, `lib/cookies.ts`, `lib/handle-server-error.ts` | funções puras | `cn()`, paginação com elipse, cookies, mapeamento erro-axios→toast | isolados, testados, sem I/O acoplado. |
| `context/{theme,layout,search,font,direction}-provider.tsx` | hook pequeno (`useTheme`, `useLayout`…) | estado persistido em cookie, variantes de sidebar/RTL | interface de hook enxuta sobre estado com efeito. |

**Regra prática:** ao criar módulo novo, mire nesse formato — **config declarativa + dependências
injetadas + retorno de dados** (não efeitos colaterais escondidos).

## 2. Pass-throughs rasos / oportunidades de deepening

Onde o template **duplica** e um módulo profundo pagaria a dívida (teste da deleção: se apagar, a
complexidade **reaparece em N chamadores** → vale a pena consolidar):

1. **Montagem de tabela por feature (maior oportunidade).** `features/tasks/components/tasks-table.tsx` ≈
   `features/users/components/users-table.tsx`: a config do `useReactTable` + o loop de render `<Table>` +
   o efeito `ensurePageInRange` estão **copiados** (~120 linhas por feature). → Criar **um `<DataTable
   columns data toolbar bulkActions />` genérico** (o wrapper que o kit `data-table/` já implica). Interface
   pequena; absorve o scaffold repetido. **Construa isto antes da primeira tela de Vagas.**
2. **`*-provider` + `*-dialogs` por feature.** Cada feature reescreve um contexto idêntico de estado de
   diálogo (`tasks-provider.tsx` ≡ `users-provider.tsx`, variando só o union `DialogType` e o tipo da
   entidade). → Generificar para `createEntityDialogStore<T>()`.
3. **`lib/show-submitted-data.tsx`.** Placeholder que "finge" a mutação (toast do JSON). É o marcador do
   seam de mutação/persistência que ainda não existe (ver §3.4).

## 3. Onde o domínio SESI entra (os seams)

Categorias de dependência seguem o `DEEPENING.md`: **in-process** (computação pura — sempre aprofundável,
testa direto), **remote-but-owned** (serviço próprio atravessando a rede — Ports & Adapters), **true
external** (terceiro — mock).

### 3.1 Entidade & schema da Vaga — *in-process*
Novo `src/features/vagas/data/schema.ts` com o **schema Zod da `Vaga`**, incluindo os **dois eixos** como
enums (`Status` com 6 valores, `Ação atual` com 10 etapas — ADR [0001](../adr/0001-status-e-acao-como-eixos-independentes.md)).
Esse schema é a **fonte única**: a rota (`validateSearch`) e as colunas da tabela importam dele. Espelha o
padrão que o template já usa (`tasks/index.tsx` importa `statuses`/`priorities` do `data/` da feature).

### 3.2 Motor de SLA + matriz Status↔Ação — *in-process (módulo profundo puro)*
Módulo de domínio (ex.: `src/features/vagas/domain/sla.ts` e `.../transicoes.ts`) com **funções puras**:
`slaSeverity(vaga, now) → 'ok' | 'atencao' | 'estourado'`, contagem de **dias úteis** e tabela de
**feriados por Unidade** (ADR [0002](../adr/0002-sla-dias-uteis-com-motor-de-feriados-proprio.md), sobre `date-fns`).

- **Interface pequena, muito comportamento** (regras de pausa em Suspensa/Congelada, meta de 20 dias úteis,
  congelamento na Divulgação do resultado) → módulo **fundo**.
- Dependências in-process (a tabela de feriados é **dado injetado**, não I/O) → **sem adapter**; testa-se
  direto pela interface no Vitest já configurado.
- **Não** misturar com renderização: o motor retorna severidade/tempos; os **tokens** e badges (§3.3)
  consomem o resultado.

### 3.3 Tokens de status/SLA — *seam de design*
Introduzir `--status-*` e `--sla-*` em `app/src/styles/theme.css` (OKLCH, dentro de `@theme`), substituindo
os mapas **hardcoded** de cor (`callTypes` em `features/users/data/data.ts`). O badge de Status e o
indicador de SLA passam a **ler tokens**, não strings de Tailwind soltas. (Ver [design-system.md](../design/design-system.md).)

### 3.4 Persistência — *remote-but-owned → Ports & Adapters*
Quando entrar backend: definir uma **porta** `VagaRepository` (interface) no seam; a lógica de domínio
depende da porta, não do transporte.

- **Adapter de produção:** HTTP (instância `axios` em `src/api/` + `queryOptions`), consumido nos *loaders*
  das rotas `_authenticated/vagas` — o `queryClient` já está no **context do router** (`main.tsx`), pronto
  para prefetch; o contrato de erro já existe em `lib/handle-server-error.ts`.
- **Adapter de teste:** in-memory.
- **Disciplina de seam:** *um adapter é seam hipotético; dois adapters (prod + teste) tornam o seam real.*
  Só crie a porta quando os dois adapters se justificarem — evita indireção à toa.

### 3.5 RBAC — *seam de rota (enforcement ausente)*
O **dado** de papel já existe (`stores/auth-store.ts` → `auth.user.role: string[]`), mas **nada aplica**.
Adicionar um guard **`beforeLoad`** no layout route pathless `_authenticated/route.tsx` lendo o papel e
redirecionando quando não autorizado — o padrão canônico do TanStack Router (confirmado via context7) que o
template omitiu. Mapear cada ator do [CONTEXT.md](../../CONTEXT.md) às operações permitidas.

### 3.6 Navegação — *ponto único de edição*
Expor as rotas SESI editando o objeto `components/layout/data/sidebar-data.ts` (hoje ainda branded do
template).

---

## 4. Disciplina de teste (replace, don't layer)

- Teste **na interface** do módulo profundo (comportamento observável), não no estado interno.
- SLA engine e schema da Vaga são **in-process** → testes diretos, sem mocks, no Vitest browser já ativo.
- Ao aprofundar um módulo raso (ex.: extrair o `<DataTable>` genérico), **substitua** os testes rasos
  antigos por testes na nova interface — não empilhe as duas camadas.

## 5. Sequência recomendada (para o front do SESI)

1. **Schema da `Vaga`** (§3.1) — trava o vocabulário em tipos.
2. **`<DataTable>` genérico** (§2.1) — paga a duplicação antes de nascer a 3ª tabela.
3. **Motor de SLA puro + testes** (§3.2) — o coração do produto, isolado e verificável.
4. **Tokens `--status-*`/`--sla-*`** (§3.3) — badges e indicador de SLA lendo tokens.
5. **Tela-lista de Vagas** compondo 1–4.
6. **RBAC `beforeLoad`** (§3.5) e, depois, **porta de persistência** (§3.4) quando o backend existir.

> **Opcional — Design It Twice.** Antes de codar o **motor de SLA**, vale desenhar a interface dele em ~3
> variações (minimizar interface · maximizar flexibilidade · otimizar o caso comum) e comparar por depth,
> locality e posição do seam — conforme `.agents/skills/codebase-design/DESIGN-IT-TWICE.md`. Fica como
> próximo passo, fora deste esforço de organização.
