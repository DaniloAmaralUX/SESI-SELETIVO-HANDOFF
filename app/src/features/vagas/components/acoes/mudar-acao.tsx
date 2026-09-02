import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/date-picker'
import { acaoOptions } from '../../data/data'
import { type AcaoVaga, type Vaga } from '../../data/schema'
import { useVagasStore } from '../../data/vagas-store'
import { labelDoPapel, usePapel } from '../../lib/papel'

/** A vaga aceita registro de ação? (RF08 — só em andamento) */
export function podeRegistrarAcao(vaga: Vaga): boolean {
  return vaga.status === 'aberta'
}

// Registrar a Ação atual da Vaga (RF08), versão CONTROLADA (sem trigger):
// serve tanto o botão do detalhe quanto o kebab da lista, que renderiza o
// dialog fora do menu (o menu desmonta ao fechar).
export function MudarAcaoDialog({
  vaga,
  open,
  onOpenChange,
}: {
  vaga: Vaga
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const mudarAcao = useVagasStore((s) => s.mudarAcao)
  const papel = usePapel()
  const [acao, setAcao] = useState<AcaoVaga>(vaga.acaoAtual)
  const [data, setData] = useState<Date | undefined>(new Date())
  const [erro, setErro] = useState('')

  const indiceAtual = acaoOptions.findIndex((o) => o.value === vaga.acaoAtual)

  function confirmar() {
    if (!data || acao === vaga.acaoAtual) {
      setErro('Escolha uma etapa diferente da atual e informe a data.')
      return
    }
    mudarAcao(vaga.id, acao, data, labelDoPapel(papel))
    const label = acaoOptions.find((o) => o.value === acao)?.label ?? acao
    toast.success(`Ação atual registrada: ${label}`)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(aberto) => {
        if (aberto) {
          // Sugere a PRÓXIMA etapa — o caso comum é avançar uma casa
          const proxima = acaoOptions[indiceAtual + 1]?.value ?? vaga.acaoAtual
          setAcao(proxima)
          setData(new Date())
          setErro('')
        }
        onOpenChange(aberto)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar ação atual</DialogTitle>
          <DialogDescription>
            Em qual etapa do processo seletivo a vaga está e desde quando. A
            mudança fica registrada no histórico.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='acao-atual'>Etapa</Label>
            <Select
              value={acao}
              onValueChange={(v) => {
                setAcao(v as AcaoVaga)
                setErro('')
              }}
            >
              <SelectTrigger id='acao-atual' className='w-full'>
                <SelectValue placeholder='Selecione a etapa' />
              </SelectTrigger>
              <SelectContent>
                {acaoOptions.map((opcao, indice) => (
                  <SelectItem key={opcao.value} value={opcao.value}>
                    <opcao.icon />
                    {opcao.label}
                    {indice === indiceAtual && ' (atual)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>Data da ação</Label>
            <DatePicker
              selected={data}
              onSelect={(d) => {
                setData(d)
                setErro('')
              }}
              desabilitarFuturo
            />
          </div>
          {erro && (
            <p role='alert' className='text-sm text-destructive'>
              {erro}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Voltar
          </Button>
          <Button
            aria-disabled={!data || acao === vaga.acaoAtual || undefined}
            onClick={confirmar}
          >
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Wrapper com botão-gatilho — uso do detalhe da vaga.
export function MudarAcao({ vaga }: { vaga: Vaga }) {
  const [aberto, setAberto] = useState(false)

  if (!podeRegistrarAcao(vaga)) return null

  return (
    <>
      <Button size='sm' onClick={() => setAberto(true)}>
        <ArrowRight className='size-4' />
        Registrar ação
      </Button>
      <MudarAcaoDialog vaga={vaga} open={aberto} onOpenChange={setAberto} />
    </>
  )
}
