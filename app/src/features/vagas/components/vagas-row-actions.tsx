import { Link } from '@tanstack/react-router'
import { ArrowRight, Eye, MoreHorizontal, Pencil } from 'lucide-react'
import useDialogState from '@/hooks/use-dialog-state'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Vaga } from '../data/schema'
import { ItensStatus } from './acoes/itens-status'
import { MudarAcaoDialog, podeRegistrarAcao } from './acoes/mudar-acao'
import { useMudarStatus } from './acoes/use-mudar-status'

// Kebab de ações por linha (docs: "ações frequentes em 1–2 cliques a partir
// da lista"): mudar status e registrar ação sem carregar o detalhe.
// Os dialogs ficam FORA do DropdownMenuContent — o menu desmonta ao fechar.
export function VagasRowActions({ vaga }: { vaga: Vaga }) {
  const { opcoes, temDestinos, selecionar, dialogs, devolverFocoRef } =
    useMudarStatus(vaga)
  const [registrandoAcao, setRegistrandoAcao] = useDialogState<boolean>(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={devolverFocoRef}
            variant='ghost'
            size='icon'
            className='size-8'
            aria-label={`Ações da vaga ${vaga.chamado}`}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          <DropdownMenuItem asChild>
            <Link to='/vagas/$vagaId' params={{ vagaId: vaga.id }}>
              <Eye />
              Ver detalhes
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to='/vagas/$vagaId/editar' params={{ vagaId: vaga.id }}>
              <Pencil />
              Editar
            </Link>
          </DropdownMenuItem>
          {(podeRegistrarAcao(vaga) || temDestinos) && (
            <DropdownMenuSeparator />
          )}
          {podeRegistrarAcao(vaga) && (
            <DropdownMenuItem onSelect={() => setRegistrandoAcao(true)}>
              <ArrowRight />
              Registrar ação
            </DropdownMenuItem>
          )}
          {temDestinos && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Mudar status</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <ItensStatus
                  vaga={vaga}
                  opcoes={opcoes}
                  selecionar={selecionar}
                />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {dialogs}
      <MudarAcaoDialog
        vaga={vaga}
        open={!!registrandoAcao}
        onOpenChange={(open) => setRegistrandoAcao(open ? true : null)}
      />
    </>
  )
}
