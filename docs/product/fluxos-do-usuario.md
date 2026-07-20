---
titulo: Fluxos do Usuário — Sistema de RH / Gestão de Vagas
tipo: user-flows
status: proposta (validar nos testes de usabilidade do protótipo)
data: 2026-07-20
fontes:
  - docs/product/PRD-sistema-rh-gestao-vagas.md (RF01–RF26, decisões B1–B8)
  - docs/product/personas.md
  - docs/design/arquitetura-informacao.md (§4 sitemap, §9 criar/editar, §11 importação)
---

# Fluxos do Usuário

> Os fluxos ponta-a-ponta do sistema, por persona. Cada fluxo referencia as rotas da IA (§4/§5) e os
> RFs do PRD que o cobrem. Notação: `[tela]`, `(decisão)`, `⚠ estado de exceção`.

---

## F1 — Criar uma vaga (Carla · RH) — Fase 1

**Gatilho:** chega uma solicitação de contratação (chamado do gestor solicitante).
**RFs:** RF01, RF06 · **Decisão B5** (criação mínima).

```
[Lista de vagas /] → botão "Nova vaga"
  → [/vagas/nova] preenche os 7 campos mínimos:
      nº do chamado e/ou código · unidade/área · gestor solicitante ·
      cargo · tipo de contrato · recrutador · data de abertura
  → salvar
      ⚠ campo obrigatório faltando → validação inline (Zod), foco no campo
  → vaga nasce com Status = Aberta, Ação = "Solicitação recebida", SLA inicia
  → toast de sucesso → redireciona ao [Detalhe /vagas/:id]
```

**Critério de sucesso:** criação em < 2 min; nenhum campo além do mínimo bloqueia.

---

## F2 — Acompanhar e agir no dia a dia (Carla · RH) — Fase 1/2

**Gatilho:** início do expediente. **RFs:** RF03, RF04, RF07, RF08.

```
[Lista de vagas /] (tela inicial)
  → painel de instrumentos: N no prazo · N em atenção · N estouradas
  → ordena/filtra por SLA ou por "minhas vagas" (Recrutador = eu)
  → (qual vaga precisa de ação?) → clica na linha
  → [Detalhe /vagas/:id]
      → cabeçalho: StatusBadge · StageStepper (ação atual) · SLAIndicator
      → atualiza a ação atual OU registra data no Cronograma (tab correspondente)
      → toast de confirmação; histórico registra quem/quando (RF16/RF17)
```

**⚠ Exceções:** vaga pausada (Suspensa/Congelada) mostra SLA pausado; sem permissão → `/erros/403`.

---

## F3 — Mudar o Status da vaga (Carla ou Denise) — Fase 1

**Gatilho:** decisão de suspender, congelar, cancelar, finalizar ou arquivar.
**RFs:** RF05, RF07 · **Decisão B1** (matriz de transições).

```
[Detalhe /vagas/:id] → ação "Alterar status"
  → (transição válida? matriz B1: Aberta → {Suspensa, Congelada, Cancelada, Finalizada};
     Suspensa/Congelada → {Aberta, Cancelada}; Finalizada/Cancelada → Arquivada)
      ⚠ transição inválida → opção desabilitada com tooltip explicando
  → Cancelada exige motivo (campo obrigatório no diálogo)
  → confirmação (AlertDialog) → Status muda, SLA pausa/encerra conforme B1
  → evento entra no Histórico
```

**Invariante:** nenhuma exclusão física — arquivar preserva tudo.

---

## F4 — Registrar interação com gestor e jurídico (Carla · RH) — Fase 2

**Gatilho:** vaga encaminhada ao gestor solicitante ou chamado aberto no jurídico.
**RFs:** RF11, RF12.

```
[Detalhe] → tab "Processo" ou "Jurídico"
  → registra data de encaminhamento ao gestor → timer do gestor inicia (dias úteis)
  → registra data de retorno → timer congela
  (jurídico: análogo, com nº do chamado; contagem em dias corridos)
```

**Invariante:** são **medições**, não SLAs — a UI nunca usa o rótulo "SLA do gestor/jurídico".

---

## F5 — Registrar resultado e fechar a vaga (Carla · RH) — Fase 2

**Gatilho:** processo seletivo concluído. **RFs:** RF09, RF10, RF13, RF14, RF15.

```
[Detalhe] → tab "Cronograma": preenche etapas finais (habilitação, divulgação)
  → registrar "Divulgação do resultado" → SLA congela no valor final
      → (≤ 20 dias úteis?) → "fechada no prazo" sim/não
  → tab "Resultado": candidato selecionado, previsão de admissão
  → tab "Candidato" 🔒: gênero, interno, banco, nº de aplicados (campos LGPD, visíveis por papel)
  → alterar Status → Finalizada (F3) → depois Arquivada
```

---

## F6 — Importar planilha legada (Carla · RH) — Fase 3

**Gatilho:** carga inicial ou atualização em lote. **RFs:** RF18–RF22 · **Decisão B8**.

```
[/vagas/importar] — wizard de 4 passos
  1. Upload .xlsx → valida tipo/tamanho/layout
       ⚠ layout inválido → Alert com erros por coluna; não avança
  2. Mapeamento → casa colunas da planilha ↔ campos do sistema
  3. Prévia → tabela marca duplicados (chave: nº chamado + código)
       (sobrescrever?) → por padrão NÃO; opt-in explícito por linha (checkbox)
  4. Confirmação → AlertDialog + Progress → novos entram, duplicados só com opt-in
  → resumo final: N importadas, N ignoradas, N sobrescritas
```

**Segurança:** conteúdo de célula neutralizado contra CSV/formula injection.

---

## F7 — Monitorar indicadores e exportar relatório (Denise · Gestora de RH) — Fase 4

**Gatilho:** reunião de resultados ou cobrança da direção. **RFs:** RF23–RF25, RF26.

```
[/indicadores] → KPIs (abertas, % no prazo, tempo médio) + gráficos (funil por etapa,
  SLA por unidade, volume por período) → filtro de período
  → (precisa do detalhe?) → [/relatorios]
      → filtra por área/gestor/recrutador/status/período → exportar
          ⚠ dados sensíveis de candidato → mascarados conforme papel;
            exportação com campo sensível exige confirmação (AlertDialog)
```

---

## F8 — Administração (Marcos · Administrador) — Fases 0–2

```
[/admin/usuarios]    → cria usuário, atribui papel (RBAC)
[/admin/calendarios] → cadastra feriados por unidade → motor de SLA usa na próxima contagem
[/admin/auditoria]   → consulta trilha (quem/quando/o quê), diff por evento
```

---

## F9 — Entrar no sistema (todos) — Fase 0

```
[/entrar] → credenciais → (ok?) → [Lista de vagas /]
  ⚠ senha esquecida → [/esqueci-senha] → [/otp]
  ⚠ sem papel para a rota → /erros/403
```

> Auth real está em aberto (decisão B3) — no protótipo, papel simulado via `auth-store`.

---

## Estados vazios e de primeira vez

- **Primeiro uso (0 vagas):** Empty state com dois CTAs — "Criar primeira vaga" (F1) e
  "Importar planilha" (F6).
- **Filtro sem resultados:** empty específico com ação "limpar filtros".
- **Dashboard sem dados:** placeholder orientando a cadastrar vagas primeiro.

## Pendências (herdadas do PRD)

- **Reabertura** de vaga (novo registro vs. reuso; SLA reinicia?) — fluxo não desenhado até decisão.
- Fluxo de **notificações** (sino do header) — sem requisito definido; não desenhar antes de priorizar.
