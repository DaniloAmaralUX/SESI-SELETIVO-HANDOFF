import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

// Ranking de vagas ATIVAS por Unidade (já vem ordenado do maior para o menor):
// posição numerada + barra proporcional ao líder. O líder é o único em cor
// cheia — hierarquia dentro da própria lista.

type UnidadeRankingProps = {
  porUnidade: Array<{ unidade: string; total: number }>
}

export function UnidadeRanking({ porUnidade }: UnidadeRankingProps) {
  const maior = Math.max(...porUnidade.map((item) => item.total), 1)
  const soma = porUnidade.reduce((acc, item) => acc + item.total, 0)

  return (
    <Card
      size='sm'
      className='h-full shadow-(--shadow-border) transition-shadow duration-200 ease-out hover:shadow-(--shadow-border-hover)'
    >
      <CardHeader>
        <CardTitle role='heading' aria-level={2}>
          Vagas ativas por unidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        {porUnidade.length === 0 ? (
          <Empty className='py-8'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <Building2 />
              </EmptyMedia>
              <EmptyTitle>Nenhuma vaga ativa</EmptyTitle>
              <EmptyDescription>
                As vagas em andamento aparecem aqui distribuídas por Unidade.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ol className='flex flex-col gap-3'>
            {porUnidade.map((item, index) => {
              // Empate no topo: todos os empatados recebem o tratamento de
              // líder (distinção visual sem distinção real engana)
              const lider = item.total === maior
              const share =
                soma === 0 ? 0 : Math.round((item.total / soma) * 100)
              return (
                <li key={item.unidade} className='flex flex-col gap-1'>
                  <div className='flex items-center gap-2'>
                    <span className='w-5 font-mono text-xs text-muted-foreground tabular-nums'>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'truncate text-sm',
                        lider
                          ? 'font-medium text-foreground'
                          : 'text-muted-foreground'
                      )}
                      title={item.unidade}
                    >
                      {item.unidade}
                    </span>
                    <span className='ms-auto flex items-baseline gap-1'>
                      <span className='text-sm font-medium tabular-nums'>
                        {item.total}
                      </span>
                      <span className='text-xs text-muted-foreground tabular-nums'>
                        {`· ${share}%`}
                      </span>
                    </span>
                  </div>
                  <div
                    aria-hidden='true'
                    className='h-1.5 rounded-full bg-muted'
                  >
                    <div
                      className={cn(
                        'h-full rounded-full transition-[width] duration-300 ease-out',
                        lider ? 'bg-primary' : 'bg-primary/60'
                      )}
                      style={{ width: `${(item.total / maior) * 100}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
