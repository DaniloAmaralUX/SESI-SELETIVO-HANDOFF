import { fakerPT_BR as faker } from '@faker-js/faker'
import { STATUS_LABELS } from './campos'
import {
  ACOES_VAGA,
  vagaSchema,
  type EventoHistorico,
  type StatusVaga,
  type Vaga,
} from './schema'

// Seed fixa p/ dados determinísticos entre execuções
faker.seed(2026)

function somaDias(data: Date, dias: number): Date {
  const nova = new Date(data)
  nova.setDate(nova.getDate() + dias)
  return nova
}

function repete(status: StatusVaga, vezes: number): StatusVaga[] {
  return Array.from({ length: vezes }, () => status)
}

const UNIDADES = [
  'SESI Recife',
  'SESI Paulista',
  'SESI Caruaru',
  'SESI Petrolina',
  'SESI Cabo de Santo Agostinho',
  'SESI Goiana',
]

const CARGOS_POR_AREA: Record<string, string[]> = {
  Educação: [
    'Professor de Educação Básica',
    'Auxiliar de Sala',
    'Coordenador Pedagógico',
    'Analista Pedagógico',
    'Orientador Educacional',
    'Secretário Escolar',
  ],
  Saúde: [
    'Técnico de Enfermagem do Trabalho',
    'Enfermeiro do Trabalho',
    'Médico do Trabalho',
    'Fisioterapeuta',
    'Auxiliar de Saúde Bucal',
    'Cirurgião-Dentista',
  ],
  Administrativo: [
    'Assistente Administrativo',
    'Analista Administrativo',
    'Auxiliar Administrativo',
    'Recepcionista',
  ],
  Comercial: [
    'Consultor de Relacionamento',
    'Analista Comercial',
    'Assistente Comercial',
  ],
  TI: [
    'Analista de Sistemas',
    'Técnico de Suporte',
    'Desenvolvedor Full Stack',
    'Analista de Infraestrutura',
  ],
  Jurídico: ['Advogado', 'Assistente Jurídico'],
  Financeiro: ['Analista Financeiro', 'Assistente de Contas a Pagar'],
}

const AREAS = Object.keys(CARGOS_POR_AREA)

const NIVEIS = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const

const DISCIPLINAS = [
  'Matemática',
  'Língua Portuguesa',
  'Ciências',
  'História',
  'Geografia',
  'Educação Física',
  'Robótica Educacional',
]

const MOTIVOS_CONTRATACAO = [
  'Substituição de colaborador',
  'Aumento de quadro',
  'Nova turma / expansão',
  'Cobertura de licença maternidade',
  'Novo contrato com cliente',
]

const OBSERVACOES_SUSPENSA = [
  'Processo suspenso a pedido do gestor solicitante — aguardando redefinição do perfil.',
  'Suspensa até conclusão da revisão orçamentária da Unidade.',
  'Suspensa aguardando aprovação da diretoria regional.',
]

const OBSERVACOES_CONGELADA = [
  'Vaga congelada por contenção de despesas no semestre.',
  'Congelada por determinação da superintendência — sem previsão de retomada.',
  'Congelada até assinatura do novo contrato com o cliente.',
]

const MOTIVOS_CANCELAMENTO = [
  'Cancelada a pedido do gestor solicitante.',
  'Contenção orçamentária da Unidade.',
  'Reestruturação da área — posição extinta.',
  'Preenchida por movimentação interna, sem processo seletivo.',
  'Contrato com o cliente não renovado.',
]

// Equipes fixas p/ dados coerentes (mesmas pessoas em várias vagas)
const RECRUTADORAS = Array.from({ length: 5 }, () =>
  faker.person.fullName({ sex: 'female' })
)

const GESTORES = Array.from({ length: 12 }, () => faker.person.fullName())

// Distribuição fixa de status: 57 base + 3 reaberturas (abertas) = 60 vagas
const DISTRIBUICAO_STATUS: StatusVaga[] = [
  ...repete('aberta', 23),
  ...repete('finalizada', 15),
  ...repete('cancelada', 6),
  ...repete('suspensa', 5),
  ...repete('congelada', 4),
  ...repete('arquivada', 4),
]

// 18 vagas base (30% das 60) vêm de importação de planilha
const ORIGENS_IMPORTACAO = faker.helpers.shuffle(
  DISTRIBUICAO_STATUS.map((_, indice) => indice < 18)
)

// Nºs de chamado únicos e determinísticos
const NUMEROS_CHAMADO = faker.helpers.uniqueArray(
  () => faker.number.int({ min: 400000, max: 499999 }),
  DISTRIBUICAO_STATUS.length + 3
)

