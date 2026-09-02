import { describe, expect, it } from 'vitest'
import { type Vaga } from '../data/schema'
import {
  slaDaVaga,
  tempoDoGestorDiasUteis,
  tempoDoJuridicoDiasUteis,
} from './sla-vaga'

// Adaptador Vaga → motor de SLA/medições. Datas escolhidas fora de feriados
// (julho/2026), exceto o caso que valida a exclusão de feriado nacional.

function vaga(parcial: Partial<Vaga>): Vaga {
  return {
    id: 'VAGA-9999',
    chamado: 'CH-999999',
    codigoVaga: 'VG-2026-999',
    dataRecebimento: new Date('2026-07-01'),
    origemDoCadastro: 'manual',
    gestorSolicitante: 'Gestor Teste',
    unidade: 'SESI Recife',
    area: 'Educação',
    tipoContrato: 'indeterminado',
    cargo: 'Analista de Testes',
    pcd: false,
    recrutadora: 'Recrutadora Teste',
    dataAbertura: new Date('2026-07-01'),
    status: 'aberta',
    acaoAtual: 'solicitacao-recebida',
    dataAcao: new Date('2026-07-01'),
    ...parcial,
  }
}

describe('slaDaVaga', () => {
  it('não conta em Rascunho (processo ainda não iniciado)', () => {
    const v = vaga({ status: 'rascunho' })
    expect(slaDaVaga(v, new Date('2026-07-20'))).toBe(0)
  })

  it('conta em dias úteis a partir da abertura quando Aberta', () => {
    // 01/07/2026 (qua) → 08/07 (qua): 02, 03, 06, 07, 08 = 5 dias úteis
    const v = vaga({ status: 'aberta' })
    expect(slaDaVaga(v, new Date('2026-07-08'))).toBe(5)
  })
})

describe('tempoDoJuridicoDiasUteis', () => {
  it('é undefined sem abertura do chamado', () => {
    expect(tempoDoJuridicoDiasUteis(vaga({}))).toBeUndefined()
  })

  it('mede o intervalo fechado quando há parecer', () => {
    const v = vaga({
      aberturaChamadoJuridico: new Date('2026-07-01'),
      recebimentoParecerJuridico: new Date('2026-07-08'),
    })
    expect(tempoDoJuridicoDiasUteis(v)).toBe(5)
  })

  it('mede até hoje enquanto não há parecer (em andamento)', () => {
    const v = vaga({ aberturaChamadoJuridico: new Date('2026-07-01') })
    expect(tempoDoJuridicoDiasUteis(v, new Date('2026-07-08'))).toBe(5)
  })

  it('exclui feriado nacional do intervalo', () => {
    // 04/09/2026 (sex) → 08/09 (ter): 05-06 fim de semana, 07 Independência
    const v = vaga({
      aberturaChamadoJuridico: new Date('2026-09-04'),
      recebimentoParecerJuridico: new Date('2026-09-08'),
    })
    expect(tempoDoJuridicoDiasUteis(v)).toBe(1)
  })
})

describe('tempoDoGestorDiasUteis (paridade)', () => {
  it('mesma régua de dias úteis do jurídico', () => {
    const v = vaga({
      dataEncaminhamentoGestor: new Date('2026-07-01'),
      dataRetornoGestor: new Date('2026-07-08'),
    })
    expect(tempoDoGestorDiasUteis(v)).toBe(5)
  })
})
