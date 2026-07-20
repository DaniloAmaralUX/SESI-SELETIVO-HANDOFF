import { format } from 'date-fns'
import { type Column } from '@tanstack/react-table'
import { ptBR } from 'date-fns/locale'
import { CalendarRange, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { DatePicker } from '@/components/date-picker'

// Valor do filtro de período de uma coluna de data
type FiltroPeriodo = { de?: Date; ate?: Date }

// filterFn de intervalo para colunas de data — registre na coluna:
//   filterFn: filtroPeriodoFn
export function filtroPeriodoFn(
  row: { getValue: (id: string) => unknown },
  columnId: string,
  value: FiltroPeriodo
): boolean {
  const data = row.getValue(columnId)
  if (!(data instanceof Date)) return false
  if (value.de && data < value.de) return false
  if (value.ate && data > value.ate) return false
  return true
}

// Filtro facetado de período (de/até) para a toolbar da DataTable
export function DataTableDateRangeFilter<TData, TValue>({
  column,
  title,
}: {
  column: Column<TData, TValue>
  title: string
}) {
  const valor = (column.getFilterValue() as FiltroPeriodo | undefined) ?? {}
  const ativo = valor.de ?? valor.ate

  function definir(patch: FiltroPeriodo) {
    const proximo = { ...valor, ...patch }
    column.setFilterValue(proximo.de || proximo.ate ? proximo : undefined)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <CalendarRange className='size-4' />
          {title}
          {ativo && (
            <>
              <Separator orientation='vertical' className='mx-1 h-4' />
              <span className='text-xs font-normal'>
                {valor.de
                  ? format(valor.de, 'dd/MM/yy', { locale: ptBR })
                  : '…'}{' '}
                –{' '}
                {valor.ate
                  ? format(valor.ate, 'dd/MM/yy', { locale: ptBR })
                  : '…'}
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-72 space-y-3' align='start'>
        <div className='space-y-2'>
          <Label>De</Label>
          <DatePicker
            selected={valor.de}
            onSelect={(de) => definir({ de })}
            limpavel
          />
        </div>
        <div className='space-y-2'>
          <Label>Até</Label>
          <DatePicker
            selected={valor.ate}
            onSelect={(ate) => definir({ ate })}
            limpavel
          />
        </div>
        {ativo && (
          <Button
            variant='ghost'
            size='sm'
            className='w-full'
            onClick={() => column.setFilterValue(undefined)}
          >
            <X className='size-4' />
            Limpar período
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
