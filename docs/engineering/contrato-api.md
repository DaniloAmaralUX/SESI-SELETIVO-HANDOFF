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
| `POST` | `/vagas` | `criar(input, por)` — body = `vagaCreateSchema`; servidor gera `id`, `codigoVaga` (se vazio), auditoria e evento `criacao` |
| `PATCH` | `/vagas/:id` | `atualizar(id, patch, por)` — patch parcial; servidor carimba `atualizadoEm/Por` e anexa evento `edicao` |
| `POST` | `/vagas/:id/status` | `mudarStatus(id, novo, por, motivo?)` — body `{ status, motivo? }`; servidor valida a matriz B1 e anexa evento |
| `POST` | `/vagas/:id/acao` | `mudarAcao(id, acao, dataAcao, por)` — body `{ acaoAtual, dataAcao }` |
| `POST` | `/vagas/importar` | `importar(novas, por)` — body `{ vagas: [...], fonteDosDados }`; servidor aplica dedupe por chamado/código (RF21) e responde criadas × ignoradas |

O campo `por` (quem fez) sai do token no servidor — o front **não** envia.
O `historico` (RF16/RF17) é gravado **exclusivamente** pelo servidor; o front
só o exibe.

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
   `lib/sla-vaga.ts` para exibição imediata.
4. **LGPD (B6/B7)** — campos sensíveis de candidato (`candidatoSelecionado`,
   `genero`, `candidatoInterno`) só retornam para papel `admin`; exportações
   idem.
5. **Unicidade** de nº do chamado e código da vaga (validar na importação).

## Variáveis de ambiente do front

| Variável | Uso |
|---|---|
| `VITE_API_BASE_URL` | Base da API. Vazio = modo protótipo (mock em memória). |
