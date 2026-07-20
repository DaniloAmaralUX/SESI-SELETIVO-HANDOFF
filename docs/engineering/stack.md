---
titulo: Referência da Stack — SESI Processo Seletivo
tipo: engineering-reference
status: referência
baseline_tecnica: app/ (React 19 · Vite 8 · TanStack Router/Query/Table · shadcn/ui new-york · Tailwind v4 · Zod 4 · Zustand 5)
fontes:
  - app/package.json (versões reais)
  - app/vite.config.ts · app/components.json
---

# Referência da Stack

> O que cada peça faz, a versão em uso e **por que ela está aqui no contexto SESI**. As versões saem do
> `app/package.json`; as recomendações de uso foram cruzadas com a documentação oficial de cada biblioteca.
> Para o funcionamento do shadcn/ui em si, ver [estudo-shadcn.md](estudo-shadcn.md).

## Panorama

O app é uma **SPA frontend-only** (sem backend próprio ainda): React renderizado pelo Vite, roteamento
type-safe file-based, tabelas densas e formulários validados. Toda a "casca" (sidebar, header, temas,
tabelas, diálogos) vem do template; o domínio SESI (Vaga, eixos, SLA) ainda será construído por cima
(ver [arquitetura-de-modulos.md](arquitetura-de-modulos.md)).

## Núcleo

| Biblioteca | Versão | Papel no projeto |
|---|---|---|
| [React](https://react.dev) | 19.2 | Biblioteca de UI. |
| [Vite](https://vite.dev) | 8 | Build tool e dev server (HMR). Vite 8 usa o bundler **Rolldown**. |
| [TypeScript](https://www.typescriptlang.org/) | ~6.0 | Tipagem estática de todo o `src/`. |
| [pnpm](https://pnpm.io) | — | Gerenciador de pacotes (o `app/` tem `pnpm-lock.yaml`). |

## Roteamento e dados (TanStack)

| Biblioteca | Versão | Papel no projeto |
|---|---|---|
| [TanStack Router](https://tanstack.com/router) | 1.168 | Roteamento **file-based** e type-safe (`src/routes/`), com validação de search params por rota (`validateSearch`) e grupos/layout routes pathless (`_authenticated`, `(auth)`, `(errors)`). Plugin de build `@tanstack/router-plugin/vite` com `autoCodeSplitting`. |
| [TanStack Query](https://tanstack.com/query) | 5.99 | Cache/estado de servidor. **Configurado** (`QueryClient` com política de retry e tratamento de 401/403/500) mas ainda **sem consumidores** — é o seam pronto para a camada de dados. |
| [TanStack Table](https://tanstack.com/table) | 8.21 | Motor headless das tabelas densas (a lista de Vagas será a tela-tese). Consumido via os primitivos em `src/components/data-table/`. |

> **Padrões confirmados na documentação do TanStack Router:** o `@tanstack/router-plugin` deve vir **antes** do
> `@vitejs/plugin-react` no `vite.config.ts` (é o caso aqui); fronteiras de autenticação se fazem com um
> **layout route pathless** (`_authenticated`) carregando um `beforeLoad` que protege todos os filhos — é
> exatamente onde o RBAC do SESI vai entrar (hoje ausente; ver ADRs e arquitetura de módulos).

## UI, estilo e componentes

| Biblioteca | Versão | Papel no projeto |
|---|---|---|
| [shadcn/ui](https://ui.shadcn.com) | (código vendorizado) | Registro de componentes copiados para `src/components/ui/` (estilo **new-york**, base **slate**, `cssVariables: true`, ícones **lucide**). Não é dependência npm. |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utilitários de estilo. **v4 é CSS-first**: sem `tailwind.config.*` — configuração em CSS via `@import "tailwindcss"`, `@theme`/`@theme inline` e `@custom-variant dark` (ver `src/styles/index.css` e `theme.css`). Integrado por `@tailwindcss/vite`. |
| [Radix UI](https://www.radix-ui.com) | — | Primitivos acessíveis por baixo dos componentes shadcn. |
| [CVA](https://cva.style) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) + [clsx](https://github.com/lukeed/clsx) | — | Variantes de componentes e composição de classes (`cn()` em `src/lib/utils.ts`). |
| [lucide-react](https://lucide.dev) | 1.8 | Ícones. |
| [Recharts](https://recharts.org) | 3.8 | Gráficos (dashboard, futuro painel de SLA). |
| [Sonner](https://sonner.emilkowal.ski/) | 2.0 | Toasts. |
| [cmdk](https://cmdk.paco.me/) | 1.1 | Command palette (busca global). |

> **Confirmado na documentação do Tailwind v4:** tokens de tema são declarados em `@theme { --color-…: oklch(…) }`
> e viram CSS variables; o modo escuro usa a variante `dark` (aqui via `@custom-variant dark`). É nesse
> arquivo (`theme.css`) que entram os tokens de domínio `--status-*` / `--sla-*` (ver design system).

## Formulários e validação

| Biblioteca | Versão | Papel no projeto |
|---|---|---|
| [React Hook Form](https://react-hook-form.com) | 7.72 | Estado de formulários (todos os diálogos de criar/editar). |
| [Zod](https://zod.dev) | 4 | Schemas de validação **e** fonte dos tipos (entidades e search params de rota). O schema da `Vaga` será a fonte única de Status/Ação. |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | 5.2 | Ponte RHF ↔ Zod. |

## Estado e utilidades

| Biblioteca | Versão | Papel no projeto |
|---|---|---|
| [Zustand](https://zustand-demo.pmnd.rs/) | 5 | Estado global leve. Hoje só `stores/auth-store.ts` (token + `role[]`, persistido em cookie). |
| [date-fns](https://date-fns.org) | 4.1 | Datas — base do cálculo de **dias úteis** do motor de SLA (ADR 0002). |
| [axios](https://axios-http.com) | 1.15 | Cliente HTTP (dependência presente; **nenhuma instância criada ainda** — o contrato de erro vive em `src/lib/handle-server-error.ts`). |
| [@faker-js/faker](https://fakerjs.dev) | 10 (dev) | Gera os dados mock atuais (`features/*/data/*.ts`). Substituível pela camada real. |

## Ferramentas de qualidade

| Ferramenta | Papel |
|---|---|
| [Vitest](https://vitest.dev) 4 (**browser mode**, Playwright/chromium) | Testes; roda no navegador real. Cobertura via v8 (exclui `components/ui/**`, `routes/**`, gerados). |
| [ESLint](https://eslint.org) 10 + [Prettier](https://prettier.io) 3 | Lint e formatação (com ordenação de imports e de classes Tailwind). |
| [Knip](https://knip.dev) | Detecta código/exports mortos. |
| [Commitizen](https://commitizen-tools.github.io/commitizen/) (`cz.yaml`) | Padrão de mensagens de commit. |

## Configuração real (resumo)

- **`app/vite.config.ts`** — plugins na ordem `tanstackRouter({ target:'react', autoCodeSplitting:true })`
  → `react()` → `tailwindcss()`; alias `@` → `src/`; Vitest em browser mode.
- **`app/components.json`** — `style: new-york`, `baseColor: slate`, `cssVariables: true`, `iconLibrary: lucide`;
  aliases `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`.
- **`app/src/styles/index.css`** — `@import 'tailwindcss'` + `tw-animate-css` + `./theme.css`;
  `@custom-variant dark`; utilitários custom.
- **`app/src/styles/theme.css`** — design tokens em **OKLCH** (`:root` + `.dark`), expostos via `@theme inline`.
