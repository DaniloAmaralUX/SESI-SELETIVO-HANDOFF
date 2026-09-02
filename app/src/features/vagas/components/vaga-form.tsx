import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useGuardaForm } from '@/hooks/use-guarda-form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
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
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/date-picker'
import {
  vagaCreateSchema,
  vagaEditSchema,
  type Vaga,
  type VagaCreateInput,
  type VagaEditInput,
} from '../data/schema'
import { useVaga, useVagasStore } from '../data/vagas-store'
import { labelDoPapel, usePapel } from '../lib/papel'

// Opções dos campos enum. Strings livres (unidade, área, cargo, gestor,
// recrutadora) usam Input; só tipoContrato e nível são Select.
const tipoContratoOptions: Array<{
  value: VagaCreateInput['tipoContrato']
  label: string
}> = [
  { value: 'determinado', label: 'Determinado' },
  { value: 'indeterminado', label: 'Indeterminado' },
  { value: 'estagiario', label: 'Estagiário' },
  { value: 'intermitente', label: 'Intermitente' },
]

const nivelOptions = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const

// Sentinela para "limpar" o nível — Radix Select não aceita value vazio.
const NIVEL_NENHUM = '__nenhum__'

// Marcador visual + anúncio de leitor de tela para campos obrigatórios
function Obrigatorio() {
  return (
    <>
      {' '}
      <span className='text-destructive' aria-hidden='true'>
        *
      </span>
      <span className='sr-only'>(obrigatório)</span>
    </>
  )
}

function NotaObrigatorios() {
  return (
    <p className='text-sm text-muted-foreground'>
      Campos marcados com <span className='text-destructive'>*</span> são
      obrigatórios.
    </p>
  )
}

export function VagaForm(
  props: { mode: 'criar' } | { mode: 'editar'; vaga: Vaga }
) {
  if (props.mode === 'editar') {
    return <EditarForm vaga={props.vaga} />
  }
  return <CriarForm />
}

