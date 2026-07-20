---
titulo: Experiência do Usuário (UX) — Princípios e Diretrizes
tipo: ux-guidelines
status: proposta
data: 2026-07-20
fontes:
  - docs/product/personas.md
  - docs/product/fluxos-do-usuario.md
  - docs/design/arquitetura-informacao.md
  - docs/design/design-system.md
---

# Experiência do Usuário — Princípios e Diretrizes

> Complementa a [Arquitetura da Informação](arquitetura-informacao.md) (estrutura) e o
> [Design System](design-system.md) (aparência) com o **comportamento**: princípios de experiência,
> padrões de interação, feedback, acessibilidade e conteúdo. As checklists operacionais estão em
> [checklist-ux.md](checklist-ux.md).

---

## 1. Princípios de experiência

1. **O prazo é o protagonista.** A pergunta que a interface responde primeiro é *"o que vence hoje?"*.
   O SLA aparece antes de qualquer outro dado secundário — na lista, no detalhe, no dashboard.
2. **Velocidade para a operação repetitiva.** Carla usa o sistema dezenas de vezes ao dia: ações
   frequentes em 1–2 cliques (atualizar ação, registrar data), ⌘K para pular direto a uma vaga.
3. **Progressivo, nunca monolítico.** Criar pede 7 campos; os ~50 restantes se revelam por tabs e
   grupos de afinidade. Nenhuma tela exige rolagem infinita de formulário.
4. **Nada se perde, tudo se explica.** Toda mutação gera feedback imediato (toast) e rastro
   (histórico). Ações destrutivas ou irreversíveis pedem confirmação com consequência explícita.
5. **A interface impede o erro antes de acusá-lo.** Transições de status inválidas ficam
   desabilitadas com explicação (tooltip), em vez de falhar depois do clique.
6. **Confiança nos dados.** Datas sempre com formato explícito (dd/mm/aaaa), contagens de SLA com
   unidade ("14 de 20 dias úteis"), duplicados de importação nunca sobrescritos silenciosamente.

## 2. Padrões de interação

| Situação | Padrão | Onde |
|---|---|---|
| Criação de vaga | Página dedicada (foco total) | `/vagas/nova` |
| Edição rápida de um grupo | Sheet lateral a partir do Detalhe | Detalhe, cada tab |
| Mudança de status | Diálogo com matriz de transições B1; Cancelada exige motivo | Detalhe/lista |
| Ação em massa | Seleção por checkbox + barra de bulk-actions | Lista |
| Processo multi-etapa | Wizard com Stepper, avanço bloqueado por validação | Importação |
| Confirmação destrutiva | AlertDialog com consequência explícita ("preserva histórico") | Arquivar, exportar sensível |
| Busca global | Command palette (⌘K) por código, cargo, chamado | Header |

## 3. Feedback e estados

- **Sucesso:** toast (Sonner) curto, com ação de desfazer quando aplicável.
- **Erro de validação:** inline no campo, mensagem específica; foco vai ao primeiro campo inválido.
- **Erro de sistema:** Alert no contexto + rota `/erros/*` para falhas de página inteira.
- **Carregamento:** Skeleton com o formato do conteúdo final (linhas de tabela, cards) — nunca
  spinner de página inteira em navegações internas.
- **Vazio:** cada superfície tem empty state com CTA (ver fluxos, seção "Estados vazios").
- Os quatro estados (vazio/carregando/erro/sucesso) são **parte da definição de pronto** de toda tela.

## 4. Acessibilidade (metas)

- **WCAG 2.2 AA** como alvo do protótipo e do handoff.
- Status e SLA **nunca só por cor**: ícone + rótulo textual acompanham a cor de sinalização.
- Navegação completa por teclado (tabelas, tabs, diálogos — Radix cobre o grosso; validar composição).
- Foco visível em todo controle (`ring` dos primitivos); `aria-current="step"` nos steppers;
  `role="progressbar"` + `aria-valuenow` no SLAIndicator.
- Textos de apoio para leitores de tela em controles só-ícone.
- Respeitar `prefers-reduced-motion`; conteúdo legível com zoom de 200%.
- Contraste mínimo 4.5:1 em texto — atenção ao âmbar `#F2A900` sobre fundo claro (usar como fundo
  de badge com texto escuro, não como cor de texto).

## 5. Responsividade

- **Desktop-first** (o RH trabalha em estação), mas o Detalhe e a Lista devem degradar até tablet:
  colunas secundárias da tabela colapsam via view-options; trilho lateral do Detalhe vira seção.
- Inputs móveis com fonte ≥ 16px (evita zoom de foco no iOS) — já garantido pelo baseline.
- Meta concreta de suporte mobile é **questão aberta** do PRD (#7) — validar se o RH usa em campo.

## 6. Conteúdo e microcopy (pt-BR)

- Vocabulário canônico do [CONTEXT.md](../../CONTEXT.md): "Status", "Ação atual", "SLA" (só da vaga),
  "Tempo do gestor/jurídico" (medições), "Recrutador/a", "Gestora de RH", "Arquivada" (nunca "inativa").
- Botões com verbo no infinitivo ("Criar vaga", "Importar planilha"); títulos sem gerúndio.
- Mensagens de erro dizem **o que houve + como resolver** ("Layout inválido: coluna 'Cargo' ausente.
  Baixe o modelo e tente de novo."), nunca códigos crus.
- Datas por extenso onde há ambiguidade; contagens sempre com unidade ("dias úteis" vs "dias corridos").

## 7. Privacidade na experiência (LGPD — RF26)

- Campos sensíveis de candidato agrupados numa única tab 🔒, renderizada apenas para papéis autorizados.
- Exportações que incluem campo sensível exigem confirmação explícita e ficam na auditoria.
- Nenhum dado sensível em URL, título de página ou toast.

## 8. Métricas de UX (para os testes do protótipo)

| Métrica | Alvo | Fluxo |
|---|---|---|
| Tempo para criar vaga | < 2 min | F1 |
| Identificar vagas estouradas na lista | < 10 s, sem cliques | F2 |
| Sucesso na importação com duplicados (sem sobrescrita indevida) | 100% | F6 |
| Erros de transição de status | 0 (opções inválidas indisponíveis) | F3 |
| SUS (System Usability Scale) pós-teste | ≥ 75 | geral |
