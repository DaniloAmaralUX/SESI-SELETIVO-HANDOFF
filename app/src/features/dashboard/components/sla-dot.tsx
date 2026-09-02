import { cn } from '@/lib/utils'

// Dot de severidade de SLA — canal visual REDUNDANTE (nunca o único: o número
// ou o SlaIndicator ao lado carregam a informação), por isso aria-hidden.
// O pulso (anel ::after expandindo, ver index.css) é reservado ao estado mais
// crítico e desligado em prefers-reduced-motion.
type SlaDotProps = {
  className?: string
  pulse?: boolean
}

export function SlaDot({ className, pulse = false }: SlaDotProps) {
  return (
    <span
      aria-hidden='true'
      className={cn(
        'relative inline-flex size-2 shrink-0 rounded-full',
        pulse && 'sla-dot-pulse',
        className
      )}
    />
  )
}
