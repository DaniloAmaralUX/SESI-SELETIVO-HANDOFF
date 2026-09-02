# Contrato de API esperado — Gestão de Vagas

> Contrato que o front-end espera do backend quando o mock for substituído
> (ver [handoff-dev.md](handoff-dev.md)). O shape canônico de `Vaga` é o
> `vagaSchema` em `app/src/features/vagas/data/schema.ts` — **toda resposta
> deve passar em `vagaSchema.parse`** (datas em ISO 8601; o schema coage).

## Base

- Base URL: `VITE_API_BASE_URL` (ver `app/.env.example`).
- Autenticação: `Authorization: Bearer <token>` (B3 — provedor a definir).
- Datas: ISO 8601 (`2026-07-20T00:00:00Z`). O front converte com `z.coerce.date()`.

## Endpoints

| Método | Rota | Corresponde a (porta de persistência) |
|---|---|---|
| `GET` | `/vagas` | listagem — filtros/paginação abaixo |
| `GET` | `/vagas/:id` | `useVaga(id)` |
| `POST` | `/vagas` | `criar(input, por)` — body = `vagaCreateSchema`; servidor gera `id`, `codigoVaga` (se vazio), auditoria e evento `criacao`. **Nasce em `rascunho`** (ver Ciclo de vida) |
| `PATCH` | `/vagas/:id` | `atualizar(id, patch, por)` — patch parcial; servidor carimba `atualizadoEm/Por` e anexa evento `edicao` |
| `POST` | `/vagas/:id/status` | `mudarStatus(id, novo, por, motivo?)` — body `{ status, motivo? }`; servidor valida a matriz B1 e anexa evento |
| `POST` | `/vagas/:id/acao` | `mudarAcao(id, acao, dataAcao, por)` — body `{ acaoAtual, dataAcao }` |
| `POST` | `/vagas/:id/observacoes` | `adicionarObservacao(id, etapa, texto, por)` — body `{ etapa, texto }`; **append-only** (sem `PATCH`/`DELETE`), anexa evento `observacao` |
| `POST` | `/vagas/importar` | `importar(novas, por)` — body `{ vagas: [...], fonteDosDados }`; servidor aplica dedupe por chamado/código (RF21) e responde criadas × ignoradas |

O campo `por` (quem fez) sai do token no servidor — o front **não** envia.
O `historico` (RF16/RF17) é gravado **exclusivamente** pelo servidor; o front
só o exibe.

## Ciclo de vida do Status

> Revisado com a cliente em set/2026 — o status `rascunho` não existia na versão anterior.

O enum tem **7** valores, e `rascunho` é o primeiro:

```
rascunho · aberta · suspensa · congelada · cancelada · finalizada · arquivada
```

Três regras que o servidor precisa implementar — nenhuma é derivável do shape:

1. **A vaga nasce em `rascunho`.** `POST /vagas` cria com `status: 'rascunho'`
   e `acaoAtual: 'solicitacao-recebida'`, **não** em `aberta`.
2. **O relógio do SLA só começa em `rascunho → aberta`.** Nessa transição — e
   **somente** nela — o servidor **re-carimba** `dataAbertura` e `dataAcao` com o
   instante da transição. A data digitada durante o rascunho é substituída de
   propósito: o processo passa a existir ali.
3. **`rascunho → cancelada` NÃO re-carimba nada.** Cancelar um rascunho preserva
   a `dataAbertura` que a recrutadora digitou — é o dado histórico dela. Aplicar
   a regra 2 aqui é o erro fácil de cometer; há teste cobrindo em
   `data/vagas-store.test.ts`.

Enquanto a vaga está em `rascunho`, `slaDaVaga` devolve `0` e ela fica fora de
todos os agregados de SLA do painel (só `aberta`, `suspensa` e `congelada`
contam como ativas).

## Observações por etapa

Coleção **imutável e append-only** dentro da Vaga (`observacoesEtapas`), exposta
no detalhe, no histórico e na exportação CSV:

```json
{
  "etapa": "entrevistas",
  "texto": "Gestor pediu prioridade no preenchimento.",
  "em": "2026-09-02T13:40:00Z",
  "por": "Recrutadora"
}
```

