import { describe, expect, it } from 'vitest'
import { feriadosDaUnidade, feriadosNacionais, pascoa } from './feriados'

// Helper: alguma data do array bate com (ano, mes, dia)?
function inclui(datas: Date[], ano: number, mes: number, dia: number): boolean {
  return datas.some(
    (d) =>
      d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia
  )
}

describe('feriados móveis (via Páscoa)', () => {
  it('Páscoa de 2026 é 05/04', () => {
    const p = pascoa(2026)
    expect(p.getMonth()).toBe(3) // abril
    expect(p.getDate()).toBe(5)
  })

  it('Páscoa de 2027 é 28/03', () => {
    const p = pascoa(2027)
    expect(p.getMonth()).toBe(2) // março
    expect(p.getDate()).toBe(28)
  })

  it('deriva os móveis de 2026 corretamente', () => {
    const nac = feriadosNacionais(2026).map((f) => f.data)
    expect(inclui(nac, 2026, 2, 16)).toBe(true) // Carnaval segunda
    expect(inclui(nac, 2026, 2, 17)).toBe(true) // Carnaval terça
    expect(inclui(nac, 2026, 4, 3)).toBe(true) // Sexta-feira Santa
    expect(inclui(nac, 2026, 6, 4)).toBe(true) // Corpus Christi
  })
})

describe('feriados nacionais fixos', () => {
  it('inclui os fixos, com Consciência Negra (20/11)', () => {
    const nac = feriadosNacionais(2026).map((f) => f.data)
    expect(inclui(nac, 2026, 1, 1)).toBe(true)
    expect(inclui(nac, 2026, 9, 7)).toBe(true)
    expect(inclui(nac, 2026, 11, 20)).toBe(true)
    expect(inclui(nac, 2026, 12, 25)).toBe(true)
  })
})

describe('feriados por Unidade', () => {
  it('unidade conhecida soma nacionais + estadual + municipal', () => {
    const caruaru = feriadosDaUnidade('SESI Caruaru', 2026)
    expect(inclui(caruaru, 2026, 3, 6)).toBe(true) // Data Magna PE
    expect(inclui(caruaru, 2026, 5, 18)).toBe(true) // Emancipação de Caruaru
    expect(inclui(caruaru, 2026, 12, 25)).toBe(true) // nacional
  })

  it('unidade desconhecida ainda recebe nacionais + estadual', () => {
    const outra = feriadosDaUnidade('SESI Inexistente', 2026)
    expect(inclui(outra, 2026, 3, 6)).toBe(true) // estadual
    expect(inclui(outra, 2026, 12, 25)).toBe(true) // nacional
    // sem municipal específico
    expect(inclui(outra, 2026, 5, 18)).toBe(false)
  })
})
