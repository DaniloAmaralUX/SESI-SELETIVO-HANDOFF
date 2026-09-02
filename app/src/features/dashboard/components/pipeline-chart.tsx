import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { acaoOptions } from '@/features/vagas/data/data'
import { type AcaoVaga } from '@/features/vagas/data/schema'

// Funil das 10 etapas como colunas lado a lado (leitura de fluxo, esquerda →
// direita), sem recharts: a comparação aqui é grosseira de propósito — o que
// importa é ONDE o trabalho se acumula. A etapa com mais vagas ganha o selo
// de gargalo (único ponto de cor cheia).

type PipelineChartProps = {
  porAcao: Array<{ acao: AcaoVaga; label: string; total: number }>
}

export function PipelineChart({ porAcao }: PipelineChartProps) {
  const maior = Math.max(...porAcao.map((item) => item.total), 1)
  const temVagas = porAcao.some((item) => item.total > 0)
  // Gargalo: maior total (primeira etapa em caso de empate); só com vaga ativa
  const gargalo = temVagas
    ? porAcao.find((item) => item.total === maior)?.acao
    : undefined

  return (
    <Card className='h-full shadow-(--shadow-border) transition-shadow duration-200 ease-out hover:shadow-(--shadow-border-hover)'>
      <CardHeader>
        <CardTitle role='heading' aria-level={2}>
          Pipeline por etapa
        </CardTitle>
        <CardDescription>
          Onde estão as vagas ativas, da solicitação à admissão
        </CardDescription>
      </CardHeader>
      <CardContent className='overflow-x-auto'>
        {/* 10 etapas não cabem em larguras médias — o card rolava cortado;
            scroll próprio com largura mínima preserva a leitura do fluxo */}
        <ol
          aria-label='Pipeline por etapa, da solicitação à admissão'
          className='flex min-w-2xl items-end gap-1 border-b sm:gap-1.5'
        >
          {porAcao.map((item) => {
            const ehGargalo = item.acao === gargalo
            const Icone = acaoOptions.find(
              (opcao) => opcao.value === item.acao
            )?.icon
            return (
              <Tooltip key={item.acao}>
                <TooltipTrigger asChild>
                  <li
                    className={cn(
                      'group/etapa relative flex flex-1 flex-col items-center gap-1.5 rounded-xl p-1.5 pt-2 transition-colors duration-150 ease-out hover:bg-muted/60',
                      ehGargalo && 'bg-primary/5 ring-1 ring-primary/20'
                    )}
                  >
                    {ehGargalo && (
                      <span className='text-[10px] font-medium text-primary'>
                        Gargalo
                      </span>
                    )}
                    <span
                      className={cn(
                        'text-sm font-semibold tabular-nums',
                        item.total === 0 && 'text-muted-foreground'
                      )}
                    >
                      {item.total}
                    </span>
                    <div className='flex h-24 w-full items-end px-1 xl:h-28'>
                      <div
                        aria-hidden='true'
                        className={cn(
                          'w-full rounded-t-md transition-[height,background-color] duration-300 ease-out',
                          ehGargalo
                            ? 'bg-primary group-hover/etapa:bg-primary'
                            : 'bg-primary/25 group-hover/etapa:bg-primary/40 dark:bg-primary/35'
                        )}
                        style={{
                          height: `max(4px, ${(item.total / maior) * 100}%)`,
                        }}
                      />
                    </div>
                    <span className='line-clamp-2 hidden text-center text-[11px] leading-tight text-muted-foreground sm:block'>
                      {item.label}
                    </span>
                    {/* No mobile o rótulo visível é o ícone; o texto segue no
                        acessibility tree via sr-only */}
                    <span className='sr-only sm:hidden'>{item.label}</span>
                    {Icone && (
                      <Icone
                        aria-hidden='true'
                        className='size-3.5 text-muted-foreground sm:hidden'
                      />
                    )}
                  </li>
                </TooltipTrigger>
                <TooltipContent>
                  {`${item.label} — ${item.total} ${
                    item.total === 1 ? 'vaga' : 'vagas'
                  }`}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
