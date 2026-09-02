import { Link } from '@tanstack/react-router'
import NumberFlow from '@number-flow/react'
import { ChevronRight, CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { SlaIndicator } from '@/features/vagas/components/sla-indicator'
import { StatusBadge } from '@/features/vagas/components/status-badge'
import { type Vaga } from '@/features/vagas/data/schema'
import { slaSeverity } from '@/features/vagas/lib/sla'
import { SlaDot } from './sla-dot'

// Fila de trabalho do painel: as vagas ativas em atenção ou estouradas, da
// mais crítica para a menos. Cada linha é um link direto para a vaga.

const MAX_ATENCAO = 8

type AtencaoListProps = {
  atencao: Array<{ vaga: Vaga; sla: number }>
}

export function AtencaoList({ atencao }: AtencaoListProps) {
  return (
    <Card className='h-full shadow-(--shadow-border) transition-shadow duration-200 ease-out hover:shadow-(--shadow-border-hover)'>
      <CardHeader>
        <CardTitle role='heading' aria-level={2}>
          Precisam de atenção
        </CardTitle>
        <CardAction>
          <span className='rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums'>
            <NumberFlow value={atencao.length} />
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        {atencao.length === 0 ? (
          <Empty className='py-8'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <CircleCheck className='text-sla-ok' />
              </EmptyMedia>
              <EmptyTitle>Tudo em dia</EmptyTitle>
              <EmptyDescription>
                Nenhuma vaga ativa precisa de atenção no momento.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className='flex flex-col gap-0.5'>
            {atencao.slice(0, MAX_ATENCAO).map(({ vaga, sla: dias }) => {
              const estourada = slaSeverity(dias) === 'estourado'
              return (
                <li key={vaga.id}>
                  <Link
                    to='/vagas/$vagaId'
                    params={{ vagaId: vaga.id }}
                    className='group/row -mx-3 flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors duration-150 ease-out hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
                  >
                    {/* Linha densa: cargo domina (flex-1), SLA compacto de
                        uma linha — sem barra, sem quebra */}
                    <SlaDot
                      className={cn(
                        'shrink-0',
                        estourada ? 'bg-sla-estourado' : 'bg-sla-atencao'
                      )}
                      pulse={estourada}
                    />
                    <span
                      className='min-w-0 flex-1 truncate text-sm font-medium'
                      title={vaga.cargo}
                    >
                      {vaga.cargo}
                    </span>
                    <StatusBadge
                      status={vaga.status}
                      className='shrink-0 max-sm:hidden'
                    />
                    <SlaIndicator diasUteis={dias} compacto />
                    <ChevronRight
                      aria-hidden='true'
                      className='size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-[opacity,translate] duration-200 ease-out group-hover/row:translate-x-0 group-hover/row:opacity-100'
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
      {atencao.length > MAX_ATENCAO && (
        <CardFooter>
          <Button
            variant='ghost'
            size='sm'
            asChild
            className='active:scale-[0.98]'
          >
            <Link to='/vagas'>Ver todas as vagas que precisam de atenção</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
