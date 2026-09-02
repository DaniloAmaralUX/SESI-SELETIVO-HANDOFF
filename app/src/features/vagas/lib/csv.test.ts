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

// As observações por etapa levam texto livre do usuário para a planilha: uma
// célula iniciada por =, +, -, @ é executada como fórmula por Excel/Sheets.
describe('gerarCsv — injeção de fórmula', () => {
  it('prefixa aspa simples nos gatilhos de fórmula', () => {
    const csv = gerarCsv(
      ['Observações'],
      [['=1+1'], ['+A1'], ['@SUM(A1)'], ['-1+1']]
    )
    const linhas = csv.split('\r\n')
    expect(linhas[1]).toBe("'=1+1")
    expect(linhas[2]).toBe("'+A1")
    expect(linhas[3]).toBe("'@SUM(A1)")
    expect(linhas[4]).toBe("'-1+1")
  })

  it('desarma HYPERLINK e DDE mesmo com o escape de aspas em volta', () => {
    const csv = gerarCsv(
      ['Observações'],
      [['=HYPERLINK("https://x.tld";"Ver")'], ["=cmd|'/c calc'!A1"]]
    )
    const linhas = csv.split('\r\n')
    // Entre aspas por causa do ';' — mas o conteúdo já começa por aspa simples
    expect(linhas[1]).toBe('"\'=HYPERLINK(""https://x.tld"";""Ver"")"')
    expect(linhas[2]).toBe("'=cmd|'/c calc'!A1")
  })

  it('preserva número negativo como número (não é fórmula)', () => {
    const csv = gerarCsv(['SLA'], [[-5], ['-12'], [-3.5], [0]])
    expect(csv.split('\r\n').slice(1)).toEqual(['-5', '-12', '-3.5', '0'])
  })

  it('não toca em texto comum nem em célula vazia', () => {
    const csv = gerarCsv(['A'], [['Gestor pediu prioridade'], ['']])
    expect(csv.split('\r\n').slice(1)).toEqual(['Gestor pediu prioridade', ''])
  })
})
