import { beforeEach, describe, expect, it } from 'vitest'
import {
  observacaoEtapaSchema,
  OBSERVACAO_MAX_CHARS,
  type VagaCreateInput,
} from './schema'
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

  it('nasce em Rascunho na etapa inicial', () => {
    const vaga = useVagasStore.getState().criar(criarMinimo, 'Recrutadora')
    expect(vaga.status).toBe('rascunho')
    expect(vaga.acaoAtual).toBe('solicitacao-recebida')
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
    // promove a Aberta primeiro — o cenário testa a transição de uma vaga em andamento
    useVagasStore.getState().mudarStatus(vaga.id, 'aberta', 'Recrutadora')
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

  it('rascunho → aberta re-carimba dataAbertura/dataAcao (SLA passa a contar)', () => {
    const vaga = useVagasStore.getState().criar(criarMinimo, 'Recrutadora')
    const antes = vaga.dataAbertura.getTime()
    useVagasStore.getState().mudarStatus(vaga.id, 'aberta', 'Recrutadora')

    const depois = useVagasStore.getState().vagas.find((v) => v.id === vaga.id)!
    expect(depois.status).toBe('aberta')
    expect(depois.dataAbertura.getTime()).toBeGreaterThan(antes)
    expect(depois.dataAcao.getTime()).toBe(depois.dataAbertura.getTime())
    const ultimo = depois.historico?.[depois.historico.length - 1]
    expect(ultimo?.descricao).toContain('Rascunho → Aberta')
  })

  it('rascunho → cancelada é permitido com motivo', () => {
    const vaga = useVagasStore.getState().criar(criarMinimo, 'Recrutadora')
    useVagasStore
      .getState()
      .mudarStatus(vaga.id, 'cancelada', 'Recrutadora', 'Duplicada')
    const depois = useVagasStore.getState().vagas.find((v) => v.id === vaga.id)!
    expect(depois.status).toBe('cancelada')
    const ultimo = depois.historico?.[depois.historico.length - 1]
    expect(ultimo?.descricao).toContain('Rascunho → Cancelada')
  })

  it('rascunho → cancelada PRESERVA a dataAbertura digitada', () => {
    // Só rascunho → aberta re-carimba: cancelar um rascunho não abre processo
    // nenhum, e apagar a data digitada perderia o dado histórico da vaga.
    const vaga = useVagasStore.getState().criar(criarMinimo, 'Recrutadora')
    const abertura = vaga.dataAbertura.getTime()
    const acao = vaga.dataAcao.getTime()

    useVagasStore
      .getState()
      .mudarStatus(vaga.id, 'cancelada', 'Recrutadora', 'Duplicada')

    const depois = useVagasStore.getState().vagas.find((v) => v.id === vaga.id)!
    expect(depois.dataAbertura.getTime()).toBe(abertura)
    expect(depois.dataAcao.getTime()).toBe(acao)
  })

  it('ignora transição fora da matriz B1 sem sujar o histórico', () => {
    const vaga = useVagasStore.getState().criar(criarMinimo, 'Recrutadora')
    useVagasStore.getState().mudarStatus(vaga.id, 'arquivada', 'Recrutadora')
    const depois = useVagasStore.getState().vagas.find((v) => v.id === vaga.id)!
    expect(depois.status).toBe('rascunho') // rascunho → arquivada não é permitido
    expect(depois.historico).toHaveLength(1)
  })
})

describe('adicionarObservacao', () => {
  it('corta a observação no limite do schema', () => {
    // O limite é regra de domínio, não detalhe do textarea: a porta de
    // persistência é o contrato que o backend real vai herdar.
    const vaga = useVagasStore.getState().criar(criarMinimo, 'Recrutadora')
    const gigante = 'x'.repeat(OBSERVACAO_MAX_CHARS + 200)

    useVagasStore
      .getState()
      .adicionarObservacao(
        vaga.id,
        'solicitacao-recebida',
        gigante,
        'Recrutadora'
      )

    const depois = useVagasStore.getState().vagas.find((v) => v.id === vaga.id)!
    const obs = depois.observacoesEtapas?.[0]
    expect(obs?.texto).toHaveLength(OBSERVACAO_MAX_CHARS)
    // e o registro continua válido para o schema
    expect(() => observacaoEtapaSchema.parse(obs)).not.toThrow()
  })

  it('acumula observação imutável e anexa evento ao histórico', () => {
    const vaga = useVagasStore.getState().criar(criarMinimo, 'Recrutadora')
    useVagasStore
      .getState()
      .adicionarObservacao(
        vaga.id,
        'solicitacao-recebida',
        'Perfil revisado com o gestor.',
        'Recrutadora'
      )

    const depois = useVagasStore.getState().vagas.find((v) => v.id === vaga.id)!
    expect(depois.observacoesEtapas).toHaveLength(1)
    expect(depois.observacoesEtapas?.[0]).toMatchObject({
      etapa: 'solicitacao-recebida',
      texto: 'Perfil revisado com o gestor.',
      por: 'Recrutadora',
    })
    const ultimo = depois.historico?.[depois.historico.length - 1]
    expect(ultimo?.tipo).toBe('observacao')
    expect(ultimo?.descricao).toContain('Solicitação recebida')
    expect(ultimo?.descricao).toContain('Perfil revisado com o gestor.')
  })

  it('ignora texto vazio sem sujar o histórico', () => {
    const vaga = useVagasStore.getState().criar(criarMinimo, 'Recrutadora')
    useVagasStore
      .getState()
      .adicionarObservacao(vaga.id, 'prova', '   ', 'Recrutadora')
    const depois = useVagasStore.getState().vagas.find((v) => v.id === vaga.id)!
    expect(depois.observacoesEtapas).toBeUndefined()
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
