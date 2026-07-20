# Contribuindo — SESI Processo Seletivo

Guia prático para rodar, testar e evoluir o projeto. Antes de codar, leia dois documentos:

1. **[CONTEXT.md](CONTEXT.md)** — a linguagem ubíqua. Use exatamente estes termos em código, telas e commits
   (ex.: `Status` × `Ação atual`, `SLA`, `Recrutador`, `Gestora de RH`). Nunca invente sinônimo.
2. **[docs/engineering/arquitetura-de-modulos.md](docs/engineering/arquitetura-de-modulos.md)** — os padrões de
   módulo (deep modules) a seguir e onde a camada de domínio se encaixa.

## Pré-requisitos

- **Node 20+**
- **pnpm** (`npm i -g pnpm`)

## Rodar

Todo o app vive em `app/`. Rode os comandos de dentro dessa pasta.

```bash
cd app
pnpm install
pnpm dev            # dev server (Vite + HMR)
pnpm build          # tsc -b && vite build (build de produção)
pnpm preview        # serve o build
```

## Qualidade

```bash
pnpm lint           # ESLint
pnpm format         # Prettier --write (ordena imports e classes Tailwind)
pnpm format:check   # Prettier --check
pnpm knip           # detecta código/exports mortos
```

## Testes

Vitest roda em **browser mode** (Playwright/chromium). Na primeira vez, instale o navegador:

```bash
pnpm test:browser:install   # playwright install chromium --with-deps
pnpm test                   # roda a suíte (headless)
pnpm test:watch             # modo watch
pnpm test:ui                # UI do Vitest
```

Convenções de teste:

- Testes são **colocados** ao lado do código (`*.test.ts(x)`).
- Teste **pela interface** do módulo (comportamento observável), não pelo estado interno — ver a disciplina
  "replace, don't layer" na [arquitetura de módulos](docs/engineering/arquitetura-de-modulos.md).
- O motor de SLA e o schema da `Vaga` são **puros / in-process** → teste direto, sem mocks.

## Organização do código (`app/src/`)

- **`features/<feature>/`** — uma fatia por tela. Convenção (veja `features/users/` como modelo):
  `index.tsx` (a tela) · `components/` · `data/schema.ts` (Zod + tipos) · `data/data.tsx` (listas/ícones) ·
  `data/<mock>.ts`. O domínio novo entra como `features/vagas/`.
- **`components/ui/`** — primitivos shadcn (vendorizados; evite editar salvo customização deliberada).
- **`components/data-table/`** — primitivos reutilizáveis de tabela.
- **`routes/`** — rotas file-based do TanStack Router (validam search params e renderizam a feature).
- **`lib/`, `hooks/`, `context/`, `stores/`, `config/`, `styles/`** — utilitários, hooks, providers,
  Zustand, config e tokens.

## Commits

O projeto usa **Conventional Commits** (config em `app/cz.yaml`). Formato:

```
<tipo>(escopo opcional): descrição no imperativo

# tipos comuns: feat, fix, docs, refactor, chore, test, style, build
```

Exemplos: `feat(vagas): lista de vagas com badges de status` · `docs: adiciona referência da stack`.

## Fluxo de branch

Trabalhe em uma branch por mudança; abra a mudança contra `main`. Não faça commit direto em `main` para
trabalho não trivial.