function CriarForm() {
  const navigate = useNavigate()
  const criar = useVagasStore((s) => s.criar)
  const papel = usePapel()

  const form = useForm<VagaCreateInput>({
    resolver: zodResolver(vagaCreateSchema) as Resolver<VagaCreateInput>,
    defaultValues: {
      chamado: '',
      codigoVaga: '',
      gestorSolicitante: '',
      unidade: '',
      area: '',
      cargo: '',
      tipoContrato: undefined,
      recrutadora: '',
      dataAbertura: new Date(),
      dataRecebimento: undefined,
      nivel: undefined,
      funcao: '',
      motivoContratacao: '',
      observacoes: '',
      pcd: false,
    },
  })

  // Guarda de descarte: navegação com o form sujo pede confirmação
  const { dialogoDescarte } = useGuardaForm(form.formState.isDirty)

  function onSubmit(values: VagaCreateInput) {
    const vaga = criar(values, labelDoPapel(papel))
    toast.success(`Vaga ${vaga.chamado} criada`)
    // Zera o dirty ANTES de navegar — senão a própria navegação de sucesso
    // dispararia o diálogo de descarte
    form.reset(undefined, { keepValues: true })
    navigate({ to: '/vagas/$vagaId', params: { vagaId: vaga.id } })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <NotaObrigatorios />
        <fieldset className='space-y-4'>
          <legend className='text-sm font-semibold'>Identificação</legend>
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='chamado'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nº do chamado
                    <Obrigatorio />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ex.: CH-500123'
                      autoComplete='off'
                      spellCheck={false}
                      {...field}
                    />
                  </FormControl>
                  {/* B5: obrigatoriedade condicional — o refine do schema
                      deposita o erro neste campo (path: ['chamado']) */}
                  <FormDescription>
                    Informe o Nº do chamado ou o Código da vaga (pelo menos um).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='codigoVaga'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Código da vaga
                    <Obrigatorio />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ex.: VG-2026-001'
                      autoComplete='off'
                      spellCheck={false}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Somente leitura (fora do form state) — padrão do campo Papel em
                profile-form.tsx */}
            <FormItem>
              <FormLabel>Código da vaga de origem</FormLabel>
              <FormControl>
                <Input
                  value='—'
                  readOnly
                  aria-readonly='true'
                  className='bg-muted text-muted-foreground'
                />
              </FormControl>
              <FormDescription>
                Preenchido automaticamente quando a vaga é uma reabertura.
              </FormDescription>
            </FormItem>
          </div>
        </fieldset>
        <fieldset className='space-y-4'>
          <legend className='text-sm font-semibold'>Solicitante</legend>
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='gestorSolicitante'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Gestor solicitante
                    <Obrigatorio />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Nome do gestor' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='unidade'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Unidade
                    <Obrigatorio />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Ex.: SESI Centro' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='area'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Área
                    <Obrigatorio />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Ex.: Educação' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>
        <fieldset className='space-y-4'>
          <legend className='text-sm font-semibold'>Perfil da vaga</legend>
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='cargo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Cargo
                    <Obrigatorio />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Ex.: Analista de RH' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='tipoContrato'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tipo de contrato
                    <Obrigatorio />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecione o tipo' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tipoContratoOptions.map((opt) => (
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
              name='nivel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível</FormLabel>
                  <Select
                    onValueChange={(v) =>
                      field.onChange(v === NIVEL_NENHUM ? undefined : v)
                    }
                    value={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecione o nível' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NIVEL_NENHUM}>—</SelectItem>
                      {nivelOptions.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
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
              name='funcao'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <FormControl>
                    <Input placeholder='Função específica' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='motivoContratacao'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo da contratação</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex.: Substituição' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='pcd'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center gap-3 pt-2'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className='!mt-0'>Vaga destinada a PcD</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>
        <fieldset className='space-y-4'>
          <legend className='text-sm font-semibold'>Datas e responsável</legend>
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='recrutadora'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Recrutadora
                    <Obrigatorio />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Nome da recrutadora' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='dataAbertura'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Data de abertura
                    <Obrigatorio />
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value}
                      onSelect={field.onChange}
                      desabilitarFuturo
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='dataRecebimento'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de recebimento</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value}
                      onSelect={field.onChange}
                      desabilitarFuturo
                      limpavel
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>
        <FormField
          control={form.control}
          name='observacoes'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Informações adicionais sobre a vaga'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex gap-2'>
          <Button type='submit'>Criar vaga</Button>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate({ to: '/vagas' })}
          >
            Cancelar
          </Button>
        </div>
        {dialogoDescarte}
      </form>
    </Form>
  )
}

