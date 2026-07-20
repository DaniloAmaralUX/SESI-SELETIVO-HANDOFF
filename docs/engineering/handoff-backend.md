# Handoff — Desenvolvedor(a) Backend

Guia de quem vai construir a API real do Sistema de Gestão de Vagas do SESI. O front-end deste
repositório é um **protótipo de alta fidelidade com dados mockados** — mas as regras de negócio nele
implementadas são **fiéis ao domínio e servem de especificação executável**: o backend deve replicar
exatamente esses comportamentos. Este documento consolida o que o servidor precisa garantir.

> Par deste guia: [handoff-dev.md](handoff-dev.md) (visão front/porta de persistência) e
> [contrato-api.md](contrato-api.md) (endpoints, query params, formato de erro). Leia os três.

## Comece por aqui (ordem sugerida)

1. [`CONTEXT.md`](../../CONTEXT.md) — linguagem ubíqua. Use **sempre** os termos canônicos.
2. [`docs/product/PRD-sistema-rh-gestao-vagas.md`](../product/PRD-sistema-rh-gestao-vagas.md) — os 25 RFs e as decisões B1–B8.
3. ADRs [0001](../adr/0001-status-e-acao-como-eixos-independentes.md) (dois eixos) e [0002](../adr/0002-sla-dias-uteis-com-motor-de-feriados-proprio.md) (SLA/feriados).
4. [contrato-api.md](contrato-api.md) — o contrato HTTP que o front espera.
5. Este documento — regras que o **servidor** garante.

## O protótipo é a especificação executável

Não redesenhe o modelo nem as regras: **porte-os**. Fontes no código (todas testadas no Vitest):

| Arquivo | O que especifica |
|---|---|
| [`app/src/features/vagas/data/schema.ts`](../../app/src/features/vagas/data/schema.ts) | Entidade **Vaga** (todos os campos), enums canônicos, schemas de criar/editar (Zod). **Fonte única do modelo de dados.** |
| [`app/src/features/vagas/data/transicoes.ts`](../../app/src/features/vagas/data/transicoes.ts) | Matriz de transições de Status (B1) — como **dado**, não hard-code. |
| [`app/src/features/vagas/data/vagas-store.ts`](../../app/src/features/vagas/data/vagas-store.ts) | Semântica exata das 5 operações de escrita (criar, atualizar, mudarStatus, mudarAcao, importar): o que o servidor gera, carimba e registra em cada uma. |
| [`app/src/features/vagas/lib/sla.ts`](../../app/src/features/vagas/lib/sla.ts) | Motor de SLA em dias úteis (portar para o servidor — ver §SLA). |
| [`app/src/features/vagas/lib/feriados.ts`](../../app/src/features/vagas/lib/feriados.ts) | Motor de feriados próprio: nacionais (fixos + móveis por Páscoa/Butcher), estadual PE e municipais por Unidade. |
| [`app/src/features/vagas/lib/papel.ts`](../../app/src/features/vagas/lib/papel.ts) | Papéis e a regra B7 (dados sensíveis só para Admin). |

## Modelo de dados — Vaga

O shape canônico é o `vagaSchema` — **toda resposta da API deve passar em `vagaSchema.parse`**
(datas em ISO 8601). Grupos de campos:

- **Identificação**: `id` (gerado), `chamado` (nº do chamado), `codigoVaga`, `origemDoCadastro` (`manual`/`importacao`), `fonteDosDados`.
- **Classificação**: `unidade`, `area`, `cargo`, `nivel` (I–VI), `funcao`, `tipoContrato` (`determinado`/`indeterminado`/`estagiario`/`intermitente`), `pcd`, `motivoContratacao`.
- **Pessoas (dados, não usuários)**: `gestorSolicitante`, `recrutadora`.
- **Dois eixos**: `status` (6 valores) + `acaoAtual` (10 etapas ordenadas) + `dataAcao`.
- **Fluxo gestor/jurídico**: `dataEncaminhamentoGestor`, `dataRetornoGestor`, `chamadoJuridico`, `aberturaChamadoJuridico`, `recebimentoParecerJuridico`.
- **Cronograma (RF13)**: `inscricoesInicio/Fim`, `dataProva`, `dataEntrevistaRh`, `dataEntrevistaGestor`, `dataHabilitacao`, `divulgacaoResultado`, `previsaoAdmissao`, `dataAdmissao`.
- 🔒 **Resultado/candidato (LGPD, B7)**: `candidatoSelecionado`, `genero`, `candidatoInterno` — sensíveis; `gerouBanco`, `qtdCandidatosAplicados` — agregados, não sensíveis.
- **Encerramento/reabertura**: `dataEncerramento`, `motivoCancelamento`, `reaberturaDe` (reabertura = **novo registro** vinculado ao anterior — semântica final pendente, ver §Decisões em aberto).
- **Auditoria (RF17)**: `criadoEm/Por`, `atualizadoEm/Por` — carimbados pelo servidor.
- **Histórico (RF16)**: trilha **imutável** de eventos `{ em, por, tipo, descricao }`, com `tipo` ∈ `criacao | edicao | mudanca-status | mudanca-acao | importacao`. Recomendação de modelagem: tabela própria append-only, nunca editável por endpoint.

