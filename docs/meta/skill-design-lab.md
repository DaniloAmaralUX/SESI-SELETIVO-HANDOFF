---
titulo: Skill `design-lab` — Exploração de UI com 5 variações comparáveis
tipo: reference
status: instalada
data: 2026-07-13
origem: npx skills add https://github.com/0xdesign/design-plugin --skill design-lab
baseline_tecnica: template shadcn-admin (React 19 + Vite + TanStack Router/Query/Table + shadcn/ui + Tailwind v4)
localizacao_skill: .agents/skills/design-lab/ (symlink em .claude/skills/design-lab)
fontes:
  - .agents/skills/design-lab/SKILL.md (plugin 0xdesign/design-plugin)
  - .agents/skills/design-lab/DESIGN_PRINCIPLES.md
  - docs/engineering/estudo-shadcn.md (design system / tokens shadcn)
  - docs/design/arquitetura-informacao.md (inventário de telas e componentes)
---

# Skill `design-lab` — Exploração de UI com 5 variações

> Documentação da skill **`design-lab`** instalada via `npx skills add`. Ela conduz um fluxo
> completo de exploração de design de interface: **entrevista o usuário, gera 5 variações
> distintas** de um componente/página num laboratório temporário, coleta feedback interativo,
> sintetiza a variação vencedora e, ao final, **apaga todos os artefatos temporários** e produz
> um plano de implementação (`DESIGN_PLAN.md`) + memória de design (`DESIGN_MEMORY.md`).
> ⚠️ A skill é escrita para **Next.js**; a seção *Adaptação para este projeto* explica os ajustes
> necessários no nosso stack **Vite + Tailwind v4**.

---

## O que é / quando usar

Use quando quiser **explorar opções de UI**, redesenhar um componente/tela existente ou criar uma
nova com **múltiplas abordagens para comparar** lado a lado — em vez de partir direto para uma
única implementação. Cada variação explora um eixo de design diferente (hierarquia, layout,
densidade, interação, direção expressiva), sempre reaproveitando a linguagem visual do projeto.

---

## Fluxo em 8 fases (resumo)

0. **Preflight** — detecta package manager, framework, sistema de estilos e uma eventual *Design
   Memory* existente; **infere os tokens visuais do projeto** (cores, spacing, radius, tipografia)
   a partir da config/CSS e dos componentes existentes (não usa estilos genéricos).
1. **Entrevista** — via `AskUserQuestion`: escopo (componente/página), novo vs. redesign, pain
   points, inspirações visuais/funcionais, tom de marca, densidade, dark mode, persona, tarefas
   principais e restrições.
2. **Design Brief** — consolida as respostas em `.claude-design/design-brief.json` e mostra um
   resumo antes de prosseguir.
3. **Geração do Lab** — cria `.claude-design/lab/` com **5 variantes (A–E)**, dados de fixture
   compartilhados e um **FeedbackOverlay** (overlay de feedback tipo Figma) — este overlay é
   descrito como o recurso central e não deve ser omitido.
4. **Apresentação** — informa a URL do lab; **não** sobe o dev server sozinho (processo longo que
   travaria) — o usuário roda `pnpm dev` e abre a rota.
5. **Coleta de feedback** — pelo overlay no navegador (clicar em elementos e comentar) ou, como
   fallback, via `AskUserQuestion` no terminal.
6. **Síntese** — cria uma variante híbrida (F) combinando o que o usuário gostou de cada uma;
   itera até aprovação.
7. **Preview final** — `.claude-design/preview/` com o design vencedor (com before/after em
   redesigns) e confirmação final.
8. **Finalização** — **cleanup** de tudo que é temporário + geração de `DESIGN_PLAN.md` e
   `DESIGN_MEMORY.md`.

O `DESIGN_PRINCIPLES.md` que acompanha a skill é a base de UX/visual/componentes/interação/motion/
acessibilidade/anti-patterns que orienta a geração das variantes (11 partes + framework de decisão).

---

## Artefatos: temporários vs. permanentes

**Temporários (SEMPRE apagados no fim, seja por conclusão ou cancelamento):**
- `.claude-design/` (brief, lab, variantes, feedback, preview).
- Rotas temporárias `__design_lab` / `__design_preview`.

> A skill enfatiza: nunca deixar `.claude-design/` ou rotas `__design_lab` para trás. Se você
> disser "cancelar/abortar/parar", ela confirma e apaga os temporários sem gerar plano.

**Permanentes (saídas na raiz do projeto):**
- `DESIGN_PLAN.md` — plano de implementação (arquivos a mudar, passos, API do componente, estados
  de UI, checklists de acessibilidade/teste, tokens).
- `DESIGN_MEMORY.md` — memória de design (tom de marca, layout/spacing, tipografia, cor, padrões
  de interação, regras de acessibilidade, convenções do repo).

---

## ⚠️ Adaptação para ESTE projeto (Vite + Tailwind v4)

A skill assume **Next.js** em vários pontos. Antes de usá-la aqui, ajuste:

- **Framework é Vite, não Next.js.** Nada de `app/__design_lab/page.tsx`. Use o fallback previsto
  pela própria skill para Vite: uma **rota do TanStack Router** (ex.: `/__design_lab`) ou um render
  condicional por query param (`?design_lab=true`). O roteamento do projeto é **TanStack Router**
  com `autoCodeSplitting` (ver `app/vite.config.ts` e `docs/meta/skill-vite.md`).
- **Sem `tailwind.config.*`.** É **Tailwind v4** (config em CSS via `@theme`). O passo da skill
  que lê `tailwind.config.js` não se aplica — infira os tokens de **cor/spacing/radius/tipografia**
  do CSS (`@theme` / variáveis `:root` / `globals.css`) e dos componentes shadcn existentes,
  conforme `docs/engineering/estudo-shadcn.md`.
- **Package manager: pnpm**; o app está em **`app/`** (a raiz não tem `package.json`).
  Comandos e rotas devem considerar esse subdiretório.
- **Reaproveitar o design system:** priorize componentes shadcn/ui já mapeados em
  `docs/design/arquitetura-informacao.md` em vez de introduzir novas dependências.
- **FeedbackOverlay não vem no bundle.** O `SKILL.md` referencia um template
  (`design-and-refine/templates/feedback/FeedbackOverlay.tsx`) que **não foi instalado** (só vieram
  `SKILL.md` + `DESIGN_PRINCIPLES.md`). Ao usar a skill, o overlay precisará ser **escrito à mão**
  no diretório da rota, adaptado ao React 19 + Tailwind v4.

---

## Como acionar

- Disponível para o Claude Code via symlink em `.claude/skills/design-lab`.
- Instalação/atualização: `npx skills add https://github.com/0xdesign/design-plugin --skill design-lab`.
- Detalhes: https://skills.sh/0xdesign/design-plugin.

---

*Doc gerada ao instalar a skill. Ver `docs/engineering/estudo-shadcn.md` (tokens/design system) e
`docs/design/arquitetura-informacao.md` (telas/componentes) para aplicar as variantes ao projeto.*
