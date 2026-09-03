<!--
Template curto de propósito: as checklists completas já existem em docs/ e são a
fonte da verdade. Aqui ficam só os pontos que costumam escapar em revisão.
-->

## O que muda e por quê

<!-- 1–3 frases. Se houver issue/requisito (RF__), referencie. -->

## Como verificar

<!-- Passos para o revisor reproduzir: rota, papel de usuário, dado de entrada. -->

---

## Gate obrigatório

Rodados localmente em `app/` — é o mesmo conjunto do CI:

- [ ] `pnpm lint` · `pnpm format:check` · `pnpm knip` · `pnpm test` · `pnpm build`

## Checklists aplicáveis

Marque só as que o PR toca — cada uma é a definição de pronto da sua área:

- [ ] [Front-end](../docs/engineering/checklist-front-end.md) — toda mudança em `app/src/`
- [ ] [Design System](../docs/design/checklist-design-system.md) — tokens, componentes, tema
- [ ] [UX](../docs/design/checklist-ux.md) — telas, fluxos, os 4 estados obrigatórios

## Pontos que costumam escapar

- [ ] **Linguagem ubíqua** — os termos batem com [CONTEXT.md](../CONTEXT.md)?
      (`Status` × `Ação atual`, `SLA`, `Gestora de RH` × `Gestor solicitante`)
- [ ] **Invariantes de domínio** — se mexeu em Status/Ação/SLA: a matriz de transições
      e o SLA derivado (nunca persistido) continuam valendo? Tem teste cobrindo?
- [ ] **LGPD** — nenhum campo sensível de candidato exposto fora do papel que pode vê-lo,
      e nada de dado pessoal em log, URL ou agregado de painel.
- [ ] **Docs no mesmo PR** — doc afetado atualizado junto (doc vivo, não backlog).

## Risco

- [ ] Sem migração de dado / mudança de contrato
- [ ] Tem mudança de contrato ou de forma de dado — descreva o impacto e o plano de rollback:

<!-- Descreva aqui se marcou a segunda opção. -->
