import {
  CircleAlert,
  CircleCheck,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { SLA_META_DIAS_UTEIS, slaSeverity } from '../lib/sla'

// Indicador de SLA (design-system §5): Progress + rótulo, cores pelos tokens
// --sla-* e semântica acessível de progressbar (aria-valuenow/max).
const severityConfig: Record<
  ReturnType<typeof slaSeverity>,
  { icon: LucideIcon; texto: string; barra: string }
> = {
  ok: {
    icon: CircleCheck,
    texto: 'text-sla-ok',
    barra: '[&>[data-slot=progress-indicator]]:bg-sla-ok',
  },
  atencao: {
    icon: TriangleAlert,
    texto: 'text-sla-atencao',
    barra: '[&>[data-slot=progress-indicator]]:bg-sla-atencao',
  },
  estourado: {
    icon: CircleAlert,
    texto: 'text-sla-estourado',
    barra: '[&>[data-slot=progress-indicator]]:bg-sla-estourado',
  },
}

type SlaIndicatorProps = {
  diasUteis: number
  className?: string
}

export function SlaIndicator({ diasUteis, className }: SlaIndicatorProps) {
  const severity = severityConfig[slaSeverity(diasUteis)]
  const percentual = Math.min(
    100,
    Math.round((diasUteis / SLA_META_DIAS_UTEIS) * 100)
  )

  return (
    <span
      role='progressbar'
      aria-valuenow={diasUteis}
      aria-valuemin={0}
      aria-valuemax={SLA_META_DIAS_UTEIS}
      aria-label={`SLA: ${diasUteis} de ${SLA_META_DIAS_UTEIS} dias úteis`}
      className={cn('flex min-w-32 flex-col gap-1', className)}
    >
      <span
        className={cn(
          'flex items-center gap-1.5 font-mono text-sm font-medium tabular-nums',
          severity.texto
        )}
      >
        <severity.icon className='size-4' aria-hidden='true' />
        {diasUteis}/{SLA_META_DIAS_UTEIS} dias úteis
      </span>
      <Progress
        value={percentual}
        aria-hidden='true'
        className={cn('h-1.5 bg-muted', severity.barra)}
      />
    </span>
  )
}
