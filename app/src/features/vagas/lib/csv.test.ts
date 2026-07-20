import { describe, expect, it } from 'vitest'
import { gerarCsv } from './csv'

describe('gerarCsv (RF25)', () => {
  it('separa por ponto e vírgula e quebra linhas com CRLF', () => {
    const csv = gerarCsv(['A', 'B'], [['1', '2']])
    expect(csv).toBe('A;B\r\n1;2')
  })

  it('escapa células com separador, aspas e quebra de linha', () => {
    const csv = gerarCsv(
      ['Campo'],
      [['tem;separador'], ['tem "aspas"'], ['tem\nquebra']]
    )
    const linhas = csv.split('\r\n')
    expect(linhas[1]).toBe('"tem;separador"')
    expect(linhas[2]).toBe('"tem ""aspas"""')
    // A célula com \n fica entre aspas (a quebra interna não vira nova linha)
    expect(csv).toContain('"tem\nquebra"')
  })

  it('converte undefined/null em célula vazia', () => {
    const csv = gerarCsv(['A', 'B', 'C'], [[undefined, null, 'x']])
    expect(csv.split('\r\n')[1]).toBe(';;x')
  })
})
