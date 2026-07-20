import { describe, expect, it } from 'vitest'
import {
  ACOES_VAGA,
  STATUS_VAGA,
  vagaCreateSchema,
  vagaSchema,
  type Vaga,
} from './schema'
import { vagas } from './vagas'

// Vaga mínima válida (só campos obrigatórios)
const vagaValida: Vaga = {
  id: 'vaga-teste-1',
  chamado: 'CH-0001',
  codigoVaga: 'VG-0001',
  dataRecebimento: new Date('2026-01-05'),
  origemDoCadastro: 'manual',
  gestorSolicitante: 'Gestor Teste',
  unidade: 'Unidade Teste',
  area: 'Área Teste',
  tipoContrato: 'indeterminado',
  cargo: 'Analista',
  pcd: false,
  recrutadora: 'Recrutadora Teste',
  dataAbertura: new Date('2026-01-06'),
  status: 'aberta',
  acaoAtual: 'solicitacao-recebida',
  dataAcao: new Date('2026-01-06'),
}

describe('vagaSchema', () => {
  it('aceita uma vaga válida', () => {
    const result = vagaSchema.safeParse(vagaValida)
    expect(result.success).toBe(true)
  })

  it('rejeita status fora do enum', () => {
    const result = vagaSchema.safeParse({
      ...vagaValida,
      status: 'inexistente',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita acaoAtual fora do enum', () => {
    const result = vagaSchema.safeParse({
      ...vagaValida,
      acaoAtual: 'triagem',
    })
    expect(result.success).toBe(false)
  })

  it('exige motivoCancelamento quando status = cancelada', () => {
    const semMotivo = vagaSchema.safeParse({
      ...vagaValida,
      status: 'cancelada',
    })
    expect(semMotivo.success).toBe(false)

    const comMotivo = vagaSchema.safeParse({
      ...vagaValida,
      status: 'cancelada',
      motivoCancelamento: 'Orçamento congelado',
    })
    expect(comMotivo.success).toBe(true)
  })
})

describe('vagaCreateSchema (campos mínimos B5)', () => {
  // Campos mínimos B5, SEM dataRecebimento (progressivo) — não deve bloquear.
  const criarMinimo = {
    chamado: 'CH-9001',
    gestorSolicitante: 'Gestor',
    unidade: 'SESI Recife',
    area: 'Educação',
    cargo: 'Analista',
    tipoContrato: 'indeterminado' as const,
    recrutadora: 'Recrutadora',
    dataAbertura: new Date('2026-07-01'),
  }

  it('aceita criação sem dataRecebimento (campo progressivo)', () => {
    const result = vagaCreateSchema.safeParse(criarMinimo)
    expect(result.success).toBe(true)
  })

  it('aplica default pcd=false quando ausente', () => {
    const result = vagaCreateSchema.parse(criarMinimo)
    expect(result.pcd).toBe(false)
  })

  it('aceita só código quando não há chamado (regra "e/ou")', () => {
    const { chamado: _chamado, ...semChamado } = criarMinimo
    const result = vagaCreateSchema.safeParse({
      ...semChamado,
      codigoVaga: 'VG-2026-999',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita quando faltam chamado e código', () => {
    const { chamado: _chamado, ...semChamado } = criarMinimo
    const result = vagaCreateSchema.safeParse(semChamado)
    expect(result.success).toBe(false)
  })

  it('rejeita quando falta um campo mínimo obrigatório (cargo)', () => {
    const { cargo: _cargo, ...semCargo } = criarMinimo
    const result = vagaCreateSchema.safeParse(semCargo)
    expect(result.success).toBe(false)
  })
})

describe('mock de vagas', () => {
  it('passa inteiro no schema sem lançar', () => {
    expect(() => vagaSchema.array().parse(vagas)).not.toThrow()
  })

  it('tem pelo menos 50 itens', () => {
    expect(vagas.length).toBeGreaterThanOrEqual(50)
  })

  it('toda vaga tem histórico com evento de criação/importação (RF16)', () => {
    for (const vaga of vagas) {
      expect(vaga.historico?.length).toBeGreaterThanOrEqual(1)
      expect(['criacao', 'importacao']).toContain(vaga.historico?.[0].tipo)
    }
  })

  it('vagas avançadas têm cronograma preenchido (RF13)', () => {
    const avancadas = vagas.filter((v) => v.acaoAtual === 'admissao')
    expect(avancadas.length).toBeGreaterThan(0)
    for (const vaga of avancadas) {
      expect(vaga.inscricoesInicio).toBeInstanceOf(Date)
      expect(vaga.dataProva).toBeInstanceOf(Date)
      expect(vaga.dataEntrevistaRh).toBeInstanceOf(Date)
    }
  })
})

describe('enums do domínio', () => {
  it('STATUS_VAGA tem 6 status', () => {
    expect(STATUS_VAGA).toHaveLength(6)
  })

  it('ACOES_VAGA tem 10 ações na ordem canônica', () => {
    expect(ACOES_VAGA).toEqual([
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
    ])
  })
})
