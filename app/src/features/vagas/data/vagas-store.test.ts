import { beforeEach, describe, expect, it } from 'vitest'
import { type VagaCreateInput } from './schema'
import { useVagasStore } from './vagas-store'

// Testa a PORTA DE PERSISTÊNCIA pela interface pública (criar/atualizar/
// mudarStatus/mudarAcao): auditoria e histórico são efeitos observáveis
// (RF16/RF17), não detalhes internos.

const criarMinimo: VagaCreateInput = {
  chamado: 'CH-TESTE-1',
  gestorSolicitante: 'Gestor Teste',
  unidade: 'SESI Recife',
  area: 'Educação',
  cargo: 'Analista de Testes',
  tipoContrato: 'indeterminado',
  recrutadora: 'Recrutadora Teste',
  dataAbertura: new Date('2026-07-01'),
  pcd: false,
}

const estadoInicial = useVagasStore.getState()

beforeEach(() => {
  useVagasStore.setState(estadoInicial, true)
})

describe('criar', () => {
  it('carimba auditoria e evento de criação (RF16/RF17)', () => {
    const vaga = useVagasStore.getState().criar(criarMinimo, 'Recrutadora')
    expect(vaga.criadoPor).toBe('Recrutadora')
    expect(vaga.criadoEm).toBeInstanceOf(Date)
    expect(vaga.historico).toHaveLength(1)
    expect(vaga.historico?.[0]).toMatchObject({
      tipo: 'criacao',
      por: 'Recrutadora',
    })
  })
})

describe('atualizar', () => {
  it('anexa evento de edição com os campos alterados', () => {
    const vaga = useVagasStore.getState().criar(criarMinimo, 'Recrutadora')
    useVagasStore
      .getState()
      .atualizar(vaga.id, { cargo: 'Analista Sênior' }, 'Gestora de RH')

    const depois = useVagasStore.getState().vagas.find((v) => v.id === vaga.id)!
    expect(depois.cargo).toBe('Analista Sênior')
    expect(depois.atualizadoPor).toBe('Gestora de RH')
    const ultimo = depois.historico?.[depois.historico.length - 1]
    expect(ultimo?.tipo).toBe('edicao')
    expect(ultimo?.descricao).toContain('Cargo')
  })

  it('não gera evento quando nada mudou', () => {
    const vaga = useVagasStore.getState().criar(criarMinimo, 'Recrutadora')
    useVagasStore
      .getState()
      .atualizar(vaga.id, { cargo: vaga.cargo }, 'Recrutadora')
    const depois = useVagasStore.getState().vagas.find((v) => v.id === vaga.id)!
    expect(depois.historico).toHaveLength(1) // só a criação
  })
})

describe('mudarStatus', () => {
  it('registra a transição no histórico com o motivo', () => {
    const vaga = useVagasStore.getState().criar(criarMinimo, 'Recrutadora')
    useVagasStore
      .getState()
      .mudarStatus(vaga.id, 'cancelada', 'Gestora de RH', 'Sem orçamento')

    const depois = useVagasStore.getState().vagas.find((v) => v.id === vaga.id)!
    expect(depois.status).toBe('cancelada')
    const ultimo = depois.historico?.[depois.historico.length - 1]
    expect(ultimo?.tipo).toBe('mudanca-status')
    expect(ultimo?.descricao).toContain('Aberta → Cancelada')
    expect(ultimo?.descricao).toContain('Sem orçamento')
  })

  it('ignora transição fora da matriz B1 sem sujar o histórico', () => {
    const vaga = useVagasStore.getState().criar(criarMinimo, 'Recrutadora')
    useVagasStore.getState().mudarStatus(vaga.id, 'arquivada', 'Recrutadora')
    const depois = useVagasStore.getState().vagas.find((v) => v.id === vaga.id)!
    expect(depois.status).toBe('aberta') // aberta → arquivada não é permitido
    expect(depois.historico).toHaveLength(1)
  })
})

describe('mudarAcao (RF08)', () => {
  it('atualiza a etapa + data e registra o evento', () => {
    const vaga = useVagasStore.getState().criar(criarMinimo, 'Recrutadora')
    const data = new Date('2026-07-03')
    useVagasStore
      .getState()
      .mudarAcao(vaga.id, 'encaminhada-ao-gestor', data, 'Recrutadora')

    const depois = useVagasStore.getState().vagas.find((v) => v.id === vaga.id)!
    expect(depois.acaoAtual).toBe('encaminhada-ao-gestor')
    expect(depois.dataAcao).toEqual(data)
    const ultimo = depois.historico?.[depois.historico.length - 1]
    expect(ultimo?.tipo).toBe('mudanca-acao')
    expect(ultimo?.descricao).toContain(
      'Solicitação recebida → Encaminhada ao gestor'
    )
  })
})
