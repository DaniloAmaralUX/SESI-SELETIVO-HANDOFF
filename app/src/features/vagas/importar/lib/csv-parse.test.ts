import { describe, expect, it } from 'vitest'
import {
  mapearLinhas,
  marcarDuplicadas,
  parseCsv,
  validarLayout,
} from './csv-parse'

const CABECALHO =
  'Chamado;Código da vaga;Gestor solicitante;Unidade;Área;Cargo;Tipo de contrato;Recrutadora;Data de abertura'

function csv(...linhas: string[]): string {
  return [CABECALHO, ...linhas].join('\r\n')
}

const LINHA_OK =
  'CH-1;VG-1;Gestor A;SESI Recife;Educação;Analista;Indeterminado;Recrutadora A;01/07/2026'

describe('parseCsv', () => {
  it('divide por ponto e vírgula com CRLF', () => {
    const linhas = parseCsv('A;B\r\n1;2')
    expect(linhas).toEqual([
      ['A', 'B'],
      ['1', '2'],
    ])
  })

  it('detecta vírgula como separador quando predominante', () => {
    expect(parseCsv('A,B\n1,2')).toEqual([
      ['A', 'B'],
      ['1', '2'],
    ])
  })

  it('respeita aspas com separador e aspas duplas escapadas', () => {
    const linhas = parseCsv('A;B\n"tem;separador";"tem ""aspas"""')
    expect(linhas[1]).toEqual(['tem;separador', 'tem "aspas"'])
  })

  it('descarta linhas vazias e remove BOM', () => {
    const linhas = parseCsv('﻿A;B\n\n1;2\n;\n')
    expect(linhas).toEqual([
      ['A', 'B'],
      ['1', '2'],
    ])
  })
})

describe('validarLayout (RF20)', () => {
  it('aceita o layout oficial (com acentos e caixa variada)', () => {
    expect(validarLayout(CABECALHO.split(';'))).toEqual([])
  })

  it('aponta colunas obrigatórias ausentes', () => {
    const erros = validarLayout(['Chamado', 'Cargo'])
    expect(erros.length).toBeGreaterThan(0)
    expect(erros.join(' ')).toContain('unidade')
  })
})

describe('mapearLinhas', () => {
  it('mapeia linha válida com defaults (aberta, solicitação recebida)', () => {
    const { importadas, erros } = mapearLinhas(
      parseCsv(csv(LINHA_OK)),
      'teste.csv'
    )
    expect(erros).toEqual([])
    expect(importadas).toHaveLength(1)
    const vaga = importadas[0].vaga
    expect(vaga.chamado).toBe('CH-1')
    expect(vaga.status).toBe('aberta')
    expect(vaga.acaoAtual).toBe('solicitacao-recebida')
    expect(vaga.origemDoCadastro).toBe('importacao')
    expect(vaga.fonteDosDados).toBe('teste.csv')
    expect(vaga.dataAbertura).toEqual(new Date(2026, 6, 1))
  })

  it('aceita só chamado OU só código (regra e/ou)', () => {
    const soChamado =
      'CH-2;;Gestor;SESI Recife;TI;Dev;Determinado;Rec;02/07/2026'
    const { importadas, erros } = mapearLinhas(
      parseCsv(csv(soChamado)),
      'a.csv'
    )
    expect(erros).toEqual([])
    expect(importadas[0].vaga.codigoVaga).toBe('CH-2')
  })

  it('rejeita linha sem campos mínimos com número da linha', () => {
    const invalida = ';;Gestor;;;Analista;Indeterminado;Rec;01/07/2026'
    const { importadas, erros } = mapearLinhas(
      parseCsv(csv(LINHA_OK, invalida)),
      'a.csv'
    )
    expect(importadas).toHaveLength(1)
    expect(erros).toHaveLength(1)
    expect(erros[0].linha).toBe(3)
    expect(erros[0].mensagem).toContain('chamado e/ou código')
  })

  it('rejeita data em formato inválido', () => {
    const dataRuim =
      'CH-3;VG-3;Gestor;SESI Recife;TI;Dev;Indeterminado;Rec;2026-07-01'
    const { erros } = mapearLinhas(parseCsv(csv(dataRuim)), 'a.csv')
    expect(erros[0].mensagem).toContain('dd/mm/aaaa')
  })
})

describe('marcarDuplicadas (RF21)', () => {
  it('marca duplicada por chamado OU código já existente', () => {
    const { importadas } = mapearLinhas(
      parseCsv(
        csv(
          LINHA_OK,
          'CH-9;VG-9;Gestor;SESI Recife;TI;Dev;Indeterminado;Rec;01/07/2026'
        )
      ),
      'a.csv'
    )
    const marcadas = marcarDuplicadas(importadas, [
      { chamado: 'CH-1', codigoVaga: 'VG-0001' },
    ])
    expect(marcadas[0].duplicada).toBe(true) // CH-1 já existe
    expect(marcadas[1].duplicada).toBe(false)
  })
})
