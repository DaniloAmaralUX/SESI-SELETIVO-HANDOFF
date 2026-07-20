---
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
execution: code
product_contract_source: ce-plan-bootstrap
title: "refactor: Limpeza do template shadcn-admin (Loop 0 tardio)"
date: 2026-07-13
depth: standard
---

# refactor: Limpeza do template shadcn-admin — Loop 0 tardio

Remove o andaime do template `shadcn-admin` que sobra no app depois do Loop 1 (Vagas),
deixando o repositório coerente com o produto SESI antes de seguir para CRUD, motor de
SLA, dashboard, deploy e handoff. É trabalho de **subtração + renomeação**: sem novo
comportamento de domínio, mas com impacto direto na qualidade que o(a) dev de handoff vai
julgar e na clareza do protótipo para os testes de usuário.

**Contexto de entrega:** protótipo hi-fi mockado (Vercel) + handoff para dev, ao mesmo
tempo. Código morto, branding de terceiro e telas de demo confundem os dois públicos.

---

## Problem Frame

O `app/` ainda carrega quatro features de demonstração (`apps`, `chats`, `tasks`,
`users`), a integração de auth **Clerk** (dependência + subtree de rotas `clerk/` +
assets + item de menu), e branding "Shadcn Admin" espalhado (nome do pacote, `index.html`,
switcher de times, usuário mock, README/CHANGELOG). Há também `netlify.toml` — resíduo de
um alvo de deploy que **não** é o nosso (vamos para a Vercel). A navegação lateral mistura
itens em inglês (Tasks, Apps, Chats, Users, Settings, Help Center) com os de domínio.

Nada disso é referenciado pelo código de domínio de Vagas: as features demo só são
importadas pelas próprias rotas (e pela rota `clerk/user-management`), e o Clerk **não**
está montado nos providers do `main.tsx`. Logo, a remoção é contida e de baixo risco — o
principal cuidado é **regenerar `routeTree.gen.ts`** (arquivo gerado, nunca editado à mão)
e manter `lint`/`knip`/`test`/`build` verdes.

### O que fica fora deste loop (não-objetivos)

- **Não** introduzir auth/backend/persistência reais (decisão B3 em aberto — CLAUDE.md).
- **Não** desenhar identidade visual de marca (cores, logo, tipografia SESI) — isso é um
  loop de branding dedicado. Aqui só neutralizamos/renomeamos o que é do template.
- **Não** mexer no comportamento de Vagas nem no design system de tokens `--status-*`.

---

## Requirements

- **R1.** Remover as features de demonstração `apps`, `chats`, `tasks`, `users`
  (`features/*` + rotas `_authenticated/*`), sem quebrar build/testes.
- **R2.** Remover a integração Clerk por completo: dependência `@clerk/react`, subtree
  `routes/clerk/**`, assets `clerk-logo`/`clerk-full-logo`, grupo "Secured by Clerk" na
  sidebar e referências em testes.
- **R3.** Remover `app/netlify.toml` (alvo de deploy é a Vercel, não o Netlify).
- **R4.** Renomear a identidade funcional do pacote/app para SESI (sem design de marca):
  `package.json name`, `<title>` e metatags de `index.html`, README do app.
- **R5.** Reescrever a navegação lateral (`sidebar-data.ts`) 100% em pt-BR, com header de
  marca SESI único (sem multi-time), refletindo apenas o que existe no protótipo.
- **R6.** Após a limpeza, `pnpm lint && pnpm format:check && pnpm knip && pnpm test &&
  pnpm build` passam sem erros (CI verde é obrigatório).

**Rastreamento:** R1→U1, R2→U2, R3→U3, R4→U3+U4, R5→U4, R6→U5.

---

## Key Technical Decisions

- **KTD1 — `routeTree.gen.ts` é gerado, não editado.** O plugin do TanStack Router
  (`@tanstack/router-plugin` no `vite.config.ts`) regenera a árvore ao rodar `pnpm dev`.
  Fluxo: apagar os arquivos de rota → rodar o dev/gerador uma vez → confirmar o
  `routeTree.gen.ts` regenerado. Nunca editar o arquivo à mão.
