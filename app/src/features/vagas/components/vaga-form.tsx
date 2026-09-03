import { useId } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useGuardaForm } from '@/hooks/use-guarda-form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

// Ritmo vertical do formulário no grid de 8px: rótulo 16 + gap 8 + controle 40
// = 64. O DS usa h-9 (36px) como padrão; aqui os controles sobem para 40px.
const ALTURA_CAMPO = 'h-10'
// SelectTrigger fixa a altura por data-size — a sobrescrita precisa da mesma
// variante para o tailwind-merge substituir em vez de empatar.
const ALTURA_SELECT = 'w-full data-[size=default]:h-10'
// Célula que ocupa a linha inteira da grade (checkbox, textarea)
const LINHA_INTEIRA = 'sm:col-span-2'

// Rótulo com marcador de obrigatório colado ao texto (gap-1 em vez do gap-2
// do Label) + anúncio para leitor de tela.
function Rotulo({
  obrigatorio = false,
  children,
}: {
  obrigatorio?: boolean
  children: React.ReactNode
}) {
  return (
    <FormLabel className='gap-1 leading-4'>
      {children}
      {obrigatorio && (
        <>
          <span className='text-destructive' aria-hidden='true'>
            *
          </span>
          <span className='sr-only'>(obrigatório)</span>
        </>
      )}
    </FormLabel>
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

// Seção do formulário: Card com título/descrição e grade de 2 colunas
// (gap 32px horizontal / 24px vertical → colunas de 344px) alinhada ao topo —
// células com descrição não empurram o rótulo da célula vizinha para baixo.
function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string
  descricao?: string
  children: React.ReactNode
}) {
  const id = useId()
  return (
    <Card role='group' aria-labelledby={id}>
      <CardHeader>
        <CardTitle id={id}>{titulo}</CardTitle>
        {descricao && <CardDescription>{descricao}</CardDescription>}
      </CardHeader>
      <CardContent className='grid items-start gap-x-8 gap-y-6 sm:grid-cols-2'>
        {children}
      </CardContent>
    </Card>
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
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <NotaObrigatorios />
        <Secao
          titulo='Identificação'
          descricao='Informe o nº do chamado ou o código da vaga (pelo menos um).'
        >
          <FormField
            control={form.control}
            name='chamado'
            render={({ field }) => (
              <FormItem>
                <Rotulo obrigatorio>Nº do chamado</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Ex.: CH-500123'
                    autoComplete='off'
                    spellCheck={false}
                    className={ALTURA_CAMPO}
                    {...field}
                  />
                </FormControl>
                {/* B5: obrigatoriedade condicional — o refine do schema
                    deposita o erro neste campo (path: ['chamado']) */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='codigoVaga'
            render={({ field }) => (
              <FormItem>
                <Rotulo obrigatorio>Código da vaga</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Ex.: VG-2026-001'
                    autoComplete='off'
                    spellCheck={false}
                    className={ALTURA_CAMPO}
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
            <Rotulo>Código da vaga de origem</Rotulo>
            <FormControl>
              <Input
                value='—'
                readOnly
                aria-readonly='true'
                className={cn(ALTURA_CAMPO, 'bg-muted text-muted-foreground')}
              />
            </FormControl>
            <FormDescription>
              Preenchido automaticamente quando a vaga é uma reabertura.
            </FormDescription>
          </FormItem>
        </Secao>

        <Secao titulo='Solicitante'>
          <FormField
            control={form.control}
            name='gestorSolicitante'
            render={({ field }) => (
              <FormItem>
                <Rotulo obrigatorio>Gestor solicitante</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Nome do gestor'
                    className={ALTURA_CAMPO}
                    {...field}
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
                <Rotulo obrigatorio>Unidade</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Ex.: SESI Centro'
                    className={ALTURA_CAMPO}
                    {...field}
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
                <Rotulo obrigatorio>Área</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Ex.: Educação'
                    className={ALTURA_CAMPO}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Secao>

        <Secao titulo='Perfil da vaga'>
          <FormField
            control={form.control}
            name='cargo'
            render={({ field }) => (
              <FormItem>
                <Rotulo obrigatorio>Cargo</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Ex.: Analista de RH'
                    className={ALTURA_CAMPO}
                    {...field}
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
                <Rotulo obrigatorio>Tipo de contrato</Rotulo>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={ALTURA_SELECT}>
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
                <Rotulo>Nível</Rotulo>
                <Select
                  onValueChange={(v) =>
                    field.onChange(v === NIVEL_NENHUM ? undefined : v)
                  }
                  value={field.value ?? ''}
                >
                  <FormControl>
                    <SelectTrigger className={ALTURA_SELECT}>
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
                <Rotulo>Função</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Função específica'
                    className={ALTURA_CAMPO}
                    {...field}
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
                <Rotulo>Motivo da contratação</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Ex.: Substituição'
                    className={ALTURA_CAMPO}
                    {...field}
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
              <FormItem className={cn('flex items-start gap-3', LINHA_INTEIRA)}>
                <FormControl>
                  <Checkbox
                    className='mt-0.5'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='grid gap-1'>
                  <FormLabel className='leading-5'>
                    Vaga destinada a PcD
                  </FormLabel>
                  <FormDescription>
                    Reserva para pessoa com deficiência.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </Secao>

        <Secao titulo='Datas e responsável'>
          <FormField
            control={form.control}
            name='dataAbertura'
            render={({ field }) => (
              <FormItem>
                <Rotulo obrigatorio>Data de abertura</Rotulo>
                <FormControl>
                  <DatePicker
                    selected={field.value}
                    onSelect={field.onChange}
                    desabilitarFuturo
                    className={ALTURA_CAMPO}
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
                <Rotulo>Data de recebimento</Rotulo>
                <FormControl>
                  <DatePicker
                    selected={field.value}
                    onSelect={field.onChange}
                    desabilitarFuturo
                    limpavel
                    className={ALTURA_CAMPO}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='recrutadora'
            render={({ field }) => (
              <FormItem>
                <Rotulo obrigatorio>Recrutadora</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Nome da recrutadora'
                    className={ALTURA_CAMPO}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Secao>

        <Secao titulo='Observações'>
          <FormField
            control={form.control}
            name='observacoes'
            render={({ field }) => (
              <FormItem className={LINHA_INTEIRA}>
                {/* Título do card já nomeia o grupo — rótulo só para leitor de tela */}
                <FormLabel className='sr-only'>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Informações adicionais sobre a vaga'
                    className='min-h-32 resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Secao>

        <div className='flex flex-wrap gap-2'>
          <Button type='submit' size='lg'>
            Criar vaga
          </Button>
          <Button
            type='button'
            variant='outline'
            size='lg'
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
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <NotaObrigatorios />
        <Secao
          titulo='Identificação'
          descricao='Informe o nº do chamado ou o código da vaga (pelo menos um).'
        >
          <FormField
            control={form.control}
            name='chamado'
            render={({ field }) => (
              <FormItem>
                <Rotulo obrigatorio>Nº do chamado</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Ex.: CH-500123'
                    autoComplete='off'
                    spellCheck={false}
                    className={ALTURA_CAMPO}
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
            name='codigoVaga'
            render={({ field }) => (
              <FormItem>
                <Rotulo obrigatorio>Código da vaga</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Ex.: VG-2026-001'
                    autoComplete='off'
                    spellCheck={false}
                    className={ALTURA_CAMPO}
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
            <Rotulo>Código da vaga de origem</Rotulo>
            <FormControl>
              <Input
                value={vagaOrigem?.codigoVaga ?? vaga.reaberturaDe ?? '—'}
                readOnly
                aria-readonly='true'
                className={cn(ALTURA_CAMPO, 'bg-muted text-muted-foreground')}
              />
            </FormControl>
            <FormDescription>
              {vaga.reaberturaDe
                ? 'Vínculo criado na reabertura — não editável.'
                : 'Preenchido automaticamente quando a vaga é uma reabertura.'}
            </FormDescription>
          </FormItem>
        </Secao>

        <Secao titulo='Solicitante'>
          <FormField
            control={form.control}
            name='gestorSolicitante'
            render={({ field }) => (
              <FormItem>
                <Rotulo obrigatorio>Gestor solicitante</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Nome do gestor'
                    className={ALTURA_CAMPO}
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
                <Rotulo obrigatorio>Unidade</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Ex.: SESI Centro'
                    className={ALTURA_CAMPO}
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
                <Rotulo obrigatorio>Área</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Ex.: Educação'
                    className={ALTURA_CAMPO}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Secao>

        <Secao titulo='Perfil da vaga'>
          <FormField
            control={form.control}
            name='cargo'
            render={({ field }) => (
              <FormItem>
                <Rotulo obrigatorio>Cargo</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Ex.: Analista de RH'
                    className={ALTURA_CAMPO}
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
                <Rotulo obrigatorio>Tipo de contrato</Rotulo>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={ALTURA_SELECT}>
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
                <Rotulo>Nível</Rotulo>
                <Select
                  onValueChange={(v) =>
                    field.onChange(v === NIVEL_NENHUM ? undefined : v)
                  }
                  value={field.value ?? ''}
                >
                  <FormControl>
                    <SelectTrigger className={ALTURA_SELECT}>
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
                <Rotulo>Função</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Função específica'
                    className={ALTURA_CAMPO}
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
                <Rotulo>Motivo da contratação</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Ex.: Substituição'
                    className={ALTURA_CAMPO}
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
              <FormItem className={cn('flex items-start gap-3', LINHA_INTEIRA)}>
                <FormControl>
                  <Checkbox
                    className='mt-0.5'
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='grid gap-1'>
                  <FormLabel className='leading-5'>
                    Vaga destinada a PcD
                  </FormLabel>
                  <FormDescription>
                    Reserva para pessoa com deficiência.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </Secao>

        <Secao titulo='Datas e responsável'>
          <FormField
            control={form.control}
            name='dataAbertura'
            render={({ field }) => (
              <FormItem>
                <Rotulo obrigatorio>Data de abertura</Rotulo>
                <FormControl>
                  <DatePicker
                    selected={field.value}
                    onSelect={field.onChange}
                    desabilitarFuturo
                    className={ALTURA_CAMPO}
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
                <Rotulo>Data de recebimento</Rotulo>
                <FormControl>
                  <DatePicker
                    selected={field.value}
                    onSelect={field.onChange}
                    desabilitarFuturo
                    limpavel
                    className={ALTURA_CAMPO}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='recrutadora'
            render={({ field }) => (
              <FormItem>
                <Rotulo obrigatorio>Recrutadora</Rotulo>
                <FormControl>
                  <Input
                    placeholder='Nome da recrutadora'
                    className={ALTURA_CAMPO}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Secao>

        <Secao titulo='Observações'>
          <FormField
            control={form.control}
            name='observacoes'
            render={({ field }) => (
              <FormItem className={LINHA_INTEIRA}>
                {/* Título do card já nomeia o grupo — rótulo só para leitor de tela */}
                <FormLabel className='sr-only'>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Informações adicionais sobre a vaga'
                    className='min-h-32 resize-none'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Secao>

        <div className='flex flex-wrap gap-2'>
          <Button type='submit' size='lg'>
            Salvar alterações
          </Button>
          <Button
            type='button'
            variant='outline'
            size='lg'
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
