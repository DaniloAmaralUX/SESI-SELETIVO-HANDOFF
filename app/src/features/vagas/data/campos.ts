import { type AcaoVaga, type StatusVaga, type Vaga } from './schema'

// Rótulos pt-BR dos dois eixos — versão sem ícones (as opções com ícone para
// UI vivem em data.tsx).
export const STATUS_LABELS: Record<StatusVaga, string> = {
  aberta: 'Aberta',
  suspensa: 'Suspensa',
  congelada: 'Congelada',
  cancelada: 'Cancelada',
  finalizada: 'Finalizada',
  arquivada: 'Arquivada',
}

export const ACAO_LABELS: Record<AcaoVaga, string> = {
  'solicitacao-recebida': 'Solicitação recebida',
  'encaminhada-ao-gestor': 'Encaminhada ao gestor',
  'chamado-juridico': 'Chamado jurídico',
  inscricoes: 'Inscrições',
  prova: 'Prova',
  'entrevista-rh': 'Entrevista RH',
  'entrevista-gestor': 'Entrevista gestor',
  habilitacao: 'Habilitação',
  'divulgacao-do-resultado': 'Divulgação do resultado',
  admissao: 'Admissão',
}

// Rótulos pt-BR dos campos da Vaga — fonte única para telas e para a
// descrição dos eventos de histórico ("Atualizou: Cargo, Nível").
const CAMPO_LABELS: Partial<Record<keyof Vaga, string>> = {
  chamado: 'Nº do chamado',
  codigoVaga: 'Código da vaga',
  dataRecebimento: 'Data de recebimento',
  gestorSolicitante: 'Gestor solicitante',
  unidade: 'Unidade',
  area: 'Área',
  tipoContrato: 'Tipo de contrato',
  motivoContratacao: 'Motivo da contratação',
  cargo: 'Cargo',
  nivel: 'Nível',
  funcao: 'Função',
  pcd: 'PcD',
  recrutadora: 'Recrutadora',
  dataAbertura: 'Data de abertura',
  observacoes: 'Observações',
  dataEncaminhamentoGestor: 'Encaminhada ao gestor',
  dataRetornoGestor: 'Retorno do gestor',
  chamadoJuridico: 'Chamado jurídico',
  aberturaChamadoJuridico: 'Abertura do chamado jurídico',
  recebimentoParecerJuridico: 'Recebimento do parecer jurídico',
  inscricoesInicio: 'Início das inscrições',
  inscricoesFim: 'Fim das inscrições',
  dataProva: 'Data da prova',
  dataEntrevistaRh: 'Entrevista RH',
  dataEntrevistaGestor: 'Entrevista com gestor',
  dataHabilitacao: 'Habilitação',
  divulgacaoResultado: 'Divulgação do resultado',
  previsaoAdmissao: 'Previsão de admissão',
  dataAdmissao: 'Admissão',
  candidatoSelecionado: 'Candidato selecionado',
  genero: 'Gênero',
  candidatoInterno: 'Candidato interno',
  gerouBanco: 'Gerou banco',
  qtdCandidatosAplicados: 'Candidatos aplicados',
}

export function labelDoCampo(campo: keyof Vaga): string {
  return CAMPO_LABELS[campo] ?? campo
}
