import { describe, expect, it } from 'vitest'
import { type StatusVaga, type Vaga } from '@/features/vagas/data/schema'
import {
  contagemPorAcao,
  contagemPorStatus,
  contagemPorUnidade,
  resumoSla,
  vagasEmAtencao,
} from './indicadores'

// O SLA agora é DERIVADO (injetado via `slaDe`) — o fixture registra o valor
// desejado por id e `slaDe` o devolve, simulando o motor de dias úteis.
let seq = 0
const slaPorId = new Map<string, number>()

function vaga(
  over: Partial<Vaga> & { status: StatusVaga; sla?: number }
): Vaga {
  seq++
  const { sla, ...rest } = over
  const id = `VAGA-${seq}`
  slaPorId.set(id, sla ?? 5)
  return {
    id,
    chamado: `CH-${seq}`,
    codigoVaga: `VG-${seq}`,
    dataRecebimento: new Date('2026-01-05'),
    origemDoCadastro: 'manual',
    gestorSolicitante: 'Gestor',
    unidade: 'SESI Recife',
    area: 'Educação',
    tipoContrato: 'indeterminado',
    cargo: 'Analista',
    pcd: false,
    recrutadora: 'Recrutadora',
    dataAbertura: new Date('2026-01-06'),
    acaoAtual: 'solicitacao-recebida',
    dataAcao: new Date('2026-01-06'),
    ...rest,
  }
}

const slaDe = (v: Vaga) => slaPorId.get(v.id) ?? 0

describe('resumoSla (vagas ativas)', () => {
  it('classifica por severidade e calcula média e % dentro da meta', () => {
    const vagas = [
      vaga({ status: 'aberta', sla: 5 }), // ok
      vaga({ status: 'aberta', sla: 16 }), // atenção
      vaga({ status: 'suspensa', sla: 25 }), // estourado
      vaga({ status: 'finalizada', sla: 50 }), // terminal → ignorada
    ]
    const r = resumoSla(vagas, slaDe)
    expect(r.total).toBe(3) // só ativas
    expect(r.estourado).toBe(1)
    expect(r.atencao).toBe(1)
    expect(r.dentroMeta).toBe(2) // total - estourado
    expect(r.mediaDiasUteis).toBe(Math.round((5 + 16 + 25) / 3))
    expect(r.percentualDentroMeta).toBe(Math.round((2 / 3) * 100))
  })

  it('lida com conjunto sem ativas', () => {
    const r = resumoSla([vaga({ status: 'arquivada' })], slaDe)
    expect(r.total).toBe(0)
    expect(r.mediaDiasUteis).toBe(0)
    expect(r.percentualDentroMeta).toBe(0)
  })
})

describe('contagens', () => {
  it('contagemPorStatus cobre os 6 status na ordem canônica', () => {
    const vagas = [
      vaga({ status: 'aberta' }),
      vaga({ status: 'aberta' }),
      vaga({ status: 'cancelada', motivoCancelamento: 'x' }),
    ]
    const c = contagemPorStatus(vagas)
    expect(c).toHaveLength(6)
    expect(c[0]).toMatchObject({ status: 'aberta', total: 2 })
    expect(c.find((x) => x.status === 'cancelada')?.total).toBe(1)
    expect(c.find((x) => x.status === 'suspensa')?.total).toBe(0)
  })

  it('contagemPorAcao conta só as ativas', () => {
    const vagas = [
      vaga({ status: 'aberta', acaoAtual: 'inscricoes' }),
      vaga({ status: 'finalizada', acaoAtual: 'admissao' }),
    ]
    const c = contagemPorAcao(vagas)
    expect(c.find((x) => x.acao === 'inscricoes')?.total).toBe(1)
    expect(c.find((x) => x.acao === 'admissao')?.total).toBe(0) // terminal fora
  })

  it('contagemPorUnidade ordena do maior para o menor', () => {
    const vagas = [
      vaga({ status: 'aberta', unidade: 'SESI Recife' }),
      vaga({ status: 'aberta', unidade: 'SESI Recife' }),
      vaga({ status: 'aberta', unidade: 'SESI Caruaru' }),
    ]
    const c = contagemPorUnidade(vagas)
    expect(c[0]).toEqual({ unidade: 'SESI Recife', total: 2 })
    expect(c[1]).toEqual({ unidade: 'SESI Caruaru', total: 1 })
  })
})

describe('vagasEmAtencao', () => {
  it('retorna só ativas não-ok, da mais crítica para a menos', () => {
    const vagas = [
      vaga({ status: 'aberta', sla: 5 }), // ok → fora
      vaga({ status: 'aberta', sla: 16 }), // atenção
      vaga({ status: 'congelada', sla: 30 }), // estourado
      vaga({ status: 'finalizada', sla: 40 }), // terminal → fora
    ]
    const r = vagasEmAtencao(vagas, slaDe)
    expect(r).toHaveLength(2)
    expect(r[0].sla).toBe(30) // mais crítica primeiro
    expect(r[1].sla).toBe(16)
  })
})
