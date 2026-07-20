import { useState, type ReactNode } from 'react'
import {
  useForm,
  type FieldValues,
  type Path,
  type Resolver,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/date-picker'
import {
  cronogramaEditSchema,
  gestorJuridicoEditSchema,
  resultadoEditSchema,
  type CronogramaEditInput,
  type GestorJuridicoEditInput,
  type ResultadoEditInput,
  type Vaga,
} from '../data/schema'
import { useVagasStore } from '../data/vagas-store'
import { labelDoPapel, usePapel } from '../lib/papel'

// Edição por seção do detalhe (RF11–RF15): cada card tem seu diálogo com o
// recorte de campos daquele grupo. A gravação passa pela porta de persistência
// (atualizar), que carimba auditoria e histórico.

type SecaoDialogProps<T extends FieldValues> = {
  vaga: Vaga
  titulo: string
  descricao: string
  // Construído no componente concreto (idioma do vaga-form) — o genérico do
  // zodResolver não infere através de z.ZodType<T>
  resolver: Resolver<T>
  valoresIniciais: T
  children: (form: ReturnType<typeof useForm<T>>) => ReactNode
}

function SecaoDialog<T extends FieldValues>({
  vaga,
  titulo,
  descricao,
  resolver,
  valoresIniciais,
  children,
}: SecaoDialogProps<T>) {
  const atualizar = useVagasStore((s) => s.atualizar)
  const papel = usePapel()
  const [aberto, setAberto] = useState(false)

  const form = useForm<T>({
    resolver,
    values: valoresIniciais,
  })

  function onSubmit(values: T) {
    // Inputs de texto vazios viram undefined — não gravar '' em campo opcional
    const patch = Object.fromEntries(
      Object.entries(values).map(([campo, valor]) => [
        campo,
        valor === '' ? undefined : valor,
      ])
    ) as Partial<Vaga>
    atualizar(vaga.id, patch, labelDoPapel(papel))
    toast.success(`${titulo} atualizado`)
    setAberto(false)
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <Button variant='outline' size='sm' onClick={() => setAberto(true)}>
        <Pencil className='size-4' />
        Editar
      </Button>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {children(form)}
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setAberto(false)}
              >
                Voltar
              </Button>
              <Button type='submit'>Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Campo de data reutilizável dentro dos diálogos de seção
function CampoData<T extends FieldValues>({
  form,
  name,
  label,
  desabilitarFuturo = false,
}: {
  form: ReturnType<typeof useForm<T>>
  name: Path<T>
  label: string
  desabilitarFuturo?: boolean
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <DatePicker
              selected={field.value}
              onSelect={field.onChange}
              desabilitarFuturo={desabilitarFuturo}
              limpavel
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function EditarGestorJuridico({ vaga }: { vaga: Vaga }) {
  return (
    <SecaoDialog<GestorJuridicoEditInput>
      vaga={vaga}
      titulo='Gestor & Jurídico'
      descricao='Datas de encaminhamento e retorno que alimentam as medições de tempo.'
      resolver={
        zodResolver(
          gestorJuridicoEditSchema
        ) as Resolver<GestorJuridicoEditInput>
      }
      valoresIniciais={{
        dataEncaminhamentoGestor: vaga.dataEncaminhamentoGestor,
        dataRetornoGestor: vaga.dataRetornoGestor,
        chamadoJuridico: vaga.chamadoJuridico ?? '',
        aberturaChamadoJuridico: vaga.aberturaChamadoJuridico,
        recebimentoParecerJuridico: vaga.recebimentoParecerJuridico,
      }}
    >
      {(form) => (
        <div className='grid gap-4 sm:grid-cols-2'>
          <CampoData
            form={form}
            name='dataEncaminhamentoGestor'
            label='Encaminhada ao gestor'
            desabilitarFuturo
          />
          <CampoData
            form={form}
            name='dataRetornoGestor'
            label='Retorno do gestor'
            desabilitarFuturo
          />
          <FormField
            control={form.control}
            name='chamadoJuridico'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chamado jurídico</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Ex.: JUR-12345'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <CampoData
            form={form}
            name='aberturaChamadoJuridico'
            label='Abertura do chamado'
            desabilitarFuturo
          />
          <CampoData
            form={form}
            name='recebimentoParecerJuridico'
            label='Recebimento do parecer'
            desabilitarFuturo
          />
        </div>
      )}
    </SecaoDialog>
  )
}

export function EditarCronograma({ vaga }: { vaga: Vaga }) {
  return (
    <SecaoDialog<CronogramaEditInput>
      vaga={vaga}
      titulo='Cronograma seletivo'
      descricao='Datas planejadas ou realizadas de cada etapa do processo (RF13).'
      resolver={
        zodResolver(cronogramaEditSchema) as Resolver<CronogramaEditInput>
      }
      valoresIniciais={{
        inscricoesInicio: vaga.inscricoesInicio,
        inscricoesFim: vaga.inscricoesFim,
        dataProva: vaga.dataProva,
        dataEntrevistaRh: vaga.dataEntrevistaRh,
        dataEntrevistaGestor: vaga.dataEntrevistaGestor,
        dataHabilitacao: vaga.dataHabilitacao,
        previsaoAdmissao: vaga.previsaoAdmissao,
        dataAdmissao: vaga.dataAdmissao,
      }}
    >
      {(form) => (
        <div className='grid gap-4 sm:grid-cols-2'>
          <CampoData
            form={form}
            name='inscricoesInicio'
            label='Início das inscrições'
          />
          <CampoData
            form={form}
            name='inscricoesFim'
            label='Fim das inscrições'
          />
          <CampoData form={form} name='dataProva' label='Prova' />
          <CampoData
            form={form}
            name='dataEntrevistaRh'
            label='Entrevista RH'
          />
          <CampoData
            form={form}
            name='dataEntrevistaGestor'
            label='Entrevista com gestor'
          />
          <CampoData form={form} name='dataHabilitacao' label='Habilitação' />
          <CampoData
            form={form}
            name='previsaoAdmissao'
            label='Previsão de admissão'
          />
          <CampoData form={form} name='dataAdmissao' label='Admissão' />
        </div>
      )}
    </SecaoDialog>
  )
}

const generoOptions = [
  { value: 'feminino', label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'nao-informado', label: 'Não informado' },
] as const

// Sentinela p/ limpar selects opcionais — Radix não aceita value vazio
const OPCAO_NENHUMA = '__nenhum__'

export function EditarResultado({
  vaga,
  podeEditarSensiveis,
}: {
  vaga: Vaga
  podeEditarSensiveis: boolean
}) {
  return (
    <SecaoDialog<ResultadoEditInput>
      vaga={vaga}
      titulo='Resultado & Candidato'
      descricao='Registro do desfecho do processo seletivo (RF14/RF15).'
      resolver={
        zodResolver(resultadoEditSchema) as Resolver<ResultadoEditInput>
      }
      valoresIniciais={{
        divulgacaoResultado: vaga.divulgacaoResultado,
        qtdCandidatosAplicados: vaga.qtdCandidatosAplicados,
        gerouBanco: vaga.gerouBanco,
        candidatoSelecionado: vaga.candidatoSelecionado ?? '',
        genero: vaga.genero,
        candidatoInterno: vaga.candidatoInterno,
      }}
    >
      {(form) => (
        <div className='grid gap-4 sm:grid-cols-2'>
          <CampoData
            form={form}
            name='divulgacaoResultado'
            label='Divulgação do resultado'
            desabilitarFuturo
          />
          <FormField
            control={form.control}
            name='qtdCandidatosAplicados'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Candidatos aplicados</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    placeholder='Ex.: 42'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='gerouBanco'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center gap-3 pt-2'>
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className='!mt-0'>Gerou banco</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* 🔒 Dados sensíveis de candidato (LGPD/B7): só Admin registra */}
          {podeEditarSensiveis && (
            <>
              <FormField
                control={form.control}
                name='candidatoSelecionado'
                render={({ field }) => (
                  <FormItem className='sm:col-span-2'>
                    <FormLabel>Candidato selecionado 🔒</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nome do candidato'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='genero'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gênero 🔒</FormLabel>
                    <Select
                      onValueChange={(v) =>
                        field.onChange(v === OPCAO_NENHUMA ? undefined : v)
                      }
                      value={field.value ?? ''}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Selecione' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={OPCAO_NENHUMA}>—</SelectItem>
                        {generoOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='candidatoInterno'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center gap-3 pt-2'>
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className='!mt-0'>
                      Candidato interno 🔒
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
      )}
    </SecaoDialog>
  )
}
