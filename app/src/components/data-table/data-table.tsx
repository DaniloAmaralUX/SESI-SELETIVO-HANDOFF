import { useEffect, useState } from 'react'
import {
  type ColumnDef,
  type FilterFn,
  type SortingState,
  type Table as TanstackTable,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from './pagination'
import { DataTableToolbar } from './toolbar'

// Config repassada ao useTableUrlState (URL como fonte de verdade da tabela)
type DataTableUrlState = Parameters<typeof useTableUrlState>[0]

type DataTableToolbarConfig = {
  searchPlaceholder?: string
  filters?: Array<{
    columnId: string
    title: string
    options: Array<{
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }>
  }>
  // Filtros de período (de/até) sobre colunas de data — a coluna precisa
  // registrar filtroPeriodoFn (date-range-filter.tsx)
  dateRangeFilters?: Array<{ columnId: string; title: string }>
}

type DataTableProps<TData> = {
  data: TData[]
  columns: ColumnDef<TData>[]
  urlState: DataTableUrlState
  toolbar?: DataTableToolbarConfig
  globalFilterFn?: FilterFn<TData>
  // Conveniência de mouse: o alvo acessível (teclado/leitor de tela)
  // deve ser um Link dentro de uma célula (ex.: coluna Chamado)
  onRowClick?: (rowData: TData) => void
  bulkActions?:
    | React.ReactNode
    | ((table: TanstackTable<TData>) => React.ReactNode)
  // Ações extras da toolbar (ex.: Exportar CSV), à direita das ViewOptions.
  // Render prop para receber a instância da tabela (linhas filtradas etc.)
  toolbarActions?:
    | React.ReactNode
    | ((table: TanstackTable<TData>) => React.ReactNode)
  emptyMessage?: React.ReactNode
  // Colunas ocultas por padrão (ex.: colunas que só alimentam filtros)
  initialColumnVisibility?: VisibilityState
}

/**
 * Tabela genérica que absorve o scaffold repetido por feature
 * (useReactTable + render + paginação + toolbar). Dependências de rota
 * são injetadas via `urlState` (repassado ao useTableUrlState).
 */
export function DataTable<TData>({
  data,
  columns,
  urlState,
  toolbar,
  globalFilterFn,
  onRowClick,
  bulkActions,
  toolbarActions,
  emptyMessage = 'Nenhum resultado.',
  initialColumnVisibility = {},
}: DataTableProps<TData>) {
  // Estados locais de UI (não sincronizados com a URL)
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility
  )

  // Estados sincronizados com a URL (config declarativa do consumidor)
  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState(urlState)

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  // Ignora interações vindas de células marcadas com data-no-row-click
  // (checkbox de seleção, menu de ações etc.)
  const handleRowInteraction = (event: React.MouseEvent, rowData: TData) => {
    const target = event.target as HTMLElement
    if (target.closest('[data-no-row-click]')) return
    onRowClick?.(rowData)
  }

  return (
    <div
      className={cn(
        // Margem inferior no mobile quando a toolbar de seleção está visível
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      {toolbar && (
        <DataTableToolbar
          table={table}
          searchPlaceholder={toolbar.searchPlaceholder}
          filters={toolbar.filters}
          dateRangeFilters={toolbar.dateRangeFilters}
          actions={
            typeof toolbarActions === 'function'
              ? toolbarActions(table)
              : toolbarActions
          }
        />
      )}
      <div className='overflow-hidden rounded-md border'>
        <Table className='min-w-xl'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  {...(onRowClick
                    ? {
                        className: 'cursor-pointer',
                        onClick: (event: React.MouseEvent) =>
                          handleRowInteraction(event, row.original),
                      }
                    : {})}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      {typeof bulkActions === 'function' ? bulkActions(table) : bulkActions}
    </div>
  )
}
