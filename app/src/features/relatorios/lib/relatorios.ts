import { type Vaga } from '@/features/vagas/data/schema'
import { SLA_META_DIAS_UTEIS } from '@/features/vagas/lib/sla'

// Agregações dos relatórios analíticos (RF24) — funções PURAS.
// `slaDe` é injetado (SLA derivado, nunca persistido), como em indicadores.ts.

export const DIMENSOES = [
  'area',
  'unidade',
  'gestorSolicitante',
  'recrutadora',
  'status',
] as const

export type Dimensao = (typeof DIMENSOES)[number]

export const DIMENSAO_LABELS: Record<Dimensao, string> = {
  area: 'Área',
  unidade: 'Unidade',
  gestorSolicitante: 'Gestor',
  recrutadora: 'Recrutadora',
  status: 'Status',
}

type Periodo = { de?: Date; ate?: Date }

type LinhaRelatorio = {
  chave: string
  total: number
  ativas: number
  finalizadas: number
  finalizadasNoPrazo: number
  percentualNoPrazo: number
  mediaSlaDiasUteis: number
}

const ATIVOS = new Set<Vaga['status']>(['aberta', 'suspensa', 'congelada'])

// Recorte por período de ABERTURA da vaga (RF24 "por período")
export function filtrarPorPeriodo(vagas: Vaga[], periodo: Periodo): Vaga[] {
  return vagas.filter((vaga) => {
    if (periodo.de && vaga.dataAbertura < periodo.de) return false
    if (periodo.ate && vaga.dataAbertura > periodo.ate) return false
    return true
  })
}

export function agregarRelatorio(
  vagas: Vaga[],
  dimensao: Dimensao,
  slaDe: (vaga: Vaga) => number,
  rotuloDe: (valor: string) => string = (v) => v
): LinhaRelatorio[] {
  const grupos = new Map<string, Vaga[]>()
  for (const vaga of vagas) {
    const chave = rotuloDe(String(vaga[dimensao]))
    grupos.set(chave, [...(grupos.get(chave) ?? []), vaga])
  }

  return [...grupos.entries()]
    .map(([chave, grupo]) => {
      const finalizadas = grupo.filter((v) => v.status === 'finalizada')
      const finalizadasNoPrazo = finalizadas.filter(
        (v) => slaDe(v) < SLA_META_DIAS_UTEIS
      ).length
      const somaSla = grupo.reduce((soma, v) => soma + slaDe(v), 0)
      return {
        chave,
        total: grupo.length,
        ativas: grupo.filter((v) => ATIVOS.has(v.status)).length,
        finalizadas: finalizadas.length,
        finalizadasNoPrazo,
        percentualNoPrazo:
          finalizadas.length === 0
            ? 0
            : Math.round((finalizadasNoPrazo / finalizadas.length) * 100),
        mediaSlaDiasUteis:
          grupo.length === 0 ? 0 : Math.round(somaSla / grupo.length),
      }
    })
    .sort((a, b) => b.total - a.total)
}
