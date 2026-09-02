import NumberFlow from '@number-flow/react'
import { cn } from '@/lib/utils'
import { STATUS_LABELS } from '@/features/vagas/data/campos'
import { type StatusVaga } from '@/features/vagas/data/schema'

// Ranking de barras da dimensão — mesma linguagem visual do "Vagas por
// unidade" do painel (posição em mono + barra proporcional ao líder + total e
// share%), substituindo o bar chart do recharts: um formato por papel da
// informação, consistente entre as telas, sem dependência de chart lib.

const STATUS_FILL: Record<StatusVaga, string> = {
  rascunho: 'var(--color-status-rascunho)',
  aberta: 'var(--color-status-aberta)',
  suspensa: 'var(--color-status-suspensa)',
  congelada: 'var(--color-status-congelada)',
  cancelada: 'var(--color-status-cancelada)',
  finalizada: 'var(--color-status-finalizada)',
  arquivada: 'var(--color-status-arquivada)',
}

// linha.chave carrega o LABEL do status — mapa label→token
const FILL_POR_LABEL: Record<string, string> = Object.fromEntries(
  (Object.entries(STATUS_LABELS) as Array<[StatusVaga, string]>).map(
    ([status, label]) => [label, STATUS_FILL[status]]
  )
)

type RankingDimensaoProps = {
  linhas: Array<{ chave: string; total: number }>
  /** Colore as barras pelos tokens de status quando a dimensão é "status" */
  porStatus?: boolean
}

export function RankingDimensao({
  linhas,
  porStatus = false,
}: RankingDimensaoProps) {
  const maior = Math.max(...linhas.map((l) => l.total), 1)
  const soma = linhas.reduce((acc, l) => acc + l.total, 0)

  return (
    <ol className='flex flex-col gap-3'>
      {linhas.map((linha, indice) => {
        // Empate no topo: todos os empatados recebem o tratamento de líder
        const lider = linha.total === maior
        const share = soma === 0 ? 0 : Math.round((linha.total / soma) * 100)
        return (
          <li key={linha.chave} className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <span className='w-5 font-mono text-xs text-muted-foreground tabular-nums'>
                {String(indice + 1).padStart(2, '0')}
              </span>
              <span
                className={cn(
                  'truncate text-sm',
                  lider
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                )}
                title={linha.chave}
              >
                {linha.chave}
              </span>
              <span className='ms-auto flex items-baseline gap-1'>
                {/* NumberFlow: os totais rolam ao trocar de dimensão —
                    movimento comunica "os dados mudaram" (Emil: com propósito) */}
                <span className='text-sm font-medium tabular-nums'>
                  <NumberFlow value={linha.total} />
                </span>
                <span className='text-xs text-muted-foreground tabular-nums'>
                  ·&nbsp;
                  <NumberFlow value={share} suffix='%' />
                </span>
              </span>
            </div>
            <div aria-hidden='true' className='h-1.5 rounded-full bg-muted'>
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-300 ease-out',
                  !porStatus && (lider ? 'bg-primary' : 'bg-primary/60')
                )}
                style={{
                  width: `${(linha.total / maior) * 100}%`,
                  ...(porStatus
                    ? { backgroundColor: FILL_POR_LABEL[linha.chave] }
                    : {}),
                }}
              />
            </div>
          </li>
        )
      })}
    </ol>
  )
}
