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
import { acaoOptions } from '../data/data'
import { type AcaoVaga, type Vaga } from '../data/schema'
import { useVagasStore } from '../data/vagas-store'
import { labelDoPapel, usePapel } from '../lib/papel'

// Registrar a Ação atual da Vaga (RF08): escolhe a etapa e a data em que ela
// aconteceu. Etapas são ordenadas, mas o retrocesso é permitido para corrigir
// registro errado — a mudança fica no histórico de qualquer forma.
export function MudarAcao({ vaga }: { vaga: Vaga }) {
  const mudarAcao = useVagasStore((s) => s.mudarAcao)
  const papel = usePapel()
  const [aberto, setAberto] = useState(false)
  const [acao, setAcao] = useState<AcaoVaga>(vaga.acaoAtual)
  const [data, setData] = useState<Date | undefined>(new Date())

  const podeRegistrar = vaga.status === 'aberta'
  if (!podeRegistrar) return null

  const indiceAtual = acaoOptions.findIndex((o) => o.value === vaga.acaoAtual)

  function abrir() {
    // Sugere a PRÓXIMA etapa — o caso comum é avançar uma casa
    const proxima = acaoOptions[indiceAtual + 1]?.value ?? vaga.acaoAtual
    setAcao(proxima)
    setData(new Date())
    setAberto(true)
  }

  function confirmar() {
    if (!data || acao === vaga.acaoAtual) return
    mudarAcao(vaga.id, acao, data, labelDoPapel(papel))
    const label = acaoOptions.find((o) => o.value === acao)?.label ?? acao
    toast.success(`Ação atual registrada: ${label}`)
    setAberto(false)
  }

  return (
    <>
      <Button size='sm' onClick={abrir}>
        <ArrowRight className='size-4' />
        Registrar ação
      </Button>

      <Dialog open={aberto} onOpenChange={setAberto}>
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
                onValueChange={(v) => setAcao(v as AcaoVaga)}
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
                onSelect={setData}
                desabilitarFuturo
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setAberto(false)}>
              Voltar
            </Button>
            <Button
              disabled={!data || acao === vaga.acaoAtual}
              onClick={confirmar}
            >
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
