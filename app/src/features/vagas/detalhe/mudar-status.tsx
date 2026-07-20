import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { STATUS_LABELS } from '../data/campos'
import { statusOptions } from '../data/data'
import { type StatusVaga, type Vaga } from '../data/schema'
import { transicoesPermitidas } from '../data/transicoes'
import { useVagasStore } from '../data/vagas-store'
import { labelDoPapel, usePapel } from '../lib/papel'

// Ação de mudar o Status da Vaga, restrita às transições da matriz B1. Cancelar
// exige motivo (invariante do schema — CONTEXT.md); Arquivar pede confirmação
// por ser fim de linha (sem transição de saída na matriz).
export function MudarStatus({ vaga }: { vaga: Vaga }) {
  const mudarStatus = useVagasStore((s) => s.mudarStatus)
  const papel = usePapel()
  const [cancelando, setCancelando] = useState(false)
  const [arquivando, setArquivando] = useState(false)
  const [motivo, setMotivo] = useState('')

  const destinos = transicoesPermitidas(vaga.status)
  if (destinos.length === 0) return null

  const opcoes = destinos
    .map((valor) => statusOptions.find((o) => o.value === valor))
    .filter((o): o is (typeof statusOptions)[number] => Boolean(o))

  function aplicar(destino: StatusVaga, motivoCancelamento?: string) {
    mudarStatus(vaga.id, destino, labelDoPapel(papel), motivoCancelamento)
    toast.success(`Status alterado para ${STATUS_LABELS[destino]}`)
  }

  function selecionar(destino: StatusVaga) {
    if (destino === 'cancelada') {
      setMotivo('')
      setCancelando(true)
      return
    }
    if (destino === 'arquivada') {
      setArquivando(true)
      return
    }
    aplicar(destino)
  }

  function confirmarCancelamento() {
    if (!motivo.trim()) return
    aplicar('cancelada', motivo.trim())
    setCancelando(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm'>
            Mudar status
            <ChevronDown className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {opcoes.map((opcao) => (
            <DropdownMenuItem
              key={opcao.value}
              onSelect={() => selecionar(opcao.value)}
            >
              <opcao.icon />
              {opcao.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={arquivando}
        onOpenChange={setArquivando}
        title='Arquivar vaga'
        desc={`A vaga ${vaga.chamado} — ${vaga.cargo} será arquivada. O histórico é preservado, mas não há transição de volta.`}
        cancelBtnText='Voltar'
        confirmText='Arquivar'
        handleConfirm={() => {
          aplicar('arquivada')
          setArquivando(false)
        }}
      />

      <Dialog open={cancelando} onOpenChange={setCancelando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar vaga</DialogTitle>
            <DialogDescription>
              Informe o motivo do cancelamento. Ele fica registrado na vaga.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-2'>
            <Label htmlFor='motivo-cancelamento'>Motivo do cancelamento</Label>
            <Textarea
              id='motivo-cancelamento'
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder='Ex.: Contenção orçamentária da Unidade.'
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setCancelando(false)}>
              Voltar
            </Button>
            <Button
              variant='destructive'
              disabled={!motivo.trim()}
              onClick={confirmarCancelamento}
            >
              Cancelar vaga
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
