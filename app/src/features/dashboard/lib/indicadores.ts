import { acaoOptions, statusOptions } from '@/features/vagas/data/data'
import {
  type AcaoVaga,
  type StatusVaga,
  type Vaga,
} from '@/features/vagas/data/schema'
import { slaSeverity } from '@/features/vagas/lib/sla'

// Indicadores da visão da Gestora de RH — funções PURAS de agregação sobre
// Vaga[]. Sem I/O nem estado: testam direto. Só dados agregados (nada de campo
// sensível de candidato — LGPD).

// Status "ativos": a vaga ainda consome SLA / está no pipeline.
const STATUS_ATIVOS: StatusVaga[] = ['aberta', 'suspensa', 'congelada']

function ehAtiva(vaga: Vaga): boolean {
  return STATUS_ATIVOS.includes(vaga.status)
}

function vagasAtivas(vagas: Vaga[]): Vaga[] {
  return vagas.filter(ehAtiva)
}

// Contagem por Status, na ordem canônica (para gráfico/lista estáveis).
export function contagemPorStatus(
  vagas: Vaga[]
): Array<{ status: StatusVaga; label: string; total: number }> {
  return statusOptions.map((opcao) => ({
    status: opcao.value,
    label: opcao.label,
    total: vagas.filter((v) => v.status === opcao.value).length,
  }))
}

// Distribuição das vagas ATIVAS pela Ação atual (funil das 10 etapas).
export function contagemPorAcao(
  vagas: Vaga[]
): Array<{ acao: AcaoVaga; label: string; total: number }> {
  const ativas = vagasAtivas(vagas)
  return acaoOptions.map((opcao) => ({
    acao: opcao.value,
    label: opcao.label,
    total: ativas.filter((v) => v.acaoAtual === opcao.value).length,
  }))
}

// Contagem por Unidade, ordenada do maior para o menor.
export function contagemPorUnidade(
  vagas: Vaga[]
): Array<{ unidade: string; total: number }> {
  const mapa = new Map<string, number>()
  for (const vaga of vagas) {
    mapa.set(vaga.unidade, (mapa.get(vaga.unidade) ?? 0) + 1)
  }
  return [...mapa.entries()]
    .map(([unidade, total]) => ({ unidade, total }))
    .sort((a, b) => b.total - a.total)
}

// Saúde de SLA sobre as vagas ATIVAS: dentro da meta (<20), em atenção
// (15–19), estourado (≥20), média de dias úteis e % dentro da meta.
// `slaDe` é injetado (lib/sla-vaga.ts): o SLA é derivado, não persistido.
export function resumoSla(
  vagas: Vaga[],
  slaDe: (vaga: Vaga) => number
): {
  total: number
  dentroMeta: number
  atencao: number
  estourado: number
  mediaDiasUteis: number
  percentualDentroMeta: number
} {
  const ativas = vagasAtivas(vagas)
  const total = ativas.length
  let atencao = 0
  let estourado = 0
  let soma = 0
  for (const vaga of ativas) {
    const sla = slaDe(vaga)
    soma += sla
    const sev = slaSeverity(sla)
    if (sev === 'estourado') estourado++
    else if (sev === 'atencao') atencao++
  }
  const dentroMeta = total - estourado
  return {
    total,
    dentroMeta,
    atencao,
    estourado,
    mediaDiasUteis: total === 0 ? 0 : Math.round(soma / total),
    percentualDentroMeta:
      total === 0 ? 0 : Math.round((dentroMeta / total) * 100),
  }
}

// Vagas ativas que precisam de atenção (em atenção ou estouradas), da mais
// crítica para a menos crítica. Retorna o SLA junto para a tela não recalcular.
export function vagasEmAtencao(
  vagas: Vaga[],
  slaDe: (vaga: Vaga) => number
): Array<{ vaga: Vaga; sla: number }> {
  return vagasAtivas(vagas)
    .map((vaga) => ({ vaga, sla: slaDe(vaga) }))
    .filter(({ sla }) => slaSeverity(sla) !== 'ok')
    .sort((a, b) => b.sla - a.sla)
}
