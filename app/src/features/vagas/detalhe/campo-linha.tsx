import { type ReactNode } from 'react'

type CampoLinhaProps = {
  label: string
  children?: ReactNode
}

// Par label + valor dos grids de detalhe. Valor ausente vira '—'.
export function CampoLinha({ label, children }: CampoLinhaProps) {
  const vazio = children === undefined || children === null || children === ''
  return (
    <div className='space-y-1'>
      <dt className='text-sm text-muted-foreground'>{label}</dt>
      <dd className='text-sm font-medium'>{vazio ? '—' : children}</dd>
    </div>
  )
}
