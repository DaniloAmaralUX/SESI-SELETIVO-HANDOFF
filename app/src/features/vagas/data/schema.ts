import { z } from 'zod'

// Status = situação da Vaga. Eixo independente da Ação atual (ADR 0001).
export const STATUS_VAGA = [
  'aberta',
  'suspensa',
  'congelada',
  'cancelada',
  'finalizada',
  'arquivada',
] as const

export const statusVagaSchema = z.enum(STATUS_VAGA)
export type StatusVaga = z.infer<typeof statusVagaSchema>

// Ação atual = etapa do processo seletivo. Lista ORDENADA (ADR 0001).
export const ACOES_VAGA = [
  'solicitacao-recebida',
  'encaminhada-ao-gestor',
  'chamado-juridico',
  'inscricoes',
  'prova',
  'entrevista-rh',
  'entrevista-gestor',
  'habilitacao',
  'divulgacao-do-resultado',
  'admissao',
] as const

export const acaoVagaSchema = z.enum(ACOES_VAGA)
export type AcaoVaga = z.infer<typeof acaoVagaSchema>

// Atores com login. Gestor solicitante e Jurídico são dados, não usuários.
export const PAPEIS = ['recrutadora', 'gestora-rh', 'admin'] as const
export type Papel = (typeof PAPEIS)[number]

// Evento do histórico da Vaga (RF16/RF17): quem fez o quê e quando. A trilha é
// gravada pela porta de persistência — nunca editada pela UI.
const TIPOS_EVENTO = [
  'criacao',
  'edicao',
  'mudanca-status',
  'mudanca-acao',
  'importacao',
] as const

export const eventoHistoricoSchema = z.object({
  em: z.coerce.date(),
  por: z.string(),
  tipo: z.enum(TIPOS_EVENTO),
  descricao: z.string(),
})

export type EventoHistorico = z.infer<typeof eventoHistoricoSchema>

// Objeto base — a fonte única de campos. O `vagaSchema` (com refine) e os
// schemas de criar/editar derivam daqui via pick/omit.
const vagaObjectSchema = z.object({
  id: z.string(),
  // Nº do chamado — identificador de exibição da Vaga
  chamado: z.string(),
  codigoVaga: z.string(),
  dataRecebimento: z.coerce.date(),
  origemDoCadastro: z.enum(['manual', 'importacao']),
  // Só para vagas importadas (ex.: planilha de origem)
  fonteDosDados: z.string().optional(),
  gestorSolicitante: z.string(),
  unidade: z.string(),
  area: z.string(),
  tipoContrato: z.enum([
    'determinado',
    'indeterminado',
    'estagiario',
    'intermitente',
  ]),
  motivoContratacao: z.string().optional(),
  cargo: z.string(),
  nivel: z.enum(['I', 'II', 'III', 'IV', 'V', 'VI']).optional(),
  funcao: z.string().optional(),
  pcd: z.boolean(),
  recrutadora: z.string(),
  dataAbertura: z.coerce.date(),
  status: statusVagaSchema,
  acaoAtual: acaoVagaSchema,
  dataAcao: z.coerce.date(),
  observacoes: z.string().optional(),
  // SLA NÃO é persistido: é derivado em runtime pelo motor de dias úteis
  // (lib/sla-vaga.ts) — um valor gravado na criação envelheceria (RF10).
  dataEncaminhamentoGestor: z.coerce.date().optional(),
  dataRetornoGestor: z.coerce.date().optional(),
  chamadoJuridico: z.string().optional(),
  aberturaChamadoJuridico: z.coerce.date().optional(),
  recebimentoParecerJuridico: z.coerce.date().optional(),
  // Cronograma seletivo (RF13) — datas planejadas/realizadas por etapa
  inscricoesInicio: z.coerce.date().optional(),
  inscricoesFim: z.coerce.date().optional(),
  dataProva: z.coerce.date().optional(),
  dataEntrevistaRh: z.coerce.date().optional(),
  dataEntrevistaGestor: z.coerce.date().optional(),
  dataHabilitacao: z.coerce.date().optional(),
  divulgacaoResultado: z.coerce.date().optional(),
  previsaoAdmissao: z.coerce.date().optional(),
  dataAdmissao: z.coerce.date().optional(),
  // 🔒 Dados sensíveis de candidato (LGPD) — visíveis só para Admin (B7)
  candidatoSelecionado: z.string().optional(),
  genero: z.enum(['feminino', 'masculino', 'nao-informado']).optional(),
  candidatoInterno: z.boolean().optional(),
  gerouBanco: z.boolean().optional(),
  qtdCandidatosAplicados: z.number().optional(),
  // Reabertura = NOVO registro vinculado à Vaga anterior
  reaberturaDe: z.string().optional(),
  dataEncerramento: z.coerce.date().optional(),
  motivoCancelamento: z.string().optional(),
  // Auditoria (RF17) — carimbada pela porta de persistência
  criadoEm: z.coerce.date().optional(),
  criadoPor: z.string().optional(),
  atualizadoEm: z.coerce.date().optional(),
  atualizadoPor: z.string().optional(),
  // Histórico de alterações (RF16) — trilha imutável de eventos
  historico: z.array(eventoHistoricoSchema).optional(),
})

