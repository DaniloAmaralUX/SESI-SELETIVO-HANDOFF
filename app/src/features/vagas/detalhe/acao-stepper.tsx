import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { acaoOptions } from '../data/data'
import { type AcaoVaga } from '../data/schema'

type AcaoStepperProps = {
  acaoAtual: AcaoVaga
  dataAcao: Date
}

// Stepper vertical das 10 etapas ordenadas do processo (ADR 0001):
// concluídas (< atual), atual (destaque) e futuras (muted).
export function AcaoStepper({ acaoAtual, dataAcao }: AcaoStepperProps) {
  const indiceAtual = acaoOptions.findIndex(
    (opcao) => opcao.value === acaoAtual
  )

  return (
    <ol className='space-y-0'>
      {acaoOptions.map((opcao, indice) => {
        const concluida = indice < indiceAtual
        const atual = indice === indiceAtual
        const ultima = indice === acaoOptions.length - 1
        const Icone = opcao.icon

        return (
          <li key={opcao.value} className='flex gap-3'>
            <div className='flex flex-col items-center'>
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full border',
                  concluida &&
                    'border-primary bg-primary text-primary-foreground',
                  atual && 'border-primary text-primary ring-2 ring-primary/30',
                  !concluida && !atual && 'border-border text-muted-foreground'
                )}
                aria-current={atual ? 'step' : undefined}
              >
                {concluida ? (
                  <Check className='size-4' />
                ) : (
                  <Icone className='size-4' />
                )}
              </span>
              {!ultima && (
                <span
                  className={cn(
                    'w-px flex-1',
                    concluida ? 'bg-primary' : 'bg-border'
                  )}
                  aria-hidden='true'
                />
              )}
            </div>
            <div className={cn('pb-6', ultima && 'pb-0')}>
              <p
                className={cn(
                  'pt-1.5 text-sm',
                  atual && 'font-semibold text-foreground',
                  concluida && 'text-foreground',
                  !concluida && !atual && 'text-muted-foreground'
                )}
              >
                {opcao.label}
              </p>
              {atual && (
                <p className='text-xs text-muted-foreground'>
                  Ação atual desde{' '}
                  {format(dataAcao, 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
