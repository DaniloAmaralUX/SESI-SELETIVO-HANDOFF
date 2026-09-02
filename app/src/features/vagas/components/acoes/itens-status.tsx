import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { STATUS_LABELS } from '../../data/campos'
import { type StatusVaga, type Vaga } from '../../data/schema'
import { type OpcaoStatus } from './use-mudar-status'

// Itens de menu das transições de Status — compartilhados entre o dropdown
// do detalhe e o submenu do kebab da lista. Transições inválidas ficam
// DESABILITADAS COM TOOLTIP explicando o porquê (docs F3), nunca escondidas.
// Padrão Radix: `disabled` real mata pointer-events e o tooltip não abre —
// usa aria-disabled + onSelect condicionado.
export function ItensStatus({
  vaga,
  opcoes,
  selecionar,
}: {
  vaga: Vaga
  opcoes: OpcaoStatus[]
  selecionar: (destino: StatusVaga) => void
}) {
  return (
    <>
      {opcoes.map((opcao) =>
        opcao.permitida ? (
          <DropdownMenuItem
            key={opcao.value}
            onSelect={() => selecionar(opcao.value)}
          >
            <opcao.icon />
            {opcao.label}
          </DropdownMenuItem>
        ) : (
          <Tooltip key={opcao.value}>
            <TooltipTrigger asChild>
              <DropdownMenuItem
                aria-disabled='true'
                className='opacity-50 focus:bg-transparent'
                onSelect={(e) => e.preventDefault()}
              >
                <opcao.icon />
                {opcao.label}
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent side='left'>
              Não permitido a partir de {STATUS_LABELS[vaga.status]}
            </TooltipContent>
          </Tooltip>
        )
      )}
    </>
  )
}
