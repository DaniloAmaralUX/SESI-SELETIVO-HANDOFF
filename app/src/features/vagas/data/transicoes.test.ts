import { describe, expect, it } from 'vitest'
import { STATUS_VAGA } from './schema'
import {
  TRANSICOES,
  podeTransicionar,
  transicoesPermitidas,
} from './transicoes'

describe('transições de Status (matriz B1)', () => {
  it('Aberta permite Suspensa, Congelada, Cancelada e Finalizada', () => {
    expect(transicoesPermitidas('aberta')).toEqual([
      'suspensa',
      'congelada',
      'cancelada',
      'finalizada',
    ])
  })

  it('Suspensa e Congelada só voltam para Aberta ou vão a Cancelada', () => {
    expect(transicoesPermitidas('suspensa')).toEqual(['aberta', 'cancelada'])
    expect(transicoesPermitidas('congelada')).toEqual(['aberta', 'cancelada'])
  })

  it('Finalizada e Cancelada só seguem para Arquivada', () => {
    expect(transicoesPermitidas('finalizada')).toEqual(['arquivada'])
    expect(transicoesPermitidas('cancelada')).toEqual(['arquivada'])
  })

  it('Arquivada é terminal', () => {
    expect(transicoesPermitidas('arquivada')).toEqual([])
  })

  it('Aberta não pode ir direto para Arquivada', () => {
    expect(podeTransicionar('aberta', 'arquivada')).toBe(false)
  })

  it('podeTransicionar reflete a matriz', () => {
    expect(podeTransicionar('aberta', 'cancelada')).toBe(true)
    expect(podeTransicionar('finalizada', 'aberta')).toBe(false)
    expect(podeTransicionar('arquivada', 'aberta')).toBe(false)
  })

  it('nenhum status transiciona para si mesmo', () => {
    for (const status of STATUS_VAGA) {
      expect(podeTransicionar(status, status)).toBe(false)
    }
  })

  it('a matriz cobre todos os status do enum', () => {
    expect(Object.keys(TRANSICOES).sort()).toEqual([...STATUS_VAGA].sort())
  })
})
