import { useRef, useState, type ReactNode } from 'react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { STATUS_LABELS } from '../../data/campos'
import { statusOptions } from '../../data/data'
import { type StatusVaga, type Vaga } from '../../data/schema'
import { transicoesPermitidas } from '../../data/transicoes'
import { useVagasStore } from '../../data/vagas-store'
import { labelDoPapel, usePapel } from '../../lib/papel'

// Consequência explícita de cada transição irreversível/impactante — o
// histórico é imutável (sem undo), então a segurança vem da confirmação
// (fluxos F3: "confirmação com consequência explícita").
// Diálogo nomeia a AÇÃO (não "confirmar mudança") e o botão repete o verbo —
// padrão de confirmação: ação clara + consequência + CTA específico
const CONFIRMACOES: Partial<
  Record<StatusVaga, { titulo: string; verbo: string; consequencia: string }>
> = {
  finalizada: {
    titulo: 'Finalizar vaga?',
    verbo: 'Finalizar',
    consequencia:
      'encerra o processo seletivo: o prazo (SLA) para de contar e a vaga sai da fila ativa. Registre o resultado na aba "Resultado e candidato".',
  },
  suspensa: {
    titulo: 'Suspender vaga?',
    verbo: 'Suspender',
    consequencia:
      'pausa o processo: o prazo (SLA) fica congelado enquanto a vaga estiver suspensa.',
  },
  congelada: {
    titulo: 'Congelar vaga?',
    verbo: 'Congelar',
    consequencia:
      'congela o processo: o prazo (SLA) fica pausado até a vaga ser reaberta.',
  },
}

export type OpcaoStatus = {
  value: StatusVaga
  label: string
  icon: (typeof statusOptions)[number]['icon']
  /** false = transição inválida a partir do status atual (matriz B1) */
  permitida: boolean
}

/**
 * Estado + regras de mudança de Status de uma vaga, desacoplado do gatilho:
 * o mesmo hook serve o botão do detalhe e o submenu do kebab da lista.
 * `dialogs` deve ser renderizado FORA de DropdownMenuContent (o menu
 * desmonta ao fechar). `devolverFocoRef` opcionalmente aponta o gatilho que
 * recebe o foco de volta ao fechar o diálogo de cancelamento.
 */
export function useMudarStatus(vaga: Vaga): {
  opcoes: OpcaoStatus[]
  temDestinos: boolean
  selecionar: (destino: StatusVaga) => void
  dialogs: ReactNode
  devolverFocoRef: React.RefObject<HTMLButtonElement | null>
} {
  const mudarStatus = useVagasStore((s) => s.mudarStatus)
  const papel = usePapel()
  const [cancelando, setCancelando] = useState(false)
  const [arquivando, setArquivando] = useState(false)
  // Transições com consequência confirmável (finalizada/suspensa/congelada)
  const [confirmando, setConfirmando] = useState<StatusVaga | null>(null)
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')
  const devolverFocoRef = useRef<HTMLButtonElement>(null)
  const motivoRef = useRef<HTMLTextAreaElement>(null)

  const destinos = transicoesPermitidas(vaga.status)

  // TODAS as etapas (menos a atual) com flag `permitida` — inválidas ficam
  // desabilitadas com tooltip em vez de sumir (docs F3)
  const opcoes: OpcaoStatus[] = statusOptions
    .filter((o) => o.value !== vaga.status)
    .map((o) => ({
      value: o.value,
      label: o.label,
      icon: o.icon,
      permitida: destinos.includes(o.value),
    }))

  function aplicar(destino: StatusVaga, motivoCancelamento?: string) {
    mudarStatus(vaga.id, destino, labelDoPapel(papel), motivoCancelamento)
    toast.success(`Status alterado para ${STATUS_LABELS[destino]}`)
  }

  function selecionar(destino: StatusVaga) {
    if (destino === 'cancelada') {
      setMotivo('')
      setErro('')
      setCancelando(true)
      return
    }
    if (destino === 'arquivada') {
      setArquivando(true)
      return
    }
    if (destino in CONFIRMACOES) {
      setConfirmando(destino)
      return
    }
    // Reabrir (→ aberta) segue imediato: é a transição de retomada, reversível
    aplicar(destino)
  }

  function confirmarCancelamento() {
    if (!motivo.trim()) {
      setErro('Informe o motivo do cancelamento.')
      motivoRef.current?.focus()
      return
    }
    aplicar('cancelada', motivo.trim())
    setCancelando(false)
  }

  const dialogs = (
    <>
      <ConfirmDialog
        open={arquivando}
        onOpenChange={setArquivando}
        title='Arquivar vaga'
        desc={`A vaga ${vaga.chamado} — ${vaga.cargo} será arquivada. O histórico é preservado, mas não é possível reabri-la depois.`}
        cancelBtnText='Voltar'
        confirmText='Arquivar'
        handleConfirm={() => {
          aplicar('arquivada')
          setArquivando(false)
        }}
      />

      <ConfirmDialog
        open={confirmando !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmando(null)
        }}
        title={confirmando ? (CONFIRMACOES[confirmando]?.titulo ?? '') : ''}
        desc={
          confirmando
            ? `A vaga ${vaga.chamado} — ${vaga.cargo} ${CONFIRMACOES[confirmando]?.consequencia}`
            : ''
        }
        cancelBtnText='Voltar'
        confirmText={
          confirmando
            ? (CONFIRMACOES[confirmando]?.verbo ?? 'Confirmar')
            : 'Confirmar'
        }
        handleConfirm={() => {
          if (confirmando) aplicar(confirmando)
          setConfirmando(null)
        }}
      />

      <Dialog open={cancelando} onOpenChange={setCancelando}>
        <DialogContent
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            devolverFocoRef.current?.focus()
          }}
        >
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
              ref={motivoRef}
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value)
                setErro('')
              }}
              aria-describedby={erro ? 'motivo-cancelamento-erro' : undefined}
              placeholder='Ex.: Contenção orçamentária da Unidade.'
            />
            {erro && (
              <p
                id='motivo-cancelamento-erro'
                role='alert'
                className='text-sm text-destructive'
              >
                {erro}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setCancelando(false)}>
              Voltar
            </Button>
            <Button
              variant='destructive'
              aria-disabled={!motivo.trim() || undefined}
              onClick={confirmarCancelamento}
            >
              Cancelar vaga
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )

  return {
    opcoes,
    temDestinos: destinos.length > 0,
    selecionar,
    dialogs,
    devolverFocoRef,
  }
}
