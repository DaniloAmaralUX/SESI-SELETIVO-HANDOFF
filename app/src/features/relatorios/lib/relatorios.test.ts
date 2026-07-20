import { describe, expect, it } from 'vitest'
import { type StatusVaga, type Vaga } from '@/features/vagas/data/schema'
import { agregarRelatorio, filtrarPorPeriodo } from './relatorios'

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
    gestorSolicitante: 'Gestor A',
    unidade: 'SESI Recife',
    area: 'Educação',
    tipoContrato: 'indeterminado',
    cargo: 'Analista',
    pcd: false,
    recrutadora: 'Recrutadora A',
    dataAbertura: new Date('2026-03-10'),
    acaoAtual: 'solicitacao-recebida',
    dataAcao: new Date('2026-03-10'),
    ...rest,
  }
}

const slaDe = (v: Vaga) => slaPorId.get(v.id) ?? 0

describe('filtrarPorPeriodo', () => {
  it('recorta pela data de abertura (de/até inclusivos)', () => {
    const vagas = [
      vaga({ status: 'aberta', dataAbertura: new Date('2026-01-15') }),
      vaga({ status: 'aberta', dataAbertura: new Date('2026-03-15') }),
      vaga({ status: 'aberta', dataAbertura: new Date('2026-06-15') }),
    ]
    const recorte = filtrarPorPeriodo(vagas, {
      de: new Date('2026-02-01'),
      ate: new Date('2026-05-01'),
    })
    expect(recorte).toHaveLength(1)
    expect(recorte[0].dataAbertura).toEqual(new Date('2026-03-15'))
  })

  it('sem período devolve tudo', () => {
    const vagas = [vaga({ status: 'aberta' })]
    expect(filtrarPorPeriodo(vagas, {})).toHaveLength(1)
  })
})

describe('agregarRelatorio (RF24)', () => {
  it('agrupa pela dimensão e calcula % no prazo sobre finalizadas', () => {
    const vagas = [
      vaga({ status: 'finalizada', area: 'TI', sla: 10 }), // no prazo
      vaga({ status: 'finalizada', area: 'TI', sla: 25 }), // estourada
      vaga({ status: 'aberta', area: 'TI', sla: 5 }),
      vaga({ status: 'finalizada', area: 'Saúde', sla: 12 }),
    ]
    const r = agregarRelatorio(vagas, 'area', slaDe)
    expect(r[0].chave).toBe('TI') // maior total primeiro
    expect(r[0]).toMatchObject({
      total: 3,
      ativas: 1,
      finalizadas: 2,
      finalizadasNoPrazo: 1,
      percentualNoPrazo: 50,
    })
    expect(r[1]).toMatchObject({ chave: 'Saúde', percentualNoPrazo: 100 })
  })

  it('calcula média de SLA do grupo', () => {
    const vagas = [
      vaga({ status: 'aberta', recrutadora: 'R1', sla: 10 }),
      vaga({ status: 'aberta', recrutadora: 'R1', sla: 20 }),
    ]
    const r = agregarRelatorio(vagas, 'recrutadora', slaDe)
    expect(r[0].mediaSlaDiasUteis).toBe(15)
  })

  it('aplica rótulo customizado da chave (ex.: status→label)', () => {
    const vagas = [vaga({ status: 'aberta' })]
    const r = agregarRelatorio(vagas, 'status', slaDe, (v) =>
      v === 'aberta' ? 'Aberta' : v
    )
    expect(r[0].chave).toBe('Aberta')
  })
})
