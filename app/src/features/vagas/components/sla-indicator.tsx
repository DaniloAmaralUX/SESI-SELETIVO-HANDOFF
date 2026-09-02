import {
  CircleAlert,
  CircleCheck,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { SLA_META_DIAS_UTEIS, slaSeverity } from '../lib/sla'

// Indicador de SLA (design-system §5): Progress + rótulo, cores pelos tokens
// --sla-* e semântica acessível de progressbar (aria-valuenow/max).
const severityConfig: Record<
  ReturnType<typeof slaSeverity>,
  { icon: LucideIcon; texto: string; barra: string }
> = {
  ok: {
    icon: CircleCheck,
    texto: 'text-sla-ok',
    barra: '[&>[data-slot=progress-indicator]]:bg-sla-ok',
  },
  atencao: {
    icon: TriangleAlert,
    texto: 'text-sla-atencao',
    barra: '[&>[data-slot=progress-indicator]]:bg-sla-atencao',
  },
  estourado: {
    icon: CircleAlert,
    texto: 'text-sla-estourado',
    barra: '[&>[data-slot=progress-indicator]]:bg-sla-estourado',
  },
}

// Descrição da severidade para leitores de tela (aria-valuetext)
const severidadeDescricao: Record<ReturnType<typeof slaSeverity>, string> = {
  ok: 'dentro do prazo',
  atencao: 'em atenção',
  estourado: 'prazo estourado',
}

type SlaIndicatorProps = {
  diasUteis: number
  className?: string
  /** Variante densa p/ listas: só ícone + contagem, sem barra */
  compacto?: boolean
  /**
   * Processo já encerrado: o número vira registro histórico ("levou 20+6"),
   * então o alarme colorido sai de cena — cor é para o que ainda pede ação.
   * Sem isso a tabela vira um mar de vermelho de vagas finalizadas.
   */
  encerrada?: boolean
}

export function SlaIndicator({
  diasUteis,
  className,
  compacto = false,
  encerrada = false,
}: SlaIndicatorProps) {
  const severidade = slaSeverity(diasUteis)
  const severity = severityConfig[severidade]
  const percentual = Math.min(
    100,
    Math.round((diasUteis / SLA_META_DIAS_UTEIS) * 100)
  )
  // Estouro além da meta como excedente ("20+8"), nunca "161/20" —
  // numerador maior que o denominador lê como erro
  const rotulo =
    diasUteis > SLA_META_DIAS_UTEIS
      ? `${SLA_META_DIAS_UTEIS}+${diasUteis - SLA_META_DIAS_UTEIS}`
      : `${diasUteis}/${SLA_META_DIAS_UTEIS}`

  return (
    <span
      role='progressbar'
      aria-valuenow={Math.min(diasUteis, SLA_META_DIAS_UTEIS)}
      aria-valuemin={0}
      aria-valuemax={SLA_META_DIAS_UTEIS}
      aria-valuetext={`${diasUteis} de ${SLA_META_DIAS_UTEIS} dias úteis, ${severidadeDescricao[severidade]}${encerrada ? ', processo encerrado' : ''}`}
      aria-label='SLA'
      className={cn(
        'flex flex-col gap-1',
        compacto ? 'shrink-0' : 'min-w-32',
        className
      )}
    >
      <span
        className={cn(
          'flex items-center gap-1.5 font-mono text-sm font-medium whitespace-nowrap tabular-nums',
          encerrada ? 'text-muted-foreground' : severity.texto
        )}
      >
        <severity.icon className='size-4' aria-hidden='true' />
        {compacto ? rotulo : `${rotulo} dias úteis`}
      </span>
      {!compacto && (
        <Progress
          value={percentual}
          aria-hidden='true'
          className={cn(
            'h-1.5 bg-muted',
            encerrada
              ? '[&>[data-slot=progress-indicator]]:bg-muted-foreground/40'
              : severity.barra
          )}
        />
      )}
    </span>
  )
}
