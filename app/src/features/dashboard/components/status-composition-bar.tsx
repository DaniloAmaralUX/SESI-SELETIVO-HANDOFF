import NumberFlow from '@number-flow/react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type StatusVaga } from '@/features/vagas/data/schema'

// Composição de TODAS as vagas por status numa única barra segmentada — uma
// leitura de proporção (parte-de-um-todo), no lugar do gráfico de barras que
// repetia a forma do pipeline. Legenda completa embaixo (os 7 status sempre).

// Mapa estático — o Tailwind só gera classes escritas por extenso
const statusBgClass: Record<StatusVaga, string> = {
  rascunho: 'bg-status-rascunho',
  aberta: 'bg-status-aberta',
  suspensa: 'bg-status-suspensa',
  congelada: 'bg-status-congelada',
  cancelada: 'bg-status-cancelada',
  finalizada: 'bg-status-finalizada',
  arquivada: 'bg-status-arquivada',
}

type StatusCompositionBarProps = {
  porStatus: Array<{ status: StatusVaga; label: string; total: number }>
}

export function StatusCompositionBar({ porStatus }: StatusCompositionBarProps) {
  const total = porStatus.reduce((soma, item) => soma + item.total, 0)
  const pctDe = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100))
  const segmentos = porStatus.filter((item) => item.total > 0)

  return (
    <Card className='shadow-(--shadow-border) transition-shadow duration-200 ease-out hover:shadow-(--shadow-border-hover)'>
      <CardHeader>
        <CardTitle role='heading' aria-level={2}>
          Vagas por status
        </CardTitle>
        <CardDescription>
          Composição de todas as vagas pela situação atual
        </CardDescription>
        <CardAction>
          <span className='text-2xl font-semibold tabular-nums'>
            <NumberFlow value={total} />
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        {total > 0 && (
          <div
            role='img'
            aria-label={`Composição: ${porStatus
              .map(
                (item) => `${item.label} ${item.total} (${pctDe(item.total)}%)`
              )
              .join(', ')}`}
            className='group/bar flex h-3 w-full gap-0.5'
          >
            {segmentos.map((item) => (
              <Tooltip key={item.status}>
                <TooltipTrigger asChild>
                  <div
                    aria-hidden='true'
                    className={`h-full min-w-1 rounded-[3px] transition-opacity duration-150 ease-out group-hover/bar:opacity-40 first:rounded-s-full last:rounded-e-full hover:opacity-100! ${statusBgClass[item.status]}`}
                    style={{ width: `${(item.total / total) * 100}%` }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {`${item.label} — ${item.total} ${
                    item.total === 1 ? 'vaga' : 'vagas'
                  } (${pctDe(item.total)}%)`}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        <div className='mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4'>
          {porStatus.map((item) => (
            <div key={item.status} className='flex items-center gap-1.5'>
              <span
                aria-hidden='true'
                className={`size-2 shrink-0 rounded-full ${statusBgClass[item.status]}`}
              />
              <span className='truncate text-xs text-muted-foreground'>
                {item.label}
              </span>
              <span className='text-sm font-medium tabular-nums'>
                {item.total}
              </span>
              <span className='text-xs text-muted-foreground'>
                {`(${pctDe(item.total)}%)`}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