**Não há campo de SLA persistido** — ver §SLA.

## Endpoints e erros

Estão especificados em [contrato-api.md](contrato-api.md): `GET/POST /vagas`, `GET/PATCH /vagas/:id`,
`POST /vagas/:id/status`, `POST /vagas/:id/acao`, `POST /vagas/importar`, com query params de
listagem/paginação, envelope `{ data, page, pageSize, total }` e formato de erro
`{ error: { code, message, details } }` (400/401/403/404/409/500).

## Regras que o servidor DEVE garantir (nunca confiar no front)

1. **Dois eixos independentes** (ADR 0001): `status` e `acaoAtual` nunca se condicionam mutuamente.
   Mudar um não altera o outro.
2. **Matriz de transições B1**: transição de `status` fora da matriz → `409`. A matriz é **dado
   configurável** (o PRD marca "a confirmar"), não constante de código:
   `aberta → suspensa|congelada|cancelada|finalizada`; `suspensa|congelada → aberta|cancelada`;
   `finalizada|cancelada → arquivada`; `arquivada` é terminal.
3. **Motivo obrigatório ao cancelar**: `status = cancelada` sem `motivoCancelamento` → `400`.
4. **Sem exclusão física** (PRD §8): não existe `DELETE`. Encerramento = cancelar/finalizar (o
   servidor carimba `dataEncerramento`) e depois arquivar.
5. **SLA nunca persistido** — derivado por consulta (ver §SLA). Gravar um valor na criação o faria
   envelhecer (RF10).
6. **Histórico e auditoria só no servidor**: cada operação de escrita anexa seu evento (ver a
   semântica exata em `vagas-store.ts`) e carimba `atualizadoEm/Por`. O campo `por` (quem fez) **sai
   do token** — o front não envia. Em `atualizar`, registre **apenas os campos que de fato mudaram**
   na descrição do evento; patch sem mudança real não gera evento.
7. **LGPD (B6/B7)**: `candidatoSelecionado`, `genero` e `candidatoInterno` só retornam para papel
   `admin` — filtre **na serialização** (não confie no front para mascarar) e aplique a mesma regra
   em exportações/relatórios. `Gênero` é dado sensível: exige finalidade declarada.
8. **Unicidade** de `chamado` e `codigoVaga`. Na importação (RF21), dedupe por nº do chamado e/ou
   código: responda criadas × ignoradas; duplicidade em criação manual → `409`.
9. **Semântica da criação** (B5, replicar `criar()` do store): servidor gera `id`; exige `chamado`
   e/ou `codigoVaga` (gera código no padrão `VG-AAAA-NNN` se vazio); `dataRecebimento` vazia recebe
   fallback `dataAbertura`; a vaga **nasce** `status = aberta`, `acaoAtual = solicitacao-recebida`,
   `dataAcao = dataAbertura`; `origemDoCadastro` conforme o canal; auditoria + evento `criacao`.
10. **Mudança de status que encerra** (`cancelada`/`finalizada`): servidor carimba
    `dataEncerramento = agora`.

## SLA — especificação de cálculo (portar `lib/sla.ts`)

- **Meta: 20 dias úteis**, e o SLA pertence **só à Vaga** — *Tempo do gestor* e *Tempo do jurídico*
  são medições, nunca "SLA de X".
- **Dia útil** exclui fins de semana, feriados nacionais (inclusive móveis), Data Magna de PE
  (06/03, todas as Unidades) e o feriado **municipal da Unidade** (as Unidades são municípios).
- **Contagem** `diasUteis(inicio, fim)`: dias úteis **após** `inicio` até `fim`, inclusive
  (mesmo dia = 0).
