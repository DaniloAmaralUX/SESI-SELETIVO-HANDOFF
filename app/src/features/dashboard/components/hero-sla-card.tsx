import NumberFlow from '@number-flow/react'
import { Briefcase, Timer } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SLA_META_DIAS_UTEIS } from '@/features/vagas/lib/sla'
import { SlaDot } from './sla-dot'

// Célula-herói do bento: a ÚNICA resposta que a Gestora precisa primeiro
// ("estamos dentro da meta?") em nível A de hierarquia — número dominante,
// tensão (estouradas/atenção) à direita e contexto secundário no rodapé.
// Sem gauge: em percentuais baixos ele virava um risco solto que enfraquecia
// o número; a barra segmentada abaixo já é o "medidor" visual.

type ResumoSla = {
  total: number
  dentroMeta: number
  atencao: number
  estourado: number
  mediaDiasUteis: number
  percentualDentroMeta: number
}

export function HeroSlaCard({ sla }: { sla: ResumoSla }) {
  const pct = sla.percentualDentroMeta
  const ok = sla.total - sla.atencao - sla.estourado
  const segmentos = [
    { chave: 'ok', total: ok, cor: 'bg-sla-ok' },
    { chave: 'atencao', total: sla.atencao, cor: 'bg-sla-atencao' },
    { chave: 'estourado', total: sla.estourado, cor: 'bg-sla-estourado' },
  ].filter((s) => s.total > 0)

  return (
    <Card className='relative h-full overflow-hidden shadow-(--shadow-border) ring-primary/15 transition-shadow duration-200 ease-out hover:shadow-(--shadow-border-hover) dark:ring-primary/25'>
      {/* Único card com fundo tingido — reforça o ponto focal da página */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.07] to-transparent dark:from-primary/[0.14]'
      />
      {/* Título neutro ("Saúde do SLA"): o card carrega notícia boa E má —
          "Dentro da meta" vira o rótulo do número, não a promessa do card */}
      <CardHeader className='relative'>
        <CardTitle role='heading' aria-level={2}>
          Saúde do SLA
        </CardTitle>
        <CardDescription>
          {`Meta de ${SLA_META_DIAS_UTEIS} dias úteis por vaga ativa`}
        </CardDescription>
      </CardHeader>
      <CardContent className='relative flex flex-1 flex-col justify-between gap-6'>
        {/* Nível A + tensão lado a lado por PROXIMIDADE (não empurrada
            à borda): o painel de tensão é uma região comum própria */}
        <div className='flex flex-wrap items-center gap-x-12 gap-y-6'>
          <div className='min-w-0'>
            <p className='text-xs font-medium tracking-wider text-muted-foreground uppercase'>
              Dentro da meta
            </p>
            <div className='font-heading text-5xl font-semibold tracking-tight tabular-nums xl:text-6xl'>
              {sla.total === 0 ? '—' : <NumberFlow value={pct} suffix='%' />}
            </div>
            <p className='text-sm text-muted-foreground'>
              {`${sla.dentroMeta} de ${sla.total} ${
                sla.total === 1 ? 'vaga ativa' : 'vagas ativas'
              }`}
            </p>
          </div>

          {/* Nível B (tensão): painel com fundo próprio ancora o bloco */}
          <div className='flex flex-col gap-3 rounded-2xl bg-background/50 px-5 py-4 ring-1 ring-border/60'>
            <div className='flex items-center justify-between gap-6'>
              <span className='flex items-center gap-2 text-xs text-muted-foreground'>
                <SlaDot
                  className='bg-sla-estourado'
                  pulse={sla.estourado > 0}
                />
                Estouradas
              </span>
              <span className='text-2xl font-semibold text-sla-estourado tabular-nums'>
                <NumberFlow value={sla.estourado} />
              </span>
            </div>
            <div className='flex items-center justify-between gap-6'>
              <span className='flex items-center gap-2 text-xs text-muted-foreground'>
                <SlaDot className='bg-sla-atencao' />
                Em atenção
              </span>
              <span className='text-2xl font-semibold text-sla-atencao tabular-nums'>
                <NumberFlow value={sla.atencao} />
              </span>
            </div>
          </div>
        </div>

        {/* Mini barra segmentada de SLA — decorativa, números já visíveis acima */}
        {sla.total > 0 && (
          <div aria-hidden='true' className='flex h-2 w-full gap-0.5'>
            {segmentos.map((segmento) => (
              <div
                key={segmento.chave}
                className={`h-full min-w-1 rounded-[3px] first:rounded-s-full last:rounded-e-full ${segmento.cor}`}
                style={{ width: `${(segmento.total / sla.total) * 100}%` }}
              />
            ))}
          </div>
        )}

        {/* Nível C: contexto operacional */}
        <div className='mt-2 flex flex-wrap gap-x-8 gap-y-2 border-t pt-4'>
          <div className='flex items-center gap-2'>
            <Briefcase
              className='size-4 text-muted-foreground'
              aria-hidden='true'
            />
            <span className='text-xs text-muted-foreground'>Vagas ativas</span>
            <span className='text-sm font-medium tabular-nums'>
              <NumberFlow value={sla.total} />
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Timer
              className='size-4 text-muted-foreground'
              aria-hidden='true'
            />
            <span className='text-xs text-muted-foreground'>
              Tempo médio (dias úteis)
            </span>
            <span className='text-sm font-medium tabular-nums'>
              <NumberFlow value={sla.mediaDiasUteis} />
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
