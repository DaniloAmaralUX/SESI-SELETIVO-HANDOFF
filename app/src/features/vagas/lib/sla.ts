import { addDays, isWeekend, startOfDay } from 'date-fns'

// Meta de SLA da Vaga: 20 dias úteis (ADR 0002).
export const SLA_META_DIAS_UTEIS = 20

export function slaSeverity(diasUteis: number): 'ok' | 'atencao' | 'estourado' {
  if (diasUteis >= SLA_META_DIAS_UTEIS) return 'estourado'
  if (diasUteis >= SLA_META_DIAS_UTEIS - 5) return 'atencao'
  return 'ok'
}

// Dias ÚTEIS decorridos APÓS `inicio` até `fim` (inclusive), excluindo fins de
// semana e os `feriados` injetados. Função pura (feriados são dado, não I/O —
// ADR 0002). Mesmo dia → 0; contagem em [inicio, fim].
export function diasUteis(inicio: Date, fim: Date, feriados: Date[]): number {
  const feriadosDia = feriados.map((f) => startOfDay(f).getTime())
  const ehFeriado = (d: Date) => feriadosDia.includes(startOfDay(d).getTime())

  let cursor = startOfDay(inicio)
  const alvo = startOfDay(fim)
  if (alvo <= cursor) return 0

  let uteis = 0
  while (cursor < alvo) {
    cursor = addDays(cursor, 1)
    if (!isWeekend(cursor) && !ehFeriado(cursor)) uteis++
  }
  return uteis
}

// Datas que o SLA precisa. Evita acoplar lib/ ao schema — injeção do mínimo.
type DatasSla = {
  dataAbertura: Date
  dataAcao: Date
  divulgacaoResultado?: Date
  dataEncerramento?: Date
}

// Fim da contagem do SLA (RF10): Divulgação do resultado (ADR 0002: congela
// lá) → senão encerramento → senão HOJE, se a vaga segue correndo. `pausada`
// (Suspensa/Congelada) congela na última ação registrada — aproximação
// enquanto o protótipo não guarda o histórico de suspensões.
export function fimContagemSla(
  datas: DatasSla,
  opts: { pausada: boolean; hoje: Date }
): Date {
  return (
    datas.divulgacaoResultado ??
    datas.dataEncerramento ??
    (opts.pausada ? datas.dataAcao : opts.hoje)
  )
}

// SLA decorrido em dias úteis. DERIVADO a cada leitura — nunca persistido —
// para uma vaga aberta refletir o tempo real até hoje (RF10).
export function calcularSlaDiasUteis(
  datas: DatasSla,
  feriados: Date[],
  opts: { pausada: boolean; hoje: Date }
): number {
  return diasUteis(datas.dataAbertura, fimContagemSla(datas, opts), feriados)
}
