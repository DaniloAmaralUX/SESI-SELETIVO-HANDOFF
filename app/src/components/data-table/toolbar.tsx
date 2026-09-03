import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableDateRangeFilter } from './date-range-filter'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableFiltersSheet } from './filters-sheet'
import { DataTableViewOptions } from './view-options'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
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
  actions?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Filtrar...',
  searchKey,
  filters = [],
  dateRangeFilters = [],
  actions,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter

  return (
    <div className='flex flex-wrap items-center justify-between gap-2'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4'>
        {searchKey ? (
          <Input
            type='search'
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            // Mobile: largura cheia — campo estreito clipava o placeholder e
            // criava borda solta no layout (better-layout: plan for growth)
            className='h-8 w-full sm:w-37.5 lg:w-62.5'
          />
        ) : (
          <Input
            type='search'
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={table.getState().globalFilter ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className='h-8 w-full sm:w-37.5 lg:w-62.5'
          />
        )}
        {/* <md os chips empilhavam 1/linha e empurravam a tabela p/ fora da
            dobra — viram um único botão "Filtros (n)" com Sheet */}
        {(filters.length > 0 || dateRangeFilters.length > 0) && (
          <div className='md:hidden'>
            <DataTableFiltersSheet
              table={table}
              filters={filters}
              dateRangeFilters={dateRangeFilters}
            />
          </div>
        )}
        <div className='hidden flex-wrap gap-2 md:flex'>
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
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter('')
            }}
            className='h-8 px-2 lg:px-3'
          >
            Limpar filtros
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <div className='flex items-center gap-2'>
        <DataTableViewOptions table={table} />
        {actions}
      </div>
    </div>
  )
}
