import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { statusOptions } from '../data/data'
import { type StatusVaga } from '../data/schema'

// Mapa estático — o Tailwind só gera classes escritas por extenso
const statusBgClass: Record<StatusVaga, string> = {
  aberta: 'bg-status-aberta',
  suspensa: 'bg-status-suspensa',
  congelada: 'bg-status-congelada',
  cancelada: 'bg-status-cancelada',
  finalizada: 'bg-status-finalizada',
  arquivada: 'bg-status-arquivada',
}

type StatusBadgeProps = {
  status: StatusVaga
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const option = statusOptions.find((o) => o.value === status)

  return (
    <Badge
      className={cn(
        // Premissa: todos os tokens --status-* contrastam com branco (claro)
        // e neutro-950 (escuro). Se algum token clarear, expor pares
        // --status-*-foreground no theme.css e usar aqui.
        'border-transparent text-white dark:text-neutral-950',
        statusBgClass[status],
        className
      )}
    >
      {option?.label ?? status}
    </Badge>
  )
}
