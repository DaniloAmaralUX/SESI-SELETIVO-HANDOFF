import { type Vaga } from '../data/schema'
import { feriadosDaUnidadeNoIntervalo } from './feriados'
import { calcularSlaDiasUteis, diasUteis, fimContagemSla } from './sla'

// Adaptador Vaga → motor de SLA: injeta os feriados da Unidade e a regra de
// pausa (Suspensa/Congelada não avançam — CONTEXT.md). É a ÚNICA forma de ler
// o SLA de uma Vaga: derivado a cada leitura, nunca persistido (RF10).
export function slaDaVaga(vaga: Vaga, hoje: Date = new Date()): number {
  // Rascunho = processo ainda não entrou em andamento; o SLA não corre.
  if (vaga.status === 'rascunho') return 0
  const pausada = vaga.status === 'suspensa' || vaga.status === 'congelada'
  const fim = fimContagemSla(vaga, { pausada, hoje })
  return calcularSlaDiasUteis(
    vaga,
    feriadosDaUnidadeNoIntervalo(vaga.unidade, vaga.dataAbertura, fim),
    { pausada, hoje }
  )
}

// Tempo do gestor: MEDIÇÃO (não SLA — CONTEXT.md) em dias ÚTEIS (B2), do
// encaminhamento ao retorno. undefined enquanto as duas datas não existem.
export function tempoDoGestorDiasUteis(
  vaga: Vaga,
  hoje: Date = new Date()
): number | undefined {
  if (!vaga.dataEncaminhamentoGestor) return undefined
  const fim = vaga.dataRetornoGestor ?? hoje
  return diasUteis(
    vaga.dataEncaminhamentoGestor,
    fim,
    feriadosDaUnidadeNoIntervalo(
      vaga.unidade,
      vaga.dataEncaminhamentoGestor,
      fim
    )
  )
}

// Tempo do jurídico: MEDIÇÃO (não SLA) em dias ÚTEIS, da abertura do chamado
// ao recebimento do parecer. undefined enquanto não há abertura.
export function tempoDoJuridicoDiasUteis(
  vaga: Vaga,
  hoje: Date = new Date()
): number | undefined {
  if (!vaga.aberturaChamadoJuridico) return undefined
  const fim = vaga.recebimentoParecerJuridico ?? hoje
  return diasUteis(
    vaga.aberturaChamadoJuridico,
    fim,
    feriadosDaUnidadeNoIntervalo(
      vaga.unidade,
      vaga.aberturaChamadoJuridico,
      fim
    )
  )
}
