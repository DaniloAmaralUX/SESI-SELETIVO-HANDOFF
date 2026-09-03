import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DatePickerProps = {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  placeholder?: string
  // Associação com rótulo externo: id no trigger + aria-labelledby
  // apontando para o <Label id=...> (e opcionalmente o próprio trigger).
  id?: string
  'aria-labelledby'?: string
  // Cronograma registra datas futuras; auditoria/medições, só passadas.
  desabilitarFuturo?: boolean
  // Campos opcionais podem ser limpos sem reabrir o calendário
  limpavel?: boolean
  // Ajustes de layout no trigger (ex.: altura no grid de 8px do form)
  className?: string
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = 'Selecione a data',
  id,
  'aria-labelledby': ariaLabelledby,
  desabilitarFuturo = false,
  limpavel = false,
  className,
}: DatePickerProps) {
  return (
    <div className='relative'>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            id={id}
            aria-labelledby={ariaLabelledby}
            data-empty={!selected}
            className={cn(
              'w-full justify-start text-start font-normal data-[empty=true]:text-muted-foreground',
              className
            )}
          >
            {selected ? (
              format(selected, 'dd/MM/yyyy', { locale: ptBR })
            ) : (
              <span>{placeholder}</span>
            )}
            <CalendarIcon className='ms-auto h-4 w-4 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
          <Calendar
            mode='single'
            captionLayout='dropdown'
            locale={ptBR}
            selected={selected}
            onSelect={onSelect}
            disabled={(date: Date) =>
              date < new Date('1900-01-01') ||
              (desabilitarFuturo && date > new Date())
            }
          />
        </PopoverContent>
      </Popover>
      {limpavel && selected && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='absolute end-8 top-1/2 size-6 -translate-y-1/2'
          onClick={() => onSelect(undefined)}
          aria-label='Limpar data'
        >
          <X className='size-3.5' />
        </Button>
      )}
    </div>
  )
}
