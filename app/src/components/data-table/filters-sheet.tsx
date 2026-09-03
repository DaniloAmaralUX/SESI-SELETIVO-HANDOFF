import { type Table } from '@tanstack/react-table'
import { ListFilter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { DataTableDateRangeFilter } from './date-range-filter'
import { DataTableFacetedFilter } from './faceted-filter'

// Filtros da tabela em Sheet (<md): os chips inline empilhados empurravam o
// conteúdo para fora da primeira dobra no mobile. Reusa os MESMOS componentes
// de faceta/período — o estado continua na tabela (e na URL).
export function DataTableFiltersSheet<TData>({
  table,
  filters = [],
  dateRangeFilters = [],
}: {
  table: Table<TData>
  filters?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
  dateRangeFilters?: { columnId: string; title: string }[]
}) {
  const ativos = table.getState().columnFilters.length

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline' size='sm' className='h-8'>
          <ListFilter />
          Filtros
          {ativos > 0 && (
            <span className='rounded-full bg-primary px-1.5 text-xs text-primary-foreground tabular-nums'>
              {ativos}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side='bottom' className='max-h-[80dvh] overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>
            Refine a lista por status, etapa, unidade e período.
          </SheetDescription>
        </SheetHeader>
        <div className='flex flex-wrap gap-2 px-4'>
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            if (!column) return null
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            )
          })}
          {dateRangeFilters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            if (!column) return null
            return (
              <DataTableDateRangeFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
              />
            )
          })}
        </div>
        <SheetFooter>
          <Button
            variant='ghost'
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter('')
            }}
            aria-disabled={ativos === 0 || undefined}
          >
            Limpar filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
