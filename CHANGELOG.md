# Changelog

Mudanças relevantes do **SESI · Processo Seletivo — Gestão de Vagas**.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/);
versionamento [SemVer](https://semver.org/lang/pt-BR/). Enquanto o sistema estiver
pré-1.0, mudanças incompatíveis podem sair em versões `0.x` — a estabilidade de
contrato passa a valer a partir da `1.0.0`, junto com o backend real.

> **Nota de versão.** O `package.json` carregava `2.2.1`, herdado do template
> [`shadcn-admin`](https://github.com/satnaing/shadcn-admin). Nunca houve uma v1 nem
> uma v2 *deste* sistema. A numeração foi corrigida para `0.1.0` na preparação do
> handoff, para não sugerir um histórico de releases que não existe.

---

## [Não publicado]

Trabalho em curso na árvore de trabalho, ainda sem tag. Agrupa a segunda rodada de
design, a adoção do preset visual e a preparação do repositório para o handoff.

### Adicionado

- Status **Rascunho** como primeiro valor do enum: a vaga nasce em preparação e o
  SLA só passa a contar quando ela entra em andamento (`Rascunho → Aberta`).
- Aba **Observações** por etapa no detalhe da vaga: registros imutáveis de até 500
  caracteres, cada um vira evento no histórico e sai na exportação CSV.
- Campo **Código da vaga de origem** (somente leitura) nos formulários, no detalhe
  e no CSV, para rastrear reaberturas.
- Governança de repositório: `CHANGELOG.md`, `CODEOWNERS`, template de pull request,
  `.editorconfig` e `.nvmrc`.
- [`NOTICE.md`](NOTICE.md) com a proveniência e a situação de licença de todo o
  código de terceiros embarcado, mais `licenses/` com os avisos preservados.

### Alterado

- **Tempo do jurídico** passou a ser medido em **dias úteis** (antes, corridos) —
  documentação e ADR 0002 revisados.
- Painel da Gestora de RH redesenhado em bento assimétrico, com hierarquia explícita:
  saúde do SLA como ponto focal, fila de atenção, composição por status, pipeline por
  etapa e ranking por unidade.
- Identidade visual do SESI restaurada por cima do preset `shadcn`, em camada própria
  no fim de `app/src/styles/index.css` (a ordem das camadas está documentada no
  [guia do dev](docs/engineering/handoff-dev.md)).
- **Ranking por unidade passou a contar apenas vagas ativas** e o card foi renomeado
  para "Vagas ativas por unidade". Era a única célula do painel operacional que
  misturava volume histórico com carga de trabalho atual.
- Versão do pnpm e do Node passaram a ter fonte única (`packageManager` e `.nvmrc`),
  consumida também pelo CI — antes o CI fixava `pnpm 10` enquanto o lockfile era
  gerado com a 11.
- Mensagens de erro da importação de CSV reescritas para orientar a solução em vez
  de apenas nomear o campo inválido.

### Corrigido

- **Injeção de fórmula na exportação CSV.** Células iniciadas por `=`, `+`, `-`, `@`,
  TAB ou CR eram interpretadas como fórmula por Excel/LibreOffice/Sheets. Com o texto
  livre das observações indo para a planilha, isso virou superfície real de ataque.
  Valores numéricos seguem numéricos.
- `Rascunho → Cancelada` re-carimbava `dataAbertura` e `dataAcao`, apagando a data
  digitada no cadastro. Só `Rascunho → Aberta` abre o processo de fato.
- A manchete do login animava mesmo com `prefers-reduced-motion: reduce` — o fluido
  WebGL já respeitava a preferência, o texto não.
- Limite de 500 caracteres da observação passou a ser aplicado na porta de
  persistência, e não apenas no campo da interface.
- Contador de caracteres deixou de ser anunciado a cada tecla por leitores de tela;
  agora só fala ao se aproximar do limite.

### Removido

- `process.env` em 15 pontos do material de registry não utilizado — não existe
  `process` no browser com Vite, e a pasta está fora do lint e do type-check.
- Artefatos herdados do template sem função aqui: `cz.yaml` (configuração de
  commitizen sem a dependência instalada), permissão de build do `@clerk/shared`
  (Clerk não faz parte do projeto) e o stub vazio `lib/registry-theme.ts`.

### Segurança

- Correção da injeção de fórmula no CSV (ver **Corrigido**).
- `app/package.json` marcado como `private`, impedindo publicação acidental no npm.

---

## [0.1.0] — 2026-07-20

Baseline do repositório de handoff: recorte limpo do protótipo, sem o histórico de
construção.

### Adicionado

- Cobertura 1:1 dos requisitos **RF01–RF25** do PRD.
- Modelo de domínio com os **dois eixos independentes** (Status × Ação atual, ADR 0001)
  e **SLA derivado** de 20 dias úteis com motor de feriados próprio (ADR 0002).
- Histórico e trilha de auditoria por vaga; mascaramento de campos sensíveis de
  candidato por papel (LGPD).
- Importação e exportação de planilha CSV.
- Documentação de handoff: guia do dev, guia do backend, contrato de API, arquitetura
  de módulos, ADRs, PRD, personas e fluxos.

### Notas

- Autenticação e persistência são **mock**. O que o backend real precisa cumprir está
  em [`docs/engineering/handoff-backend.md`](docs/engineering/handoff-backend.md) e no
  [contrato de API](docs/engineering/contrato-api.md).

[Não publicado]: https://github.com/DaniloAmaralUX/SESI-SELETIVO-HANDOFF/compare/main...HEAD
