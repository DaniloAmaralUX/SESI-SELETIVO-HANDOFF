# NOTICE — código de terceiros

Este repositório incorpora código de terceiros. O arquivo lista a origem e a
situação de licença de cada bloco, para que a equipe que assume o projeto e o
jurídico saibam o que está embarcado no entregável.

> **Pendências para o jurídico** estão marcadas com ⚠️. Elas não bloqueiam o
> funcionamento do sistema, mas devem ser resolvidas antes da entrega formal.

---

## 1. Template base — shadcn-admin

- **Origem:** https://github.com/satnaing/shadcn-admin
- **Autoria:** Sat Naing
- **Licença:** MIT (Copyright © 2024 Sat Naing) — texto integral em
  [`licenses/shadcn-admin-MIT.txt`](licenses/shadcn-admin-MIT.txt)
- **O que veio daqui:** a estrutura inicial do app (layout, rotas, sidebar,
  telas de auth e de erro, boa parte de `src/components/`).

A MIT exige que o aviso de copyright seja preservado na redistribuição — por
isso o texto está em `licenses/`. O aviso **não** significa que Sat Naing detém
direitos sobre o sistema de gestão de vagas construído por cima dele.

## 2. Registry Iconiq

- **Origem:** https://iconiqui.com (payloads em `https://iconiqui.com/r/<nome>.json`)
- **Autoria:** Edwin Vakayil
- **Licença:** ⚠️ **a confirmar.** Os 119 arquivos baixados para
  `app/src/components/iconiq/` não trazem cabeçalho de licença, autoria ou
  copyright, e o payload do registry não inclui esse metadado. Confirmar os
  termos com a fonte antes da entrega formal.
- **O que veio daqui:** material sob demanda (ver seção "Material sob demanda").
  Atualmente **em uso**: `r-tabs`, `theme-toggle`, `scroll-progress`, `spinner`.

## 3. React Bits (via Dev Studio UI)

- **Origem:** https://github.com/DavidHDev/react-bits (revisão `c7109dccb42e`)
- **Autoria:** David Haz
- **Licença:** ⚠️ **MIT + Commons Clause.** O Commons Clause é uma restrição
  adicionada sobre a MIT que **remove o direito de vender** o software — onde
  "vender" inclui cobrar por um produto ou serviço cujo valor derive
  substancialmente desse código. O cabeçalho de licença está preservado nos dois
  arquivos.
- **O que veio daqui:** `app/src/components/react-bits/`
  - `LiquidEther.tsx` — fluido WebGL do painel de login
  - `BlurText.tsx` — animação da manchete do painel de login
- **Por que importa aqui:** o sistema é entregue no contexto de um contrato de
  prestação de serviço. Os dois componentes são **puramente decorativos** e
  estão isolados na tela de login — se o jurídico entender que o Commons Clause
  conflita com os termos do contrato, dá para removê-los sem tocar em nenhuma
  regra de negócio: apagar `src/components/react-bits/`, remover a dependência
  `three` e simplificar `features/auth/components/auth-visual-panel.tsx` para
  usar só o `FundoEstatico`, que já existe como fallback de produção.

## 4. Dependências de npm

As dependências declaradas em `app/package.json` seguem as licenças dos
respectivos pacotes (majoritariamente MIT). Para o inventário completo:

```bash
npx license-checker --production --summary
```

---

## Material sob demanda — regra antes de ligar um componente

`app/src/components/iconiq/` e `app/src/components/react-bits/` são **material
de registry**, não código do projeto. Estão fora do ESLint, do Knip e do
`include` do `tsconfig.app.json` — ou seja, **o gate de qualidade não enxerga
essas pastas**. Antes de ligar qualquer componente novo:

1. **Conferir chamadas de rede.** Alguns componentes buscam dados em serviços de
   terceiros. Conhecidos hoje: `contribution-graph.tsx`
   (`github-contributions-api.jogruber.de`) e os componentes que montam favicon
   via `google.com/s2/favicons` e `icons.duckduckgo.com`. Num sistema que trata
   dados de candidatos sob LGPD, isso precisa de decisão consciente — não deixe
   passar por descuido.
2. **Conferir `process.env`.** Não existe `process` no browser com Vite. Todo o
   material já foi saneado para `import.meta.env.MODE`, mas componentes baixados
   depois podem voltar a trazer o padrão do Next.js.
3. **Conferir cores hard-coded.** O projeto usa OKLCH e tokens; hexadecimais
   soltos furam o tema (claro/escuro) e a identidade SESI.
4. **Rodar o gate depois de ligar:** `pnpm lint && pnpm build && pnpm test`.