- **KTD2 — Rotas `(auth)` e feature `auth/` FICAM, ocultas do menu.** O `main.tsx`
  referencia `/sign-in` no handler de erro 401 (`router.navigate({ to: '/sign-in' })`).
  Remover as rotas de auth exigiria alterar esse fluxo de erro — fora do escopo de "limpar
  demo". Decisão: manter `routes/(auth)/**` e `features/auth/**` como andaime funcional,
  apenas **removendo o grupo "Auth" da sidebar**. (Ver Questão Aberta Q1.)
- **KTD3 — Rotas de erro FICAM como fallback real.** `routes/(errors)/**` +
  `_authenticated/errors/$error.tsx` são o comportamento de erro real do app (referenciado
  pelo `main.tsx` no caso 500). Mantê-las; remover o grupo "Errors" do menu.
- **KTD4 — Dashboard FICA.** `features/dashboard` é alvo do Loop 4 (indicadores da Gestora
  de RH). Mantido intacto neste loop.
- **KTD5 — Remoção via `git rm`, um commit por unidade.** Cada U-ID é um commit atômico e
  reversível; facilita o review e o handoff.

---

## Implementation Units

### U1. Remover as features de demonstração e suas rotas

**Goal:** Eliminar `apps`, `chats`, `tasks`, `users` do código.
**Requirements:** R1.
**Dependencies:** nenhuma.
**Files (remover):**
- `app/src/features/apps/**`
- `app/src/features/chats/**`
- `app/src/features/tasks/**`
- `app/src/features/users/**`
- `app/src/routes/_authenticated/apps/index.tsx`
- `app/src/routes/_authenticated/chats/index.tsx`
- `app/src/routes/_authenticated/tasks/index.tsx`
- `app/src/routes/_authenticated/users/index.tsx`

**Approach:** `git rm -r` das quatro features e das quatro rotas. Confirmar (grep) que
nenhum outro arquivo importa `@/features/{apps,chats,tasks,users}` — o único importador
externo conhecido é `routes/clerk/_authenticated/user-management.tsx`, que sai em U2. A
regeneração do `routeTree.gen.ts` acontece em U5 (após U2 também remover rotas).
**Patterns to follow:** estrutura de `features/vagas` como referência do que é código de
domínio legítimo (fica).
**Test scenarios:** `Test expectation: none — remoção de código de demo sem comportamento
de domínio. A verificação é build/knip/test verdes em U5.`
**Verification:** `grep -r "features/(apps|chats|tasks|users)" app/src` retorna só as
próprias referências já removidas (vazio após o rm).

---

### U2. Remover a integração Clerk

**Goal:** Zerar o Clerk do projeto.
**Requirements:** R2.
**Dependencies:** U1 (a rota `clerk/user-management` importava `features/users`, já removido).
**Files (remover):**
- `app/src/routes/clerk/**` (subtree inteira: `route.tsx`, `(auth)/**`, `_authenticated/**`)
- `app/src/assets/clerk-logo.tsx`
- `app/src/assets/clerk-full-logo.tsx`
**Files (editar):**
- `app/package.json` — remover a dependência `@clerk/react`.
- `app/src/context/search-provider.test.tsx` — remover asserts/refs a itens Clerk do menu.
- `app/src/components/layout/data/sidebar-data.ts` — remover o import `ClerkLogo` e o grupo
  "Secured by Clerk" (o restante da reescrita da sidebar é U4; aqui só o que desacopla Clerk).

**Approach:** `git rm -r app/src/routes/clerk app/src/assets/clerk-*.tsx`. Remover
`@clerk/react` do `package.json` e rodar `pnpm install` para atualizar o lockfile. Ajustar
o teste do search-provider para não referenciar rotas Clerk. `knip` (U5) confirma que não
sobrou export/dep morto do Clerk.
**Patterns to follow:** —
**Test scenarios:**
- `search-provider.test.tsx`: o command menu **não** lista nenhum item Clerk; os itens de
  domínio (Vagas, Dashboard) continuam presentes e navegáveis. Ajustar as asserções
  existentes para o novo conjunto de rotas.
**Verification:** `grep -ri "clerk" app/src` retorna vazio; `grep clerk app/package.json`
vazio; `pnpm knip` não acusa `@clerk/react` como dep não usada.

---

