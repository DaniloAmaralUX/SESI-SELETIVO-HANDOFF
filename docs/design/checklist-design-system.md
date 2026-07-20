---
titulo: Checklist — Design System
tipo: checklist
status: ativo (usar em toda entrega visual / novo componente)
data: 2026-07-20
fontes:
  - docs/design/design-system.md
  - docs/engineering/estudo-shadcn.md (§7 regras)
  - app/src/styles/theme.css
---

# Checklist — Design System

> Usar em dois momentos: **(A)** ao criar/alterar um componente e **(B)** na auditoria periódica do
> sistema. Marcar `[x]` só com evidência no código (arquivo/linha). Regras completas no
> [Design System](design-system.md) §6.

## A. Por componente (aplicar em todo PR que toque UI)

### Tokens e cor
- [ ] Só tokens semânticos (`bg-primary`, `text-muted-foreground`, `bg-status-*`) — **nenhuma** cor
      crua (`bg-blue-500`) nem hex inline.
- [ ] Cores de Status/SLA vêm de `--status-*` / `--sla-*` em `theme.css` (OKLCH, dentro de `@theme`).
- [ ] Novo token definido em `:root` **e** `.dark`, e mapeado em `@theme inline`.
- [ ] Nenhum `dark:` manual — o par light/dark é resolvido pelos tokens.

### Composição e variantes
- [ ] Reusa primitivo de `components/ui/` ou kit (`data-table/`, `layout/`) antes de criar novo.
- [ ] Componente novo só quando o domínio exige (StatusBadge, SLAIndicator, StageStepper, Timeline,
      Stepper) — e composto de primitivos, não do zero.
- [ ] Variantes via `cva`, seguindo os eixos existentes (`variant`/`size`); exporta `*Variants` se útil.
- [ ] Composição obrigatória respeitada: `SelectItem`→`SelectGroup`, `TabsTrigger`→`TabsList`,
      `Dialog`/`Sheet` sempre com `Title`, `Avatar` com `AvatarFallback`.
- [ ] `className` usado **só para layout** (margens, grid) — nunca para sobrescrever cor/tipografia.

### Layout e utilitários
- [ ] Espaçamento com `flex`/`grid` + `gap-*` (nada de `space-x/space-y`).
- [ ] `size-*` quando largura = altura; `truncate` para texto que estoura.
- [ ] Sem `z-index` manual em overlays (os primitivos resolvem).
- [ ] Classes condicionais via `cn()`.
- [ ] Raio de borda pela escala `--radius-*` (nunca valor solto).

### Estados do componente
- [ ] Hover, focus-visible (ring), disabled e aria-invalid presentes (herdados do primitivo ou
      reimplementados por completo).
- [ ] Estados de domínio cobertos (ex.: SLAIndicator com `ok · warn · danger · muted`).
- [ ] Ícones lucide, tamanho consistente com o texto adjacente.

### Acessibilidade do componente
- [ ] Significado nunca só por cor — ícone + rótulo textual acompanham.
- [ ] Controles só-ícone com `aria-label`.
- [ ] Padrões ARIA do design system: `role="progressbar"` + `aria-valuenow` (SLAIndicator),
      `aria-current="step"` (steppers), lista semântica (Timeline).

## B. Auditoria do sistema (rodar por fase do roadmap)

- [ ] Tokens `--status-*` existem no código e batem com a tabela §2.2 do design system.
- [ ] Nenhum componente de `ui/` foi editado à mão de forma que impeça re-sincronizar com o registro
      shadcn (customização vive em componentes de domínio, não nos primitivos).
- [ ] Tipografia: escala consistente; fonte mono nos dados de instrumento (SLA, IDs, datas) se a
      proposta §2.4 for aprovada.
- [ ] Dark mode íntegro: navegar pelas telas principais em `.dark` sem cor quebrada.
- [ ] Proposta de marca SESI (azul `#0057B8` etc.) validada com o manual de marca antes de aplicar.
- [ ] Componentes ✚ pendentes de criação rastreados (StatusBadge, SLAIndicator, StageStepper,
      Timeline, Stepper) e `progress`/`empty` instalados quando a fase exigir.
- [ ] `sidebar-data.ts` sem restos do template (nav pt-BR SESI).
- [ ] Este checklist e o design system atualizados quando uma regra mudar (doc vivo).