// Regra invariante: motivo obrigatório quando cancelada (CONTEXT.md).
const exigeMotivoAoCancelar = (
  vaga: { status: StatusVaga; motivoCancelamento?: string },
  ctx: z.RefinementCtx
) => {
  if (vaga.status === 'cancelada' && !vaga.motivoCancelamento) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'motivoCancelamento é obrigatório quando status = cancelada',
      path: ['motivoCancelamento'],
    })
  }
}

export const vagaSchema = vagaObjectSchema.superRefine(exigeMotivoAoCancelar)

export type Vaga = z.infer<typeof vagaSchema>

// B5 — campos que a usuária preenche ao CRIAR. O sistema gera id, codigoVaga
// (se vazio), origemDoCadastro, status, acaoAtual, dataAcao e auditoria.
// "Nº do chamado e/ou código" → ambos opcionais aqui, com refine exigindo ao
// menos um. Demais mínimos (unidade/área, gestor, cargo, tipo, recrutadora,
// data de abertura) são obrigatórios; o resto é progressivo.
export const vagaCreateSchema = vagaObjectSchema
  .pick({
    gestorSolicitante: true,
    unidade: true,
    area: true,
    cargo: true,
    tipoContrato: true,
    recrutadora: true,
    dataAbertura: true,
    nivel: true,
    funcao: true,
    motivoContratacao: true,
    observacoes: true,
  })
  .extend({
    chamado: z.string().optional(),
    codigoVaga: z.string().optional(),
    // Progressivo (B5): não bloqueia a criação; o store usa dataAbertura como
    // fallback quando vazio.
    dataRecebimento: z.coerce.date().optional(),
    pcd: z.boolean().default(false),
  })
  .refine((v) => Boolean(v.chamado?.trim() || v.codigoVaga?.trim()), {
    message: 'Informe o nº do chamado e/ou o código da vaga',
    path: ['chamado'],
  })

export type VagaCreateInput = z.infer<typeof vagaCreateSchema>

// Edição: os mesmos campos de negócio; o Status muda por ação própria (matriz
// B1), não pelo form. Todos opcionais (patch parcial).
export const vagaEditSchema = vagaObjectSchema
  .pick({
    chamado: true,
    codigoVaga: true,
    gestorSolicitante: true,
    unidade: true,
    area: true,
    cargo: true,
    tipoContrato: true,
    recrutadora: true,
    dataAbertura: true,
    dataRecebimento: true,
    nivel: true,
    funcao: true,
    motivoContratacao: true,
    pcd: true,
    observacoes: true,
  })
  .partial()

export type VagaEditInput = z.infer<typeof vagaEditSchema>

// Edição por seção no detalhe (RF08/RF11–RF15): cada card tem seu recorte de
// campos. Datas opcionais NUNCA herdam z.coerce.date() obrigatório
// (docs/solutions/logic-errors/zod-coerce-date-campo-opcional-em-forms.md).
export const gestorJuridicoEditSchema = vagaObjectSchema
  .pick({
    dataEncaminhamentoGestor: true,
    dataRetornoGestor: true,
    chamadoJuridico: true,
    aberturaChamadoJuridico: true,
    recebimentoParecerJuridico: true,
  })
  .partial()

export type GestorJuridicoEditInput = z.infer<typeof gestorJuridicoEditSchema>

export const cronogramaEditSchema = vagaObjectSchema
  .pick({
    inscricoesInicio: true,
    inscricoesFim: true,
    dataProva: true,
    dataEntrevistaRh: true,
    dataEntrevistaGestor: true,
    dataHabilitacao: true,
    previsaoAdmissao: true,
    dataAdmissao: true,
  })
  .partial()

export type CronogramaEditInput = z.infer<typeof cronogramaEditSchema>

export const resultadoEditSchema = vagaObjectSchema
  .pick({
    divulgacaoResultado: true,
    qtdCandidatosAplicados: true,
    gerouBanco: true,
    candidatoSelecionado: true,
    genero: true,
    candidatoInterno: true,
  })
  .partial()
  .extend({
    // Vem de <Input type=number> — coage string vazia p/ undefined
    qtdCandidatosAplicados: z.preprocess(
      (v) => (v === '' || v === null ? undefined : v),
      z.coerce.number().int().min(0).optional()
    ),
  })

export type ResultadoEditInput = z.infer<typeof resultadoEditSchema>
