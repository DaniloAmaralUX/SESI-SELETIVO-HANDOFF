import { Link } from '@tanstack/react-router'
import { type Table as TanstackTable } from '@tanstack/react-table'
import { acaoOptions } from '../data/data'
import { type Vaga } from '../data/schema'
import { SlaIndicator } from './sla-indicator'
import { StatusBadge } from './status-badge'
import { VagasRowActions } from './vagas-row-actions'

// Lista de cards <md — a tabela de 7 colunas não cabe em 390px e escondia o
// SLA (protagonista da tela, docs §1). Cada card responde "essa vaga precisa
// de mim?" num olhar: chamado + cargo + status + SLA compacto + ação atual,
// com o mesmo kebab da tabela. Usa as linhas JÁ filtradas/ordenadas/paginadas
// da instância da tabela — toolbar, contador e paginação são compartilhados.
export function VagasCards({ table }: { table: TanstackTable<Vaga> }) {
  const linhas = table.getRowModel().rows

  if (linhas.length === 0) return null

  return (
    <ol className='flex flex-col gap-2'>
      {linhas.map((row) => {
        const vaga = row.original
        const acao = acaoOptions.find((o) => o.value === vaga.acaoAtual)
        const encerrada = ['finalizada', 'cancelada', 'arquivada'].includes(
          vaga.status
        )
        return (
          <li key={row.id} className='relative rounded-lg border bg-card p-3'>
            <div className='flex items-start justify-between gap-2'>
              <div className='min-w-0'>
                {/* Link cobre o card via ::after — alvo grande (WCAG 2.2);
                    o kebab fica acima pelo z-index */}
                <Link
                  to='/vagas/$vagaId'
                  params={{ vagaId: vaga.id }}
                  className='text-sm font-medium after:absolute after:inset-0 hover:underline'
                >
                  {vaga.chamado}
                </Link>
                {/* title: truncate esconde conteúdo — o valor completo fica
                    alcançável (better-typography) */}
                <p className='truncate font-medium' title={vaga.cargo}>
                  {vaga.cargo}
                </p>
                <p
                  className='truncate text-xs text-muted-foreground'
                  title={`${vaga.unidade} · ${vaga.area}`}
                >
                  {vaga.unidade} · {vaga.area}
                </p>
              </div>
              <div className='relative z-10 shrink-0'>
                <VagasRowActions vaga={vaga} />
              </div>
            </div>
            <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5'>
              <StatusBadge status={vaga.status} />
              <SlaIndicator
                diasUteis={row.getValue('sla')}
                encerrada={encerrada}
                compacto
              />
              {acao && (
                <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <acao.icon className='size-3.5' aria-hidden='true' />
                  {acao.label}
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
