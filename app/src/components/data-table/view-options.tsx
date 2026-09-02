import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  // Trigger do mesmo módulo do root: misturar com o pacote individual
  // @radix-ui/react-dropdown-menu quebra o contexto ("must be used within")
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type DataTableViewOptionsProps<TData> = {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='ms-auto flex h-8'>
          <MixerHorizontalIcon className='size-4' aria-hidden='true' />
          <span className='max-sm:sr-only'>Colunas</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-37.5'>
        <DropdownMenuLabel>Mostrar/ocultar colunas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== 'undefined' && column.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {/* Rótulo legível vem de meta.label; id cru só como fallback */}
                {column.columnDef.meta?.label ?? column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
