import { format } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { ptBR } from 'date-fns/locale'
import { DataTableColumnHeader } from '@/components/data-table'
import { filtroPeriodoFn } from '@/components/data-table/date-range-filter'
import { acaoOptions } from '../data/data'
import { type Vaga } from '../data/schema'
import { slaDaVaga } from '../lib/sla-vaga'
import { SlaIndicator } from './sla-indicator'
import { StatusBadge } from './status-badge'
import { VagasRowActions } from './vagas-row-actions'

// filterFn compartilhado das facetas (valor da célula ∈ seleção)
const filtroFaceta = (
  row: { getValue: (id: string) => unknown },
  id: string,
  value: unknown[]
) => value.includes(row.getValue(id))

// Contrato de colunas da lista (IA v1): Chamado, Cargo, Unidade/Área,
// Status, Ação atual, SLA, Recrutadora — sem seleção em massa neste loop.
// Área, Gestor e Data de abertura existem como colunas OCULTAS por padrão:
// alimentam os filtros (RF03) e podem ser exibidas via "Exibir colunas".
export const vagasColumns: ColumnDef<Vaga>[] = [
  {
    accessorKey: 'chamado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Chamado' />
    ),
    // py-1.5: alvo de toque ≥24px (WCAG 2.2) sem esticar a linha
    cell: ({ row }) => (
      <Link
        to='/vagas/$vagaId'
        params={{ vagaId: row.original.id }}
        className='inline-block py-1.5 font-medium hover:underline'
        data-no-row-click
      >
        {row.getValue('chamado')}
      </Link>
    ),
    enableHiding: false,
    meta: { className: 'min-w-24' },
  },
  {
    accessorKey: 'cargo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cargo' />
    ),
    // min-w em vez de max-w-0: com a tabela espremida, max-w-0 colapsava a
    // célula a zero e o cabeçalho vazava sobre o vizinho ("Cargunidade/Área")
    meta: { label: 'Cargo', className: 'w-1/3 min-w-44 max-w-64' },
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='truncate font-medium' title={row.getValue('cargo')}>
          {row.getValue('cargo')}
        </span>
        {row.original.funcao && (
          <span
            className='truncate text-xs text-muted-foreground'
            title={row.original.funcao}
          >
            {row.original.funcao}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'unidade',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Unidade / Área' />
    ),
    meta: { label: 'Unidade / Área', className: 'min-w-36' },
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span>{row.getValue('unidade')}</span>
        <span className='text-xs text-muted-foreground'>
          {row.original.area}
        </span>
      </div>
    ),
    filterFn: filtroFaceta,
  },
  {
    accessorKey: 'area',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Área' />
    ),
    meta: { label: 'Área' },
    filterFn: filtroFaceta,
  },
  {
    accessorKey: 'gestorSolicitante',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Gestor' />
    ),
    meta: { label: 'Gestor' },
    filterFn: filtroFaceta,
  },
  {
    accessorKey: 'dataAbertura',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Abertura' />
    ),
    meta: { label: 'Abertura' },
    cell: ({ row }) =>
      format(row.original.dataAbertura, 'dd/MM/yyyy', { locale: ptBR }),
    filterFn: filtroPeriodoFn,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    meta: { label: 'Status', className: 'min-w-28' },
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'acaoAtual',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ação atual' />
    ),
    meta: { label: 'Ação atual', className: 'min-w-36' },
    cell: ({ row }) => {
      const acao = acaoOptions.find(
        (option) => option.value === row.getValue('acaoAtual')
      )

      if (!acao) {
        return null
      }

      return (
        <div className='flex items-center gap-2'>
          <acao.icon className='size-4 text-muted-foreground' />
          <span>{acao.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'sla',
    // SLA derivado em runtime (lib/sla-vaga.ts) — nunca lido de campo gravado
    accessorFn: (vaga) => slaDaVaga(vaga),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='SLA' />
    ),
    meta: { label: 'SLA', className: 'min-w-36' },
    cell: ({ row }) => (
      <SlaIndicator
        diasUteis={row.getValue('sla')}
        encerrada={['finalizada', 'cancelada', 'arquivada'].includes(
          row.original.status
        )}
      />
    ),
  },
  {
    accessorKey: 'recrutadora',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Recrutadora' />
    ),
    meta: { label: 'Recrutadora' },
    cell: ({ row }) => <span>{row.getValue('recrutadora')}</span>,
    filterFn: filtroFaceta,
  },
  {
    id: 'acoes',
    header: () => <span className='sr-only'>Ações</span>,
    // data-no-row-click: o clique no kebab não navega para o detalhe
    cell: ({ row }) => (
      <div data-no-row-click className='flex justify-end'>
        <VagasRowActions vaga={row.original} />
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
    meta: { className: 'w-12' },
  },
]

// Visibilidade inicial: colunas de filtro ficam ocultas para manter a lista
// enxuta (decisão de design — 7 colunas visíveis)
export const vagasColumnVisibility = {
  area: false,
  gestorSolicitante: false,
  dataAbertura: false,
}
