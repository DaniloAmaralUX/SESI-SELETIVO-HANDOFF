---
titulo: Checklist — Front-end
tipo: checklist
status: ativo (usar em todo PR do app/)
data: 2026-07-20
fontes:
  - CLAUDE.md (contrato do repo)
  - docs/engineering/arquitetura-de-modulos.md
  - docs/engineering/stack.md
  - docs/engineering/handoff-dev.md
---

# Checklist — Front-end

> Definição de pronto de código para o `app/`. Complementa (não substitui) as checklists de
> [design system](../design/checklist-design-system.md) e [UX](../design/checklist-ux.md).
> Lembrete do contrato: **o descartável é o dado, nunca o código** — qualidade é requisito de entrega.

## 1. Qualidade mínima (gate de PR)

- [ ] `pnpm lint` · `pnpm format:check` · `pnpm test` · `pnpm build` passam localmente (mesmo conjunto do CI).
- [ ] `pnpm knip` sem novos exports/arquivos mortos.
- [ ] Sem `console.log`, código comentado ou `TODO` órfão (TODO só com referência a plano/issue).
- [ ] TypeScript sem `any`/`as` gratuitos; tipos derivam dos schemas Zod, não duplicados à mão.

## 2. Arquitetura de módulos

- [ ] Feature em `features/<nome>/` com a estrutura padrão (`data/`, componentes, rota fina).
- [ ] **Schema Zod como fonte única**: entidade e search params derivam de `features/*/data/schema.ts`.
- [ ] **Domínio puro é in-process**: regras (SLA, transições B1, agregações) são funções puras em
      `lib/`, com dependências **injetadas** (feriados são dado, não I/O) — sem imports de React.
- [ ] Mutações passam **só** pela porta de persistência (`data/vagas-store.ts` ou equivalente) —
      nenhuma tela muta dado direto. Trocar mock por API não pode exigir tocar em componente.
- [ ] Módulo profundo, interface pequena (modelo: `hooks/use-table-url-state.ts`); sem efeitos escondidos.
- [ ] Reusa `components/data-table/` e utils de `lib/` antes de criar paralelo.

## 3. Rotas e navegação (TanStack Router)

- [ ] Rota file-based em `src/routes/`, dentro do grupo certo (`_authenticated`, `(auth)`, `(errors)`).
- [ ] Search params validados com `validateSearch` (schema Zod) — estado de filtro vive na URL.
- [ ] Guarda/RBAC no `beforeLoad` do layout pathless (não em componente).
- [ ] Links tipados (`Link to=`), sem strings de rota soltas.

## 4. Dados e estado

- [ ] Estado de servidor via TanStack Query (quando a camada de dados chegar); estado global só no
      Zustand existente; estado local no componente — nada de store nova sem justificativa.
- [ ] Datas com `date-fns`; **nunca** aritmética de `Date` manual para dias úteis — usar o motor de
      SLA (`lib/sla.ts`).
- [ ] Mock realista via faker em `features/*/data/` — isolado e substituível.

## 5. Formulários

- [ ] React Hook Form + resolver Zod (`@hookform/resolvers`) — validação nunca duplicada no componente.
- [ ] Mensagens de erro em pt-BR, específicas por campo.
- [ ] Submit com estado de loading e toast de resultado; erro de servidor via `handle-server-error.ts`.

## 6. Testes (Vitest, browser mode)

- [ ] Domínio puro testado direto (SLA, transições, agregações) — sem mock de UI.
- [ ] Teste na **interface** do módulo (comportamento observável), não no estado interno.
- [ ] Ao aprofundar um módulo raso, testes antigos **substituídos**, não empilhados.
- [ ] Casos de borda do domínio cobertos: feriados móveis, virada de ano, vaga pausada, transição inválida.

## 7. Performance

- [ ] Sem import que quebre o code-splitting automático das rotas (nada de importar página dentro de página).
- [ ] Listas grandes paginadas (DataTable) — sem render de centenas de linhas de uma vez.
- [ ] Sem re-render em cascata evidente (props estáveis; seletores de store granulares).
- [ ] Imagens/assets otimizados; nenhuma dependência nova pesada sem justificativa no PR.

## 8. Segurança e privacidade

- [ ] Nenhum segredo/token no código ou no bundle.
- [ ] Campos sensíveis LGPD 🔒 condicionados a papel também na **camada de dados** (não só ocultos na UI).
- [ ] Importação de planilha: validação de tipo/tamanho e neutralização de fórmulas (CSV injection).
- [ ] Sem `dangerouslySetInnerHTML` com conteúdo não sanitizado.

## 9. Processo (loop Compound Engineering)

- [ ] Feature nasceu de plano em `docs/plans/` (plan-first); bug começou em `/ce-debug`.
- [ ] Trabalho não-trivial em branch/worktree; review antes de merge; CI verde.
- [ ] Aprendizado não-óbvio documentado em `docs/solutions/` (`/ce-compound`); vocabulário novo de
      domínio refletido no `CONTEXT.md`.
- [ ] Docs afetados atualizados no mesmo PR (design system, IA, handoff) — doc vivo.
