import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type CampoLinhaProps = {
  label: string
  children?: ReactNode
  className?: string
}

// Par label + valor dos grids de detalhe. Valor ausente vira '—'.
export function CampoLinha({ label, children, className }: CampoLinhaProps) {
  const vazio = children === undefined || children === null || children === ''
  return (
    <div className={cn('space-y-1', className)}>
      <dt className='text-sm text-muted-foreground'>{label}</dt>
      <dd className='text-sm font-medium'>{vazio ? '—' : children}</dd>
    </div>
  )
}