function gerarVaga(indice: number, status: StatusVaga, origem?: Vaga): Vaga {
  const terminal = status === 'finalizada' || status === 'arquivada'

  let idxAcao: number
  if (origem) {
    // Reabertura recém-cadastrada: ainda nas etapas iniciais
    idxAcao = faker.number.int({ min: 0, max: 2 })
  } else if (terminal) {
    idxAcao = ACOES_VAGA.length - 1 // admissao
  } else if (status === 'cancelada') {
    idxAcao = faker.number.int({ min: 0, max: 5 })
  } else if (status === 'suspensa' || status === 'congelada') {
    idxAcao = faker.number.int({ min: 1, max: 7 })
  } else {
    idxAcao = faker.number.int({ min: 0, max: 9 })
  }
  const acaoAtual = ACOES_VAGA[idxAcao]

  // Janela de recebimento encolhe conforme a vaga avança — mantém todas as
  // datas dentro de jan–jul/2026
  const fimJanela =
    idxAcao >= 8
      ? '2026-03-31'
      : idxAcao >= 4
        ? '2026-04-15'
        : status === 'cancelada'
          ? '2026-04-30'
          : '2026-06-01'
  const dataRecebimento = origem?.dataEncerramento
    ? somaDias(origem.dataEncerramento, faker.number.int({ min: 3, max: 12 }))
    : faker.date.between({ from: '2026-01-05', to: fimJanela })

  let cursor = somaDias(dataRecebimento, faker.number.int({ min: 0, max: 5 }))
  const dataAbertura = cursor
  const avanca = (min: number, max: number): Date => {
    cursor = somaDias(cursor, faker.number.int({ min, max }))
    return cursor
  }

  // Datas só das etapas já percorridas — coerentes com a ação atual
  const dataEncaminhamentoGestor = idxAcao >= 1 ? avanca(1, 3) : undefined
  const dataRetornoGestor = idxAcao >= 2 ? avanca(1, 7) : undefined
  const chamadoJuridico =
    idxAcao >= 2
      ? `JUR-${faker.number.int({ min: 10000, max: 99999 })}`
      : undefined
  const aberturaChamadoJuridico = idxAcao >= 2 ? avanca(0, 2) : undefined
  const recebimentoParecerJuridico = idxAcao >= 3 ? avanca(2, 10) : undefined
  // Cronograma seletivo (RF13) — datas das etapas já percorridas
  const inscricoesInicio = idxAcao >= 3 ? avanca(1, 3) : undefined
  const inscricoesFim = idxAcao >= 3 ? avanca(5, 12) : undefined
  const dataProva = idxAcao >= 4 ? avanca(3, 7) : undefined
  const dataEntrevistaRh = idxAcao >= 5 ? avanca(2, 5) : undefined
  const dataEntrevistaGestor = idxAcao >= 6 ? avanca(2, 5) : undefined
  const dataHabilitacao = idxAcao >= 7 ? avanca(2, 6) : undefined
  const divulgacaoResultado = idxAcao >= 8 ? avanca(1, 4) : undefined
  const previsaoAdmissao =
    idxAcao >= 9
      ? somaDias(cursor, faker.number.int({ min: 5, max: 20 }))
      : undefined
  const dataAdmissao =
    terminal && previsaoAdmissao ? previsaoAdmissao : undefined
  const dataAcao = cursor

  const encerrada = terminal || status === 'cancelada'
  const dataEncerramento = encerrada
    ? somaDias(cursor, faker.number.int({ min: 0, max: 5 }))
    : undefined

  // 🔒 Dados sensíveis de candidato só em vagas concluídas
  const candidatoSelecionado = terminal ? faker.person.fullName() : undefined
  const genero = terminal
    ? faker.helpers.weightedArrayElement([
        { value: 'feminino' as const, weight: 5 },
        { value: 'masculino' as const, weight: 4 },
        { value: 'nao-informado' as const, weight: 1 },
      ])
    : undefined
  const candidatoInterno = terminal
    ? faker.datatype.boolean({ probability: 0.25 })
    : undefined

  const area = origem?.area ?? faker.helpers.arrayElement(AREAS)
  const unidade = origem?.unidade ?? faker.helpers.arrayElement(UNIDADES)
  const tipoContrato =
    origem?.tipoContrato ??
    faker.helpers.weightedArrayElement([
      { value: 'indeterminado' as const, weight: 5 },
      { value: 'determinado' as const, weight: 3 },
      { value: 'estagiario' as const, weight: 1 },
      { value: 'intermitente' as const, weight: 1 },
    ])
  const cargo = origem
    ? origem.cargo
    : tipoContrato === 'estagiario'
      ? `Estagiário de ${area}`
      : faker.helpers.arrayElement(CARGOS_POR_AREA[area])
  const funcao = origem
    ? origem.funcao
    : cargo === 'Professor de Educação Básica'
      ? faker.helpers.arrayElement(DISCIPLINAS)
      : undefined
  const nivel = origem
    ? origem.nivel
    : tipoContrato === 'estagiario'
      ? undefined
      : faker.helpers.maybe(() => faker.helpers.arrayElement(NIVEIS), {
          probability: 0.6,
        })

  // Reabertura é sempre recadastrada manualmente
  const importada = origem ? false : ORIGENS_IMPORTACAO[indice]

  const observacoes =
    status === 'suspensa'
      ? faker.helpers.arrayElement(OBSERVACOES_SUSPENSA)
      : status === 'congelada'
        ? faker.helpers.arrayElement(OBSERVACOES_CONGELADA)
        : undefined

  // SLA não é gerado aqui: é derivado em runtime por lib/sla-vaga.ts (RF10).

  const recrutadora = faker.helpers.arrayElement(RECRUTADORAS)

  // Auditoria + histórico mínimo coerente (RF16/RF17): criação + as mudanças
  // de status que explicam a situação atual (Arquivada passa por Finalizada,
  // respeitando a matriz B1)
  const historico: EventoHistorico[] = [
    {
      em: dataAbertura,
      por: importada ? 'Importação de planilha' : recrutadora,
      tipo: importada ? 'importacao' : 'criacao',
      descricao: importada
        ? 'Importada de CONTROLE_DE_VAGAS_2025.xlsx'
        : 'Vaga cadastrada no sistema',
    },
  ]
  const caminhoStatus: StatusVaga[] =
    status === 'arquivada' ? ['finalizada', 'arquivada'] : [status]
  let statusAnterior: StatusVaga = 'aberta'
  for (const destino of caminhoStatus) {
    if (destino === 'aberta') break
    historico.push({
      em: dataEncerramento ?? dataAcao,
      por: recrutadora,
      tipo: 'mudanca-status',
      descricao:
        `Status: ${STATUS_LABELS[statusAnterior]} → ${STATUS_LABELS[destino]}` +
        (destino === 'cancelada' ? ' — motivo registrado' : ''),
    })
    statusAnterior = destino
  }

  return {
    id: `VAGA-${String(indice + 1).padStart(4, '0')}`,
    chamado: `CH-${NUMEROS_CHAMADO[indice]}`,
    codigoVaga: `VG-2026-${String(indice + 1).padStart(3, '0')}`,
    dataRecebimento,
    origemDoCadastro: importada ? 'importacao' : 'manual',
    fonteDosDados: importada ? 'CONTROLE_DE_VAGAS_2025.xlsx' : undefined,
    gestorSolicitante:
      origem?.gestorSolicitante ?? faker.helpers.arrayElement(GESTORES),
    unidade,
    area,
    tipoContrato,
    motivoContratacao: faker.helpers.maybe(
      () => faker.helpers.arrayElement(MOTIVOS_CONTRATACAO),
      { probability: 0.8 }
    ),
    cargo,
    nivel,
    funcao,
    pcd: faker.datatype.boolean({ probability: 0.1 }),
    recrutadora,
    dataAbertura,
    status,
    acaoAtual,
    dataAcao,
    observacoes,
    dataEncaminhamentoGestor,
    dataRetornoGestor,
    chamadoJuridico,
    aberturaChamadoJuridico,
    recebimentoParecerJuridico,
    inscricoesInicio,
    inscricoesFim,
    dataProva,
    dataEntrevistaRh,
    dataEntrevistaGestor,
    dataHabilitacao,
    divulgacaoResultado,
    previsaoAdmissao,
    dataAdmissao,
    candidatoSelecionado,
    genero,
    candidatoInterno,
    gerouBanco: encerrada
      ? faker.datatype.boolean({ probability: 0.4 })
      : undefined,
    qtdCandidatosAplicados:
      idxAcao >= 3 ? faker.number.int({ min: 8, max: 180 }) : undefined,
    reaberturaDe: origem?.id,
    dataEncerramento,
    motivoCancelamento:
      status === 'cancelada'
        ? faker.helpers.arrayElement(MOTIVOS_CANCELAMENTO)
        : undefined,
    criadoEm: dataAbertura,
    criadoPor: importada ? 'Importação de planilha' : recrutadora,
    historico,
  }
}

const base = faker.helpers
  .shuffle(DISTRIBUICAO_STATUS)
  .map((status, indice) => gerarVaga(indice, status))

// Reabertura = NOVO registro vinculado (reaberturaDe) — 3 vagas abertas
// nascem da reabertura das canceladas encerradas mais cedo
const origensReabertura = base
  .filter((vaga) => vaga.status === 'cancelada')
  .sort(
    (a, b) =>
      (a.dataEncerramento?.getTime() ?? 0) -
      (b.dataEncerramento?.getTime() ?? 0)
  )
  .slice(0, 3)

const reaberturas = origensReabertura.map((origem, indice) =>
  gerarVaga(base.length + indice, 'aberta', origem)
)

// Valida a coerência de todo o mock contra o schema (falha alto no build)
export const vagas: Vaga[] = vagaSchema.array().parse([...base, ...reaberturas])