function EditarForm({ vaga }: { vaga: Vaga }) {
  const navigate = useNavigate()
  const atualizar = useVagasStore((s) => s.atualizar)
  const papel = usePapel()
  // Origem da reabertura — só existe quando a vaga é um novo registro vinculado
  const vagaOrigem = useVaga(vaga.reaberturaDe ?? '')

  const form = useForm<VagaEditInput>({
    resolver: zodResolver(vagaEditSchema) as Resolver<VagaEditInput>,
    defaultValues: {
      chamado: vaga.chamado,
      codigoVaga: vaga.codigoVaga,
      gestorSolicitante: vaga.gestorSolicitante,
      unidade: vaga.unidade,
      area: vaga.area,
      cargo: vaga.cargo,
      tipoContrato: vaga.tipoContrato,
      recrutadora: vaga.recrutadora,
      dataAbertura: vaga.dataAbertura,
      dataRecebimento: vaga.dataRecebimento,
      nivel: vaga.nivel,
      funcao: vaga.funcao,
      motivoContratacao: vaga.motivoContratacao,
      pcd: vaga.pcd,
      observacoes: vaga.observacoes,
    },
  })

  // Guarda de descarte: navegação com o form sujo pede confirmação
  const { dialogoDescarte } = useGuardaForm(form.formState.isDirty)

  function onSubmit(values: VagaEditInput) {
    atualizar(vaga.id, values, labelDoPapel(papel))
    toast.success('Alterações salvas')
    // Zera o dirty ANTES de navegar (ver CriarForm)
    form.reset(undefined, { keepValues: true })
    navigate({ to: '/vagas/$vagaId', params: { vagaId: vaga.id } })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <NotaObrigatorios />
        <fieldset className='space-y-4'>
          <legend className='text-sm font-semibold'>Identificação</legend>
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='chamado'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nº do chamado
                    <Obrigatorio />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ex.: CH-500123'
                      autoComplete='off'
                      spellCheck={false}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Informe o Nº do chamado ou o Código da vaga (pelo menos um).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='codigoVaga'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Código da vaga
                    <Obrigatorio />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ex.: VG-2026-001'
                      autoComplete='off'
                      spellCheck={false}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Somente leitura (fora do form state) — vínculo de reabertura não
                é editável */}
            <FormItem>
              <FormLabel>Código da vaga de origem</FormLabel>
              <FormControl>
                <Input
                  value={vagaOrigem?.codigoVaga ?? vaga.reaberturaDe ?? '—'}
                  readOnly
                  aria-readonly='true'
                  className='bg-muted text-muted-foreground'
                />
              </FormControl>
              <FormDescription>
                {vaga.reaberturaDe
                  ? 'Vínculo criado na reabertura — não editável.'
                  : 'Preenchido automaticamente quando a vaga é uma reabertura.'}
              </FormDescription>
            </FormItem>
          </div>
        </fieldset>
        <fieldset className='space-y-4'>
          <legend className='text-sm font-semibold'>Solicitante</legend>
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='gestorSolicitante'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Gestor solicitante
                    <Obrigatorio />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Nome do gestor'
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
              name='unidade'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Unidade
                    <Obrigatorio />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ex.: SESI Centro'
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
              name='area'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Área
                    <Obrigatorio />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ex.: Educação'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>
        <fieldset className='space-y-4'>
          <legend className='text-sm font-semibold'>Perfil da vaga</legend>
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='cargo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Cargo
                    <Obrigatorio />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ex.: Analista de RH'
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
              name='tipoContrato'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tipo de contrato
                    <Obrigatorio />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecione o tipo' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tipoContratoOptions.map((opt) => (
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
              name='nivel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível</FormLabel>
                  <Select
                    onValueChange={(v) =>
                      field.onChange(v === NIVEL_NENHUM ? undefined : v)
                    }
                    value={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecione o nível' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NIVEL_NENHUM}>—</SelectItem>
                      {nivelOptions.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
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
              name='funcao'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Função específica'
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
              name='motivoContratacao'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo da contratação</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ex.: Substituição'
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
              name='pcd'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center gap-3 pt-2'>
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className='!mt-0'>Vaga destinada a PcD</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>
        <fieldset className='space-y-4'>
          <legend className='text-sm font-semibold'>Datas e responsável</legend>
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='recrutadora'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Recrutadora
                    <Obrigatorio />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Nome da recrutadora'
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
              name='dataAbertura'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Data de abertura
                    <Obrigatorio />
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value}
                      onSelect={field.onChange}
                      desabilitarFuturo
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='dataRecebimento'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de recebimento</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value}
                      onSelect={field.onChange}
                      desabilitarFuturo
                      limpavel
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>
        <FormField
          control={form.control}
          name='observacoes'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Informações adicionais sobre a vaga'
                  className='resize-none'
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex gap-2'>
          <Button type='submit'>Salvar alterações</Button>
          <Button
            type='button'
            variant='outline'
            onClick={() =>
              navigate({ to: '/vagas/$vagaId', params: { vagaId: vaga.id } })
            }
          >
            Cancelar
          </Button>
        </div>
        {dialogoDescarte}
      </form>
    </Form>
  )
}
