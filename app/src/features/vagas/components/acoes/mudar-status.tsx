import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Vaga } from '../../data/schema'
import { ItensStatus } from './itens-status'
import { useMudarStatus } from './use-mudar-status'

// Botão "Mudar status" do detalhe da vaga, agora sobre o hook compartilhado:
// mostra TODAS as etapas (inválidas desabilitadas com tooltip) e confirma as
// transições com consequência (finalizar/suspender/congelar/arquivar) —
// cancelar segue exigindo motivo.
export function MudarStatus({ vaga }: { vaga: Vaga }) {
  const { opcoes, temDestinos, selecionar, dialogs, devolverFocoRef } =
    useMudarStatus(vaga)

  if (!temDestinos) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button ref={devolverFocoRef} variant='outline' size='sm'>
            Mudar status
            <ChevronDown className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <ItensStatus vaga={vaga} opcoes={opcoes} selecionar={selecionar} />
        </DropdownMenuContent>
      </DropdownMenu>
      {dialogs}
    </>
  )
}