- **Fim da contagem** (RF10): `divulgacaoResultado` (congela lá) → senão `dataEncerramento` →
  senão, se pausada (`status` = suspensa/congelada), a última `dataAcao` → senão **hoje**.
- **Severidade**: `estourado` ≥ 20 d.ú. · `atencao` ≥ 15 · `ok` < 15.
- **Tempo do gestor**: `dataEncaminhamentoGestor → dataRetornoGestor`, em dias **úteis**.
  **Tempo do jurídico**: `aberturaChamadoJuridico → recebimentoParecerJuridico`, em dias
  **corridos**.
- ⚠️ **Melhoria esperada no backend**: a pausa em Suspensa/Congelada usa a `dataAcao` como
  aproximação no protótipo. Como o histórico registra as mudanças de status com timestamp, o
  servidor pode (e deve) **descontar os períodos exatos de pausa**.
- ⚠️ A tabela de **feriados municipais** em `lib/feriados.ts` é dado de protótipo — **validar com o
  RH/TI antes do go-live** e mantê-la como configuração, não código.

## Autenticação e RBAC (decisão B3 — em aberto, envolve você)

O provedor de auth **não está decidido** (reunião de arquitetura com o TI). O que o front já espera:

- `Authorization: Bearer <token>`; `401` → redireciona para login; `403` → papel sem permissão.
- **Papéis com login**: `recrutadora`, `gestora-rh`, `admin` (*Gestor solicitante* e *Jurídico* são
  dados da Vaga, não usuários). Única regra de papel já fixada: **B7 — só `admin` vê/exporta dados
  sensíveis de candidato**. O de-para fino de permissões por operação é decisão pendente de B3.
- O `por` da auditoria/histórico deve derivar do usuário autenticado no servidor.

## Decisões em aberto (não assumir sem confirmar)

| Tema | Estado |
|---|---|
| **B3** — backend, auth, RBAC fino | Reunião de arquitetura com o TI; hoje auth mockada no front. |
| **Reabertura** | `reaberturaDe` já modela "novo registro vinculado", mas a semântica de produto está pendente. |
| **Feriados municipais** | Tabela de protótipo; validar datas com RH antes do go-live. |
| **N1/N2** — vocabulário real ↔ canônico | Enums são dado remapeável; validação com RH pendente. |
| **Baseline de SLA** | Ver [duvidas-respostas-propostas.md](../product/duvidas-respostas-propostas.md). |

## Critérios de aceite do backend

- [ ] Toda resposta de Vaga passa em `vagaSchema.parse` no front (datas ISO 8601).
- [ ] Transição fora da matriz B1 → `409`; cancelar sem motivo → `400`.
- [ ] Nenhuma rota de exclusão física; encerrar carimba `dataEncerramento`.
- [ ] Histórico append-only gravado exclusivamente pelo servidor, com `por` derivado do token.
- [ ] Campos sensíveis (B7) filtrados na serialização e nas exportações para papéis ≠ `admin`.
- [ ] SLA derivado por consulta (nunca coluna persistida), com pausa exata por histórico de status.
- [ ] Importação com dedupe por chamado/código e resposta criadas × ignoradas.
- [ ] Unicidade de `chamado` e `codigoVaga`.

## Como validar contra o front

1. `cd app && pnpm install && pnpm dev` roda o protótipo com mock (sem backend).
2. A integração real acontece pela **porta de persistência**: reescrever
   `app/src/features/vagas/data/vagas-store.ts` com TanStack Query apontando para sua API
   (passo a passo em [handoff-dev.md](handoff-dev.md) §"Como trocar o mock") e definir
   `VITE_API_BASE_URL` (ver `app/.env.example`). Nenhuma tela muda.
3. Os testes de domínio (`pnpm test`) cobrem SLA, feriados, transições e schema — úteis como
   referência cruzada dos seus testes de servidor.

## Sequência de implementação sugerida

1. **Leitura**: modelagem do banco + `GET /vagas` (filtros/paginação) + `GET /vagas/:id`.
2. **Auth (B3)** + escrita: `POST /vagas`, `PATCH /vagas/:id`, `/status` (matriz B1), `/acao` —
   com auditoria e histórico desde o primeiro endpoint de escrita.
3. **SLA no servidor** (motor de dias úteis + feriados configuráveis + pausa exata) e relatórios/
   exportações com filtro LGPD.
4. **Importação** (RF21) com dedupe e relatório criadas × ignoradas.