### U3. Remover `netlify.toml` e resíduos de deploy/meta do template

**Goal:** Tirar artefatos de deploy/branding-meta que não são nossos.
**Requirements:** R3, R4 (parcial: identidade em arquivos de meta).
**Dependencies:** nenhuma.
**Files (remover):**
- `app/netlify.toml`
**Files (avaliar/editar) — decisão do designer, ver Q3:**
- `app/CHANGELOG.md`, `app/LICENSE` — herdados do template; remover ou substituir.
- `app/.github/**` (PR/ISSUE templates, CONTRIBUTING) — o CI do projeto vive na **raiz**
  (`.github/workflows/ci.yml`); os templates dentro de `app/` são do template shadcn.

**Approach:** `git rm app/netlify.toml`. Para CHANGELOG/LICENSE/.github do `app/`,
confirmar com o designer (Q3) antes de remover — pode haver decisão de licenciamento.
**Patterns to follow:** —
**Test scenarios:** `Test expectation: none — arquivos de meta/deploy, sem efeito em
runtime.`
**Verification:** `test -f app/netlify.toml` falha (arquivo ausente); build inalterado.

---

### U4. Reescrever identidade funcional e navegação em pt-BR

**Goal:** App se identifica como SESI e a navegação reflete só o que existe, em pt-BR.
**Requirements:** R4, R5.
**Dependencies:** U1, U2 (a sidebar só pode listar rotas que ainda existem).
**Files (editar):**
- `app/package.json` — `name: "shadcn-admin"` → `"sesi-processo-seletivo"`.
- `app/index.html` — `<title>`, `<meta name="title">`, OG/Twitter (`og:title`,
  `og:description`, `og:url`, `twitter:*`), removendo URLs `shadcn-admin.netlify.app` e a
  descrição "Admin Dashboard UI built with Shadcn and Vite."
- `app/public/**` — trocar/remover imagens de preview do template (`images/shadcn-admin.png`,
  avatar `avatars/shadcn.jpg`) referenciadas por `index.html`/`sidebar-data`. Favicon: usar
  neutro/placeholder (design de marca é loop futuro).
- `app/src/components/layout/data/sidebar-data.ts` — reescrever:
  - `user`: mock SESI genérico (não `satnaing`).
  - `teams`: **header de marca SESI único** (sem Acme) — ver Q2.
  - `navGroups`: pt-BR, apenas **Vagas** e **Dashboard** no grupo principal; **Configurações**
    (Perfil, Aparência) mantido; grupos **Auth**, **Errors**, **Help Center** removidos do
    menu (as rotas Auth/Errors permanecem por KTD2/KTD3).
- `app/README.md` (do `app/`) — reescrever para descrever o app SESI e como rodar (alinhado
  ao CLAUDE.md), sem copy do template.

**Approach:** Editar `sidebar-data.ts` preservando o **tipo** `SidebarData` e os
componentes de sidebar (não mexer na engine, só nos dados). Textos em pt-BR canônico do
CONTEXT.md ("Vagas", não "Job Openings"). Confirmar Q2 (tratamento do header) e Q1
(itens de nav de scaffold) antes de finalizar o array.
**Patterns to follow:** o próprio `sidebar-data.ts` (formato do `SidebarData`); termos do
[`CONTEXT.md`](../../CONTEXT.md).
**Test scenarios:**
- Se houver teste de render da sidebar/command-menu, atualizá-lo para o novo conjunto
  (Vagas, Dashboard, Configurações) e ausência de itens em inglês/Clerk.
- `Test expectation:` majoritariamente config/dados; a rede de segurança é `test`+`build`.
**Verification:** app roda (`pnpm dev`), menu mostra só itens pt-BR existentes, título da
aba é "SESI — Processo Seletivo"; nenhuma string "Shadcn Admin"/"Acme"/"Clerk" em `app/src`.

---

### U5. Regenerar rotas e fechar o portão de qualidade