- `texto`: 1 a **500** caracteres (`OBSERVACAO_MAX_CHARS` no schema). **Validar no
  servidor** — o limite do campo na interface é conveniência, não garantia.
- `etapa`: qualquer uma das 10 ações, não só a atual.
- Sem edição e sem remoção: não existe `PATCH`/`DELETE` para observação. Cada
  registro também gera um evento `observacao` no histórico.
- Vaga `arquivada` não recebe novas observações (as existentes são preservadas).

## Outros campos da revisão

| Campo | Tipo | Observação |
|---|---|---|
| `reaberturaDe` | `string?` | `id` da vaga de origem quando esta é uma reabertura. A interface e o CSV exibem o **`codigoVaga` da origem**, então o backend precisa permitir resolver esse id (expandir no payload ou garantir que a origem seja consultável). |
| `observacoesEtapas` | `ObservacaoEtapa[]?` | Ver acima. |

O enum de tipos de evento do histórico também cresceu:
`criacao · edicao · mudanca-status · mudanca-acao · importacao · observacao`.

## Listagem `GET /vagas`

Query params (mesmos nomes da URL da lista):

```
?filter=texto&status[]=aberta&acao[]=inscricoes&unidade[]=SESI%20Recife
&area[]=TI&recrutadora[]=...&gestor[]=...&aberturaDe=2026-01-01&aberturaAte=2026-06-30
&page=1&pageSize=10&sort=dataAbertura&order=desc
```

Resposta paginada:

```json
{
  "data": [ { /* Vaga */ } ],
  "page": 1,
  "pageSize": 10,
  "total": 63
}
```

## Formato de erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "motivoCancelamento é obrigatório quando status = cancelada",
    "details": [{ "path": "motivoCancelamento", "message": "..." }]
  }
}
```

- `400` validação · `401` sem/expirado token · `403` papel sem permissão ·
  `404` vaga inexistente · `409` transição de status fora da matriz B1 ou
  duplicidade de chamado/código · `500` erro interno.
- O tratamento global já existe em `app/src/lib/handle-server-error.ts` e nos
  handlers do QueryClient (`app/src/main.tsx`): 401 → login, 500 → `/500`.

## Regras que o servidor deve garantir (não confiar no front)

1. **Sem exclusão física** — só cancelar/arquivar (PRD §8).
2. **Matriz de transições B1** (`data/transicoes.ts`) — fonte da verdade
   compartilhada; retornar `409` para transição inválida.
3. **SLA nunca persistido** — derivado por consulta (motor de dias úteis +
   feriados por Unidade, ADR 0002). O front replica o cálculo em
   `lib/sla-vaga.ts` para exibição imediata. Vale para as duas medições
   auxiliares: **tempo do gestor** e **tempo do jurídico**, ambas em **dias
   úteis** (o jurídico passou de corridos para úteis na revisão de set/2026 —
   ver nota no ADR 0002).
4. **LGPD (B6/B7)** — campos sensíveis de candidato (`candidatoSelecionado`,
   `genero`, `candidatoInterno`) só retornam para papel `admin`; exportações
   idem.
5. **Unicidade** de nº do chamado e código da vaga (validar na importação).
6. **Ciclo de vida do Rascunho** — as três regras da seção acima, em especial o
   re-carimbo restrito a `rascunho → aberta`.
7. **Observações são append-only** e limitadas a 500 caracteres, validados no
   servidor.
8. **Exportação de planilha** — se o servidor passar a gerar CSV/XLSX, precisa
   neutralizar injeção de fórmula: célula iniciada por `=`, `+`, `-`, `@`, TAB
   ou CR é executada como fórmula por Excel/Sheets, e as observações são texto
   livre do usuário. O front resolve em `features/vagas/lib/csv.ts` (prefixo de
   aspa simples, preservando valores numéricos).

## Variáveis de ambiente do front

| Variável | Uso |
|---|---|
| `VITE_API_BASE_URL` | Base da API. Vazio = modo protótipo (mock em memória). |
