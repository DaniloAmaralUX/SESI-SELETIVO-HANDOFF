import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowRight,
  FileUp,
  History,
  Pencil,
  PlusCircle,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { type EventoHistorico } from '../data/schema'

const ICONE_POR_TIPO: Record<EventoHistorico['tipo'], LucideIcon> = {
  criacao: PlusCircle,
  edicao: Pencil,
  'mudanca-status': RefreshCw,
  'mudanca-acao': ArrowRight,
  importacao: FileUp,
}

// Trilha de alterações da Vaga (RF16/RF17): quem fez o quê e quando, do mais
// recente para o mais antigo. Somente leitura — a trilha é gravada pelo store.
export function HistoricoTimeline({ eventos }: { eventos: EventoHistorico[] }) {
  if (eventos.length === 0) {
    return (
      <Empty className='py-12'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <History />
          </EmptyMedia>
          <EmptyTitle>Nenhum registro por enquanto</EmptyTitle>
          <EmptyDescription>
            As alterações feitas nesta vaga aparecerão aqui automaticamente.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const ordenados = [...eventos].sort((a, b) => b.em.getTime() - a.em.getTime())

  return (
    <ol className='space-y-0'>
      {ordenados.map((evento, indice) => {
        const Icone = ICONE_POR_TIPO[evento.tipo]
        const ultimo = indice === ordenados.length - 1
        return (
          <li key={`${evento.em.getTime()}-${indice}`} className='flex gap-3'>
            <div className='flex flex-col items-center'>
              <span className='flex size-8 shrink-0 items-center justify-center rounded-full border text-muted-foreground'>
                <Icone className='size-4' />
              </span>
              {!ultimo && (
                <span className='w-px flex-1 bg-border' aria-hidden='true' />
              )}
            </div>
            <div className={ultimo ? 'pb-0' : 'pb-6'}>
              <p className='pt-1.5 text-sm text-foreground'>
                {evento.descricao}
              </p>
              <p className='text-xs text-muted-foreground'>
                {evento.por} ·{' '}
                {format(evento.em, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