**Goal:** Árvore de rotas coerente e suíte verde.
**Requirements:** R6.
**Dependencies:** U1, U2, U3, U4.
**Files:**
- `app/src/routeTree.gen.ts` (regenerado pelo gerador — não editar à mão).
**Approach:** Rodar o gerador (via `pnpm dev` uma vez ou o comando de generate do plugin)
para reconstruir `routeTree.gen.ts` sem as rotas removidas. Depois, a sequência de portão:
`pnpm lint && pnpm format:check && pnpm knip && pnpm test && pnpm build`. Corrigir o que
aparecer (imports órfãos, exports mortos que o `knip` apontar, snapshots de teste).
**Execution note:** verificação smoke-first — o valor deste loop é "nada quebrou e ficou
limpo"; rode o app e a suíte, não invente testes unitários novos para código removido.
**Patterns to follow:** o pipeline descrito no CLAUDE.md ("Antes de abrir PR").
**Test scenarios:**
- Suíte existente de Vagas (`schema.test.ts`, `sla.test.ts`) continua verde.
- `search-provider.test.tsx` verde com o novo conjunto de rotas.
- `pnpm knip` sem exports/deps mortos.
**Verification:** os cinco comandos do portão saem com código 0; `git status` mostra o
`routeTree.gen.ts` atualizado; navegação manual em `/vagas` e `/` funciona.

---

## System-Wide Impact

- **`main.tsx`:** mantém referências a `/sign-in` (401) e `/500` — preservadas por
  KTD2/KTD3. Nenhuma alteração necessária.
- **Lockfile:** `pnpm-lock.yaml` muda ao remover `@clerk/react` (U2).
- **CI (raiz):** roda o mesmo portão sobre `app/`; deve permanecer verde.
- **Deploy futuro (Loop 5):** remover `netlify.toml` agora evita ambiguidade de alvo quando
  a Vercel entrar.

---

## Risks & Dependencies

- **Risco: `routeTree.gen.ts` dessincronizado.** Mitigação: KTD1 — regenerar, não editar; U5
  valida com `build`.
- **Risco: `knip` acusar exports órfãos após remoções** (ex.: componentes só usados pelas
  features demo). Mitigação: U5 trata os apontamentos do `knip` como parte do portão.
- **Risco: quebrar o fluxo de erro do `main.tsx`** ao remover auth/erros. Mitigação:
  KTD2/KTD3 mantêm essas rotas; só saem do menu.
- **Dependência de decisão (designer):** Q1, Q2, Q3 abaixo afetam o array final da sidebar e
  a remoção de CHANGELOG/LICENSE. Confirmar antes de `/ce-work` fechar U3/U4.

---

## Open Questions (decisões de design — precisam do seu OK)

- **Q1 — Itens de scaffold no menu.** Default proposto: manter **Configurações** (Perfil,
  Aparência); **remover** do menu os grupos Auth, Errors e Help Center (rotas Auth/Errors
  permanecem, só ocultas). Confirmar ou ajustar o conjunto.
- **Q2 — Header da sidebar.** Default proposto: **marca SESI única**, substituindo o
  switcher de times (Shadcn Admin/Acme). Papel do usuário fica no role-switcher já planejado.
- **Q3 — Meta do `app/` (CHANGELOG, LICENSE, `.github/` templates).** Default proposto:
  remover CHANGELOG e templates `.github` herdados do template; **decidir LICENSE com você**
  (licenciamento é sua chamada). `netlify.toml` sai de qualquer forma (R3).

---

## Definition of Done

- R1–R6 satisfeitos; Q1–Q3 confirmados pelo designer e refletidos em U3/U4.
- Zero ocorrências de `Shadcn Admin`, `Acme`, `Clerk`, `netlify` em `app/src` (e nas metas
  editadas).
- `pnpm lint && pnpm format:check && pnpm knip && pnpm test && pnpm build` verdes.
- Navegação lateral 100% pt-BR, listando apenas rotas existentes.
- Um commit por unidade (U1–U5), PR aberto com CI verde.
- Aprendizado do loop registrado via `/ce-compound` em `docs/solutions/`.

---

## Sources & Research

- [`CLAUDE.md`](../../CLAUDE.md) — contrato do repo, portão de qualidade, estado atual.
- [`CONTEXT.md`](../../CONTEXT.md) — termos canônicos pt-BR para a navegação.
- Reconhecimento de código (esta sessão): mapeamento de acoplamento das features demo,
  Clerk (fora dos providers), pontos de branding e o fato de `routeTree.gen.ts` ser gerado.
