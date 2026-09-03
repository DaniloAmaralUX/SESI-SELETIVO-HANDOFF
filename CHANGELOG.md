# Changelog

Mudanças relevantes do **SESI · Processo Seletivo — Gestão de Vagas** (versão de
referência visual, identidade shadcn-admin padrão).

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/);
versionamento [SemVer](https://semver.org/lang/pt-BR/). Enquanto o sistema estiver
pré-1.0, mudanças incompatíveis podem sair em versões `0.x` — a estabilidade de
contrato passa a valer a partir da `1.0.0`, junto com o backend real.

---

## [Não publicado]

### Adicionado
- Status **Rascunho**: a vaga nasce em Rascunho e o SLA só começa a contar
  quando o status muda para Aberta (o store re-carimba a data de abertura
  nesse instante).
- Aba **Observações** por etapa no detalhe da vaga: registros imutáveis de
  até 500 caracteres, cada um vira um evento no histórico e uma coluna na
  exportação CSV.
- Campo **Código da vaga de origem**, somente leitura, exibido quando a vaga
  é uma reabertura (formulários, detalhe e CSV).
- Confirmação com consequência explícita ao Finalizar, Suspender ou
  Congelar uma vaga; transições de status inválidas para o estado atual
  aparecem desabilitadas com dica explicando o motivo, nunca escondidas.
- Ações rápidas por linha na lista de vagas (ver detalhes, editar, registrar
  ação, mudar status) sem precisar abrir o detalhe.
- Versão em cartões para a lista de vagas em telas estreitas, com o prazo
  (SLA) em destaque e a vaga mais crítica no topo.
- Filtros da lista de vagas em painel deslizante nas telas estreitas; o
  período de abertura filtrado agora fica salvo no endereço da página.
- Aviso de alterações não salvas ao sair de um formulário de vaga
  preenchido, seja pelo botão Cancelar, pelo menu ou fechando a aba.
- Botão de importar planilha diretamente na lista de vagas.
- Acesso ao sistema simplificado para apenas e-mail (sem senha), adequado
  ao estágio de protótipo — a autenticação real fica para a integração
  com o backend.

### Corrigido
- Tempo do jurídico agora medido em dias úteis, com o rótulo correspondente
  no detalhe da vaga.
- Colunas da lista de vagas não colapsam mais em telas de até 768px.
- Indicador de prazo (SLA) mostra o excedente de forma clara ("20+8 dias
  úteis" em vez de uma fração inválida) e fica neutro em vagas já encerradas.
- Obrigatoriedade condicional entre "Nº do chamado" e "Código da vaga"
  agora é visível no formulário (pelo menos um dos dois é exigido).
- Traduções pendentes para português em telas de erro, menu de comando,
  ordenação de colunas, seletor de tema e diálogo de saída.
- Dados de exemplo recalibrados para refletir uma operação recente e
  plausível nos relatórios (percentuais de prazo cumprido não ficam mais
  zerados).

> **Nota de versão.** O `package.json` carrega `2.2.1`, herdado do template
> [`shadcn-admin`](https://github.com/satnaing/shadcn-admin). Nunca houve uma
> v1 nem uma v2 *deste* sistema; a numeração será corrigida para `0.1.0` numa
> próxima limpeza de handoff.
