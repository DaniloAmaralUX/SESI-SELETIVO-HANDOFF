---
titulo: Skill `vite` — Referência de Build/Config (Vite 8, Rolldown + Oxc)
tipo: reference
status: instalada
data: 2026-07-13
origem: npx skills add https://github.com/antfu/skills --skill vite
baseline_tecnica: template shadcn-admin (React 19 + Vite + TanStack Router/Query/Table + shadcn/ui + Tailwind v4)
localizacao_skill: .agents/skills/vite/ (symlink em .claude/skills/vite)
fontes:
  - .agents/skills/vite/SKILL.md (autoria Anthony Fu; gerada de github.com/vitejs/vite)
  - app/vite.config.ts (config real do projeto)
---

# Skill `vite` — Referência de Build/Config (Vite 8)

> Documentação da skill **`vite`** instalada no repositório via `npx skills add`. A skill é uma
> base de conhecimento sobre o **Vite 8 beta (Rolldown + Oxc)**: configuração, features,
> Plugin API, Build & SSR, Environment API e migração para o Vite 8. Este doc resume o que ela
> cobre e **como ela se conecta ao stack real** do projeto, cujo app (`app/`) já roda
> Vite 8. Ponte prática entre a referência genérica e o nosso `vite.config.ts`.

---

## O que é / quando usar

A skill fornece contexto atualizado sobre o Vite para tarefas de build e configuração. Aciona-se
sozinha (ou pode ser invocada) quando se trabalha com **projetos Vite, `vite.config.ts`, plugins
Vite, ou builds de biblioteca/SSR** — exatamente o caso deste repositório.

Preferências que a skill adota (e que já valem aqui):
- Usar **TypeScript**: `vite.config.ts` (o projeto já usa).
- Sempre **ESM**, evitar CommonJS.

---

## O que a skill cobre

Além do `SKILL.md`, a skill instala referências detalhadas em `.agents/skills/vite/references/`:

| Tópico | Descrição | Arquivo de referência |
|--------|-----------|------------------------|
| Configuração | `vite.config.ts`, `defineConfig`, configs condicionais, `loadEnv` | `references/core-config.md` |
| Features | `import.meta.glob`, asset queries (`?raw`, `?url`), `import.meta.env`, HMR API | `references/core-features.md` |
| Plugin API | hooks específicos do Vite, virtual modules, ordenação de plugins | `references/core-plugin-api.md` |
| Build & SSR | library mode, SSR middleware, `ssrLoadModule`, JavaScript API | `references/build-and-ssr.md` |
| Environment API | multi-environment (Vite 6+), runtimes customizados | `references/environment-api.md` |
| Migração Rolldown | mudanças do Vite 8: bundler Rolldown, transformer Oxc, migração de config | `references/rolldown-migration.md` |

---

## Como se conecta a ESTE projeto

O app vive em `app/` e o build já é Vite 8. O `app/vite.config.ts` usa três
plugins, todos com tópicos correspondentes na skill:

- **`@tanstack/router-plugin/vite`** (`tanstackRouter`, com `autoCodeSplitting: true`) — roteamento
  baseado em arquivos + code splitting. Ver *Plugin API* e *Features* da skill.
- **`@vitejs/plugin-react`** — React 19 (a skill lista `@vitejs/plugin-react` como plugin oficial;
  há também a variante SWC `@vitejs/plugin-react-swc`).
- **`@tailwindcss/vite`** — Tailwind **v4** integrado como plugin do Vite (config em CSS via
  `@theme`, **sem `tailwind.config.*`**). Ver `docs/engineering/estudo-shadcn.md` para o design system.

Outros pontos do config já alinhados com a skill: alias `@` → `./src` (`resolve.alias`) e testes
via **Vitest browser mode** (Playwright/chromium).

Ao mexer em build, dev server, plugins, SSR ou ao migrar/atualizar versões, consulte primeiro a
referência correspondente na tabela acima.

---

## Como acionar

- A skill fica disponível para o Claude Code via symlink em `.claude/skills/vite`.
- Instalação/atualização: `npx skills add https://github.com/antfu/skills --skill vite`.
- Detalhes de segurança/versão: `.agents/skills/vite/GENERATION.md` (gerada do Vite, SHA
  registrado) e https://skills.sh/antfu/skills.

---

*Doc gerada ao instalar a skill. Fonte de verdade sobre o stack: `docs/design/arquitetura-informacao.md`
e `docs/engineering/estudo-shadcn.md`.*
