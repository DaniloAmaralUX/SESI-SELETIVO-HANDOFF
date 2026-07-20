import { describe, expect, it } from 'vitest'
import { feriadosDaUnidade } from './feriados'
import {
  SLA_META_DIAS_UTEIS,
  calcularSlaDiasUteis,
  diasUteis,
  slaSeverity,
} from './sla'

const d = (iso: string) => new Date(iso + 'T00:00:00')

describe('slaSeverity', () => {
  it('retorna ok abaixo de 15 dias úteis', () => {
    expect(slaSeverity(0)).toBe('ok')
    expect(slaSeverity(14)).toBe('ok')
  })

  it('retorna atencao entre 15 e 19 dias úteis', () => {
    expect(slaSeverity(15)).toBe('atencao')
    expect(slaSeverity(19)).toBe('atencao')
  })

  it('retorna estourado a partir de 20 dias úteis (meta)', () => {
    expect(slaSeverity(20)).toBe('estourado')
    expect(slaSeverity(40)).toBe('estourado')
  })
})

describe('SLA_META_DIAS_UTEIS', () => {
  it('é 20 dias úteis (ADR 0002)', () => {
    expect(SLA_META_DIAS_UTEIS).toBe(20)
  })
})

describe('diasUteis (motor de dias úteis)', () => {
  it('mesmo dia é 0', () => {
    expect(diasUteis(d('2026-07-13'), d('2026-07-13'), [])).toBe(0)
  })

  it('conta seg→sex como 4 (uma semana útil, sem feriados)', () => {
    // 2026-07-13 é segunda; 2026-07-17 é sexta.
    expect(diasUteis(d('2026-07-13'), d('2026-07-17'), [])).toBe(4)
  })

  it('exclui o fim de semana', () => {
    // sexta 17 → segunda 20: só a segunda conta (sáb/dom fora).
    expect(diasUteis(d('2026-07-17'), d('2026-07-20'), [])).toBe(1)
  })

  it('exclui um feriado nacional no intervalo', () => {
    // 2026-05-01 (Dia do Trabalho, sexta) cai no intervalo qui 30/04 → seg 04/05.
    const feriados = feriadosDaUnidade('SESI Recife', 2026)
    const semFeriado = diasUteis(d('2026-04-30'), d('2026-05-04'), [])
    const comFeriado = diasUteis(d('2026-04-30'), d('2026-05-04'), feriados)
    expect(comFeriado).toBe(semFeriado - 1)
  })

  it('intervalo invertido é 0', () => {
    expect(diasUteis(d('2026-07-17'), d('2026-07-13'), [])).toBe(0)
  })
})

describe('calcularSlaDiasUteis (fim da contagem — RF10)', () => {
  const feriados = feriadosDaUnidade('SESI Recife', 2026)
  const hoje = d('2026-07-24') // sexta

  it('congela na Divulgação do resultado quando presente', () => {
    const sla = calcularSlaDiasUteis(
      {
        dataAbertura: d('2026-07-13'),
        dataAcao: d('2026-07-31'),
        divulgacaoResultado: d('2026-07-17'),
      },
      feriados,
      { pausada: false, hoje }
    )
    // abertura seg 13 → divulgação sex 17 = 4 dias úteis (ignora dataAcao posterior)
    expect(sla).toBe(4)
  })

  it('sem divulgação, usa o encerramento', () => {
    const sla = calcularSlaDiasUteis(
      {
        dataAbertura: d('2026-07-13'),
        dataAcao: d('2026-07-31'),
        dataEncerramento: d('2026-07-15'),
      },
      feriados,
      { pausada: false, hoje }
    )
    expect(sla).toBe(2) // seg13 → qua15
  })

  it('vaga correndo (não pausada) conta até HOJE, não até a última ação', () => {
    const sla = calcularSlaDiasUteis(
      { dataAbertura: d('2026-07-13'), dataAcao: d('2026-07-16') },
      feriados,
      { pausada: false, hoje }
    )
    expect(sla).toBe(9) // seg13 → sex24: 2 semanas úteis menos o dia inicial
  })

  it('vaga pausada (Suspensa/Congelada) congela na última ação', () => {
    const sla = calcularSlaDiasUteis(
      { dataAbertura: d('2026-07-13'), dataAcao: d('2026-07-16') },
      feriados,
      { pausada: true, hoje }
    )
    expect(sla).toBe(3) // seg13 → qui16
  })
})
