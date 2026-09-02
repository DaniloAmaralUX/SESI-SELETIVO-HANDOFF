import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { statusOptions } from '../data/data'
import { type StatusVaga } from '../data/schema'

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

type StatusBadgeProps = {
  status: StatusVaga
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const option = statusOptions.find((o) => o.value === status)

  return (
    <Badge
      className={cn(
        // Contraste garantido por auditoria (WCAG AA + APCA Lc>=60) contra
        // todos os --status-*; o par é o token --status-foreground do theme.css.
        'border-transparent text-status-foreground',
        statusBgClass[status],
        className
      )}
    >
      {option?.label ?? status}
    </Badge>
  )
}
