import { create } from 'zustand'
import { ACAO_LABELS, STATUS_LABELS, labelDoCampo } from './campos'
import {
  type AcaoVaga,
  type EventoHistorico,
  type StatusVaga,
  type Vaga,
  type VagaCreateInput,
} from './schema'
import { podeTransicionar } from './transicoes'
import { vagas as vagasSeed } from './vagas'

// Porta de persistência (mock em memória). É o ÚNICO ponto de mutação das
// Vagas — trocar o mock por API real significa reescrever só este arquivo, sem
// tocar telas (docs/engineering/arquitetura-de-modulos.md §3.4). O estado some no reload: é o seam, não a API.
//
// Toda mutação carimba auditoria (RF17) e anexa um evento ao histórico (RF16).
// `por` identifica quem fez — no protótipo, o papel ativo (usePapel).

type VagasState = {
  vagas: Vaga[]
  criar: (input: VagaCreateInput, por: string) => Vaga
  atualizar: (id: string, patch: Partial<Vaga>, por: string) => void
  mudarStatus: (
    id: string,
    novo: StatusVaga,
    por: string,
    motivo?: string
  ) => void
  mudarAcao: (id: string, acao: AcaoVaga, dataAcao: Date, por: string) => void
  importar: (novas: Array<Omit<Vaga, 'id'>>, por: string) => Vaga[]
}

function proximoId(vagas: Vaga[]): string {
  const maior = vagas.reduce((max, vaga) => {
    const n = Number.parseInt(vaga.id.replace(/\D/g, ''), 10)
    return Number.isFinite(n) && n > max ? n : max
  }, 0)
  return `VAGA-${String(maior + 1).padStart(4, '0')}`
}

function evento(
  tipo: EventoHistorico['tipo'],
  por: string,
  descricao: string
): EventoHistorico {
  return { em: new Date(), por, tipo, descricao }
}

// Campos do patch cujo valor de fato mudou — vira a descrição do evento.
function camposAlterados(vaga: Vaga, patch: Partial<Vaga>): string[] {
  return (Object.keys(patch) as Array<keyof Vaga>)
    .filter((campo) => {
      const antes = vaga[campo]
      const depois = patch[campo]
      if (antes instanceof Date || depois instanceof Date) {
        return (
          (antes instanceof Date ? antes.getTime() : antes) !==
          (depois instanceof Date ? depois.getTime() : depois)
        )
      }
      return antes !== depois
    })
    .map((campo) => labelDoCampo(campo))
}

export const useVagasStore = create<VagasState>()((set, get) => ({
  vagas: vagasSeed,

  criar: (input, por) => {
    const vagas = get().vagas
    const seq = vagas.length + 1
    const agora = new Date()
    const nova: Vaga = {
      id: proximoId(vagas),
      chamado: input.chamado?.trim() || `CH-${500000 + seq}`,
      codigoVaga:
        input.codigoVaga?.trim() || `VG-2026-${String(seq).padStart(3, '0')}`,
      dataRecebimento: input.dataRecebimento ?? input.dataAbertura,
      origemDoCadastro: 'manual',
      gestorSolicitante: input.gestorSolicitante,
      unidade: input.unidade,
      area: input.area,
      tipoContrato: input.tipoContrato,
      motivoContratacao: input.motivoContratacao,
      cargo: input.cargo,
      nivel: input.nivel,
      funcao: input.funcao,
      pcd: input.pcd,
      recrutadora: input.recrutadora,
      dataAbertura: input.dataAbertura,
      // Ao criar, nasce Aberta na etapa inicial e o SLA começa (B5).
      status: 'aberta',
      acaoAtual: 'solicitacao-recebida',
      dataAcao: input.dataAbertura,
      observacoes: input.observacoes,
      criadoEm: agora,
      criadoPor: por,
      historico: [evento('criacao', por, 'Vaga cadastrada no sistema')],
    }
    set({ vagas: [nova, ...vagas] })
    return nova
  },

  atualizar: (id, patch, por) =>
    set((state) => ({
      vagas: state.vagas.map((vaga) => {
        if (vaga.id !== id) return vaga
        const alterados = camposAlterados(vaga, patch)
        if (alterados.length === 0) return vaga
        return {
          ...vaga,
          ...patch,
          atualizadoEm: new Date(),
          atualizadoPor: por,
          historico: [
            ...(vaga.historico ?? []),
            evento('edicao', por, `Atualizou: ${alterados.join(', ')}`),
          ],
        }
      }),
    })),

  mudarStatus: (id, novo, por, motivo) =>
    set((state) => ({
      vagas: state.vagas.map((vaga) => {
        if (vaga.id !== id) return vaga
        if (!podeTransicionar(vaga.status, novo)) return vaga
        const encerra = novo === 'cancelada' || novo === 'finalizada'
        return {
          ...vaga,
          status: novo,
          ...(encerra ? { dataEncerramento: new Date() } : {}),
          ...(novo === 'cancelada' ? { motivoCancelamento: motivo } : {}),
          atualizadoEm: new Date(),
          atualizadoPor: por,
          historico: [
            ...(vaga.historico ?? []),
            evento(
              'mudanca-status',
              por,
              `Status: ${STATUS_LABELS[vaga.status]} → ${STATUS_LABELS[novo]}` +
                (motivo ? ` — ${motivo}` : '')
            ),
          ],
        }
      }),
    })),

  mudarAcao: (id, acao, dataAcao, por) =>
    set((state) => ({
      vagas: state.vagas.map((vaga) => {
        if (vaga.id !== id) return vaga
        if (vaga.acaoAtual === acao) return vaga
        return {
          ...vaga,
          acaoAtual: acao,
          dataAcao,
          atualizadoEm: new Date(),
          atualizadoPor: por,
          historico: [
            ...(vaga.historico ?? []),
            evento(
              'mudanca-acao',
              por,
              `Ação atual: ${ACAO_LABELS[vaga.acaoAtual]} → ${ACAO_LABELS[acao]}`
            ),
          ],
        }
      }),
    })),

  importar: (novas, por) => {
    const criadas: Vaga[] = []
    set((state) => {
      let vagas = state.vagas
      for (const nova of novas) {
        const vaga: Vaga = {
          ...nova,
          id: proximoId(vagas),
          criadoEm: new Date(),
          criadoPor: por,
          historico: [
            ...(nova.historico ?? []),
            evento(
              'importacao',
              por,
              `Importada de ${nova.fonteDosDados ?? 'planilha'}`
            ),
          ],
        }
        criadas.push(vaga)
        vagas = [vaga, ...vagas]
      }
      return { vagas }
    })
    return criadas
  },
}))

// Selectors/hooks — telas leem daqui, nunca do array estático.
export const useVagas = () => useVagasStore((s) => s.vagas)
export const useVaga = (id: string) =>
  useVagasStore((s) => s.vagas.find((vaga) => vaga.id === id))
