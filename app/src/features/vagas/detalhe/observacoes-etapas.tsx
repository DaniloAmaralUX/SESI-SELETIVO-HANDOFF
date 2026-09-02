import { useRef, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MessageSquareText } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ACAO_LABELS } from '../data/campos'
import { acaoOptions } from '../data/data'
import { OBSERVACAO_MAX_CHARS, type AcaoVaga, type Vaga } from '../data/schema'
import { useVagasStore } from '../data/vagas-store'
import { labelDoPapel, usePapel } from '../lib/papel'

// A partir de quantos caracteres restantes o contador passa a ser anunciado
// por leitor de tela. Antes disso o número muda a cada tecla e um aria-live
// leria todas elas — ruído que atrapalha justamente quem depende do anúncio.
const ANUNCIAR_A_PARTIR_DE = 50

// Observações por etapa: linha do tempo IMUTÁVEL (tipo comentário) — depois de
// salvas não são editadas nem removidas; cada registro também vira evento no
// histórico da vaga e sai na exportação CSV. Opcionais em todas as etapas.
export function ObservacoesEtapas({ vaga }: { vaga: Vaga }) {
  const adicionarObservacao = useVagasStore((s) => s.adicionarObservacao)
  const papel = usePapel()
  const [etapa, setEtapa] = useState<AcaoVaga>(vaga.acaoAtual)
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState('')
  const textoRef = useRef<HTMLTextAreaElement>(null)

  const restantes = OBSERVACAO_MAX_CHARS - texto.length
  const perto = restantes <= ANUNCIAR_A_PARTIR_DE

  // Arquivada é pós-terminal: preserva o registro, não recebe novos
  const podeRegistrar = vaga.status !== 'arquivada'

  const observacoes = [...(vaga.observacoesEtapas ?? [])].sort(
    (a, b) => b.em.getTime() - a.em.getTime()
  )

  function registrar() {
    const t = texto.trim()
    if (!t) {
      setErro('Escreva a observação antes de adicionar.')
      textoRef.current?.focus()
      return
    }
    adicionarObservacao(vaga.id, etapa, t, labelDoPapel(papel))
    toast.success(`Observação registrada em ${ACAO_LABELS[etapa]}`)
    setTexto('')
  }

  return (
    <div className='space-y-4'>
      {podeRegistrar && (
        <Card>
          <CardHeader>
            <CardTitle role='heading' aria-level={2}>
              Nova observação
            </CardTitle>
            <CardDescription>
              Registro imutável: depois de salva, a observação não pode ser
              editada nem removida e entra no histórico da vaga.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='observacao-etapa'>Etapa</Label>
              <Select
                value={etapa}
                onValueChange={(v) => setEtapa(v as AcaoVaga)}
              >
                <SelectTrigger id='observacao-etapa' className='w-full sm:w-72'>
                  <SelectValue placeholder='Selecione a etapa' />
                </SelectTrigger>
                <SelectContent>
                  {acaoOptions.map((opcao) => (
                    <SelectItem key={opcao.value} value={opcao.value}>
                      <opcao.icon />
                      {opcao.label}
                      {opcao.value === vaga.acaoAtual && ' (atual)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='observacao-texto'>Observação</Label>
              <Textarea
                id='observacao-texto'
                ref={textoRef}
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value)
                  setErro('')
                }}
                maxLength={OBSERVACAO_MAX_CHARS}
                placeholder='Ex.: Gestor pediu prioridade no preenchimento.'
                className='resize-none'
                aria-describedby={
                  erro
                    ? 'observacao-limite observacao-contador observacao-erro'
                    : 'observacao-limite observacao-contador'
                }
              />
              <div className='flex items-baseline justify-between gap-2'>
                <p
                  id='observacao-limite'
                  className='text-xs text-muted-foreground'
                >
                  Use até {OBSERVACAO_MAX_CHARS} caracteres.
                </p>
                <p
                  id='observacao-contador'
                  className='text-xs text-muted-foreground tabular-nums'
                >
                  {restantes === 0
                    ? `Limite atingido: ${OBSERVACAO_MAX_CHARS} caracteres`
                    : `${restantes} caracteres restantes`}
                </p>
              </div>
              {/* Região viva à parte do contador visível: só fala quando o
                  limite se aproxima, em vez de a cada tecla digitada. */}
              <p role='status' aria-live='polite' className='sr-only'>
                {perto
                  ? restantes === 0
                    ? `Limite de ${OBSERVACAO_MAX_CHARS} caracteres atingido`
                    : `${restantes} caracteres restantes`
                  : ''}
              </p>
              {erro && (
                <p
                  id='observacao-erro'
                  role='alert'
                  className='text-sm text-destructive'
                >
                  {erro}
                </p>
              )}
            </div>
            <div className='flex justify-end'>
              <Button
                aria-disabled={!texto.trim() || undefined}
                onClick={registrar}
              >
                <MessageSquareText />
                Adicionar observação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle role='heading' aria-level={2}>
            Observações registradas
          </CardTitle>
          <CardDescription>
            Uma linha do tempo por etapa, da mais recente para a mais antiga.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {observacoes.length === 0 ? (
            <Empty className='py-12'>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <MessageSquareText />
                </EmptyMedia>
                <EmptyTitle>Nenhuma observação registrada</EmptyTitle>
                <EmptyDescription>
                  As observações adicionadas por etapa aparecerão aqui.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ol className='space-y-0'>
              {observacoes.map((obs, indice) => {
                const opcao = acaoOptions.find((o) => o.value === obs.etapa)
                const ultimo = indice === observacoes.length - 1
                return (
                  <li
                    key={`${obs.em.getTime()}-${indice}`}
                    className='flex gap-3'
                  >
                    <div className='flex flex-col items-center'>
                      <span className='flex size-8 shrink-0 items-center justify-center rounded-full border text-muted-foreground'>
                        {opcao ? (
                          <opcao.icon className='size-4' />
                        ) : (
                          <MessageSquareText className='size-4' />
                        )}
                      </span>
                      {!ultimo && (
                        <span
                          className='w-px flex-1 bg-border'
                          aria-hidden='true'
                        />
                      )}
                    </div>
                    <div className={ultimo ? 'pb-0' : 'pb-6'}>
                      <Badge variant='secondary' className='mb-1'>
                        {ACAO_LABELS[obs.etapa]}
                      </Badge>
                      <p className='text-sm text-pretty text-foreground'>
                        {obs.texto}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {obs.por} ·{' '}
                        {format(obs.em, "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
