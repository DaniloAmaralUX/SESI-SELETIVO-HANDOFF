import { type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { podeVerDadosSensiveis, usePapel } from '../lib/papel'

// 🔒 Dado sensível de candidato (LGPD): só Admin vê o valor (B7).
export function CampoSensivel({ children }: { children?: ReactNode }) {
  const papel = usePapel()

  if (podeVerDadosSensiveis(papel)) {
    return <>{children ?? '—'}</>
  }

  return (
    <span className='inline-flex items-center gap-2'>
      <span aria-hidden='true'>•••••</span>
      <span className='sr-only'>
        Dado sensível — visível apenas para Administrador
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* tabIndex: o Tooltip do Radix abre no foco (teclado) */}
          <Badge variant='outline' tabIndex={0} className='cursor-default'>
            LGPD
          </Badge>
        </TooltipTrigger>
        <TooltipContent>Visível apenas para Administrador</TooltipContent>
      </Tooltip>
    </span>
  )
}
