import { differenceInCalendarDays, format } from 'date-fns'
import { Link, useParams } from '@tanstack/react-router'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Pencil, RotateCcw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PapelSwitcher } from '@/components/papel-switcher'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SlaIndicator } from '../components/sla-indicator'
import { StatusBadge } from '../components/status-badge'
import { acaoOptions } from '../data/data'
import { type Vaga } from '../data/schema'
import { useVaga } from '../data/vagas-store'
import { podeVerDadosSensiveis, usePapel } from '../lib/papel'
import { slaDaVaga, tempoDoGestorDiasUteis } from '../lib/sla-vaga'
import { AcaoStepper } from './acao-stepper'
import { CampoLinha } from './campo-linha'
import { CampoSensivel } from './campo-sensivel'
import {
  EditarCronograma,
  EditarGestorJuridico,
  EditarResultado,
} from './editar-secao'
import { HistoricoTimeline } from './historico-timeline'
import { MudarAcao } from './mudar-acao'
import { MudarStatus } from './mudar-status'

const ORIGEM_LABELS: Record<Vaga['origemDoCadastro'], string> = {
  manual: 'Manual',
  importacao: 'Importação',
}

const TIPO_CONTRATO_LABELS: Record<Vaga['tipoContrato'], string> = {
  determinado: 'Determinado',
  indeterminado: 'Indeterminado',
  estagiario: 'Estagiário',
  intermitente: 'Intermitente',
}

const GENERO_LABELS: Record<NonNullable<Vaga['genero']>, string> = {
  feminino: 'Feminino',
  masculino: 'Masculino',
  'nao-informado': 'Não informado',
}

function formatarData(data?: Date): string | undefined {
  return data ? format(data, 'dd/MM/yyyy', { locale: ptBR }) : undefined
}

function formatarBool(valor?: boolean): string | undefined {
  if (valor === undefined) return undefined
  return valor ? 'Sim' : 'Não'
}

// Duração em dias corridos entre duas datas — só quando ambas existem
function duracaoEmDias(inicio?: Date, fim?: Date): string | undefined {
  if (!inicio || !fim) return undefined
  const dias = differenceInCalendarDays(fim, inicio)
  return `${dias} ${dias === 1 ? 'dia' : 'dias'}`
}

// Medição do gestor em dias ÚTEIS (B2); "em andamento" enquanto não há retorno
function formatarDiasUteis(
  dias: number | undefined,
  emAndamento: boolean
): string | undefined {
  if (dias === undefined) return undefined
  const base = `${dias} ${dias === 1 ? 'dia útil' : 'dias úteis'}`
  return emAndamento ? `${base} (em andamento)` : base
}

// Wrapper de rota — lê o param e delega ao componente puro
export function VagaDetalhePage() {
  const { vagaId } = useParams({ from: '/_authenticated/vagas/$vagaId' })
  return <VagaDetalhe vagaId={vagaId} />
}

function VagaDetalhe({ vagaId }: { vagaId: string }) {
  const vaga = useVaga(vagaId)

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <PapelSwitcher />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Trilha de navegação (IA §8) */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to='/vagas'>Vagas</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {vaga ? `Chamado ${vaga.chamado}` : 'Vaga não encontrada'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {vaga ? <DetalheConteudo vaga={vaga} /> : <VagaNaoEncontrada />}
      </Main>
    </>
  )
}

function VagaNaoEncontrada() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center'>
      <h2 className='text-2xl font-bold tracking-tight'>Vaga não encontrada</h2>
      <p className='text-muted-foreground'>
        A vaga que você procura não existe ou foi removida.
      </p>
      <Button asChild>
        <Link to='/vagas'>
          <ArrowLeft className='size-4' />
          Voltar para a lista de vagas
        </Link>
      </Button>
    </div>
  )
}

function DetalheConteudo({ vaga }: { vaga: Vaga }) {
  const acao = acaoOptions.find((opcao) => opcao.value === vaga.acaoAtual)
  // Vaga de origem da reabertura — exibida pelo chamado (identificador de exibição)
  const vagaOrigem = useVaga(vaga.reaberturaDe ?? '')
  const papel = usePapel()

  return (
    <>
      {/* Header da vaga: os DOIS EIXOS (Status + Ação atual) lado a lado (ADR 0001) */}
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='space-y-2'>
          <p className='text-sm text-muted-foreground'>
            Chamado {vaga.chamado} · Código {vaga.codigoVaga}
          </p>
          <h2 className='text-2xl font-bold tracking-tight'>{vaga.cargo}</h2>
          <div className='flex flex-wrap items-center gap-2'>
            <StatusBadge status={vaga.status} />
            {acao && (
              <Badge variant='secondary'>
                <acao.icon />
                {acao.label}
              </Badge>
            )}
            <SlaIndicator diasUteis={slaDaVaga(vaga)} />
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' asChild>
            <Link to='/vagas/$vagaId/editar' params={{ vagaId: vaga.id }}>
              <Pencil className='size-4' />
              Editar
            </Link>
          </Button>
          <MudarStatus vaga={vaga} />
          <MudarAcao vaga={vaga} />
        </div>
      </div>

      <Tabs defaultValue='visao-geral' className='gap-4'>
        <TabsList className='max-w-full overflow-x-auto'>
          <TabsTrigger value='visao-geral'>Visão geral</TabsTrigger>
          <TabsTrigger value='processo'>Processo</TabsTrigger>
          <TabsTrigger value='gestor-juridico'>Gestor & Jurídico</TabsTrigger>
          <TabsTrigger value='resultado'>Resultado & Candidato</TabsTrigger>
          <TabsTrigger value='historico'>Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value='visao-geral' className='space-y-4'>
          {vaga.reaberturaDe && (
            <Alert>
              <RotateCcw />
              <AlertDescription>
                <p>
                  Reaberta a partir da Vaga{' '}
                  <Link
                    to='/vagas/$vagaId'
                    params={{ vagaId: vaga.reaberturaDe }}
                    className='font-medium text-foreground underline underline-offset-4'
                  >
                    {vagaOrigem
                      ? `Chamado ${vagaOrigem.chamado} — ${vagaOrigem.cargo}`
                      : vaga.reaberturaDe}
                  </Link>
                </p>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Identificação</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <CampoLinha label='Chamado'>{vaga.chamado}</CampoLinha>
                <CampoLinha label='Código da vaga'>
                  {vaga.codigoVaga}
                </CampoLinha>
                <CampoLinha label='Data de recebimento'>
                  {formatarData(vaga.dataRecebimento)}
                </CampoLinha>
                <CampoLinha label='Data de abertura'>
                  {formatarData(vaga.dataAbertura)}
                </CampoLinha>
                <CampoLinha label='Origem do cadastro'>
                  {ORIGEM_LABELS[vaga.origemDoCadastro]}
                  {vaga.fonteDosDados && (
                    <span className='text-muted-foreground'>
                      {' '}
                      · {vaga.fonteDosDados}
                    </span>
                  )}
                </CampoLinha>
                <CampoLinha label='Recrutadora'>{vaga.recrutadora}</CampoLinha>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Solicitante</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <CampoLinha label='Gestor solicitante'>
                  {vaga.gestorSolicitante}
                </CampoLinha>
                <CampoLinha label='Unidade'>{vaga.unidade}</CampoLinha>
                <CampoLinha label='Área'>{vaga.area}</CampoLinha>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perfil da vaga</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <CampoLinha label='Cargo'>{vaga.cargo}</CampoLinha>
                <CampoLinha label='Nível'>{vaga.nivel}</CampoLinha>
                <CampoLinha label='Função'>{vaga.funcao}</CampoLinha>
                <CampoLinha label='Tipo de contrato'>
                  {TIPO_CONTRATO_LABELS[vaga.tipoContrato]}
                </CampoLinha>
                <CampoLinha label='Motivo da contratação'>
                  {vaga.motivoContratacao}
                </CampoLinha>
                <CampoLinha label='PCD'>{formatarBool(vaga.pcd)}</CampoLinha>
                <div className='sm:col-span-2 lg:col-span-3'>
                  <CampoLinha label='Observações'>
                    {vaga.observacoes}
                  </CampoLinha>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='processo' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Etapas do processo</CardTitle>
            </CardHeader>
            <CardContent>
              <AcaoStepper
                acaoAtual={vaga.acaoAtual}
                dataAcao={vaga.dataAcao}
              />
            </CardContent>
          </Card>

          {/* Cronograma seletivo (RF13) — datas por etapa */}
          <Card>
            <CardHeader>
              <CardTitle>Cronograma seletivo</CardTitle>
              <CardAction>
                <EditarCronograma vaga={vaga} />
              </CardAction>
            </CardHeader>
            <CardContent>
              <dl className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <CampoLinha label='Início das inscrições'>
                  {formatarData(vaga.inscricoesInicio)}
                </CampoLinha>
                <CampoLinha label='Fim das inscrições'>
                  {formatarData(vaga.inscricoesFim)}
                </CampoLinha>
                <CampoLinha label='Prova'>
                  {formatarData(vaga.dataProva)}
                </CampoLinha>
                <CampoLinha label='Entrevista RH'>
                  {formatarData(vaga.dataEntrevistaRh)}
                </CampoLinha>
                <CampoLinha label='Entrevista com gestor'>
                  {formatarData(vaga.dataEntrevistaGestor)}
                </CampoLinha>
                <CampoLinha label='Habilitação'>
                  {formatarData(vaga.dataHabilitacao)}
                </CampoLinha>
                <CampoLinha label='Previsão de admissão'>
                  {formatarData(vaga.previsaoAdmissao)}
                </CampoLinha>
                <CampoLinha label='Admissão'>
                  {formatarData(vaga.dataAdmissao)}
                </CampoLinha>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tempo do gestor e Tempo do jurídico são MEDIÇÕES, não SLAs
            (CONTEXT.md). Gestor mede em dias ÚTEIS (B2); jurídico, em
            dias corridos. */}
        <TabsContent value='gestor-juridico' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Tempo do gestor</CardTitle>
              <CardAction>
                <EditarGestorJuridico vaga={vaga} />
              </CardAction>
            </CardHeader>
            <CardContent>
              <dl className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <CampoLinha label='Encaminhada ao gestor'>
                  {formatarData(vaga.dataEncaminhamentoGestor)}
                </CampoLinha>
                <CampoLinha label='Retorno do gestor'>
                  {formatarData(vaga.dataRetornoGestor)}
                </CampoLinha>
                <CampoLinha label='Duração (dias úteis)'>
                  {formatarDiasUteis(
                    tempoDoGestorDiasUteis(vaga),
                    !vaga.dataRetornoGestor
                  )}
                </CampoLinha>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tempo do jurídico</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <CampoLinha label='Chamado jurídico'>
                  {vaga.chamadoJuridico}
                </CampoLinha>
                <CampoLinha label='Abertura do chamado'>
                  {formatarData(vaga.aberturaChamadoJuridico)}
                </CampoLinha>
                <CampoLinha label='Recebimento do parecer'>
                  {formatarData(vaga.recebimentoParecerJuridico)}
                </CampoLinha>
                <CampoLinha label='Duração (dias corridos)'>
                  {duracaoEmDias(
                    vaga.aberturaChamadoJuridico,
                    vaga.recebimentoParecerJuridico
                  )}
                </CampoLinha>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='resultado'>
          <Card>
            <CardHeader>
              <CardTitle>Resultado & Candidato</CardTitle>
              <CardAction>
                <EditarResultado
                  vaga={vaga}
                  podeEditarSensiveis={podeVerDadosSensiveis(papel)}
                />
              </CardAction>
            </CardHeader>
            <CardContent>
              <dl className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <CampoLinha label='Divulgação do resultado'>
                  {formatarData(vaga.divulgacaoResultado)}
                </CampoLinha>
                <CampoLinha label='Previsão de admissão'>
                  {formatarData(vaga.previsaoAdmissao)}
                </CampoLinha>
                <CampoLinha label='Candidatos aplicados'>
                  {vaga.qtdCandidatosAplicados}
                </CampoLinha>
                <CampoLinha label='Gerou banco'>
                  {formatarBool(vaga.gerouBanco)}
                </CampoLinha>
                <CampoLinha label='Candidato selecionado'>
                  <CampoSensivel>{vaga.candidatoSelecionado}</CampoSensivel>
                </CampoLinha>
                <CampoLinha label='Gênero'>
                  <CampoSensivel>
                    {vaga.genero && GENERO_LABELS[vaga.genero]}
                  </CampoSensivel>
                </CampoLinha>
                <CampoLinha label='Candidato interno'>
                  <CampoSensivel>
                    {formatarBool(vaga.candidatoInterno)}
                  </CampoSensivel>
                </CampoLinha>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='historico'>
          <Card>
            <CardHeader>
              <CardTitle>Histórico de alterações</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <HistoricoTimeline eventos={vaga.historico ?? []} />
              {/* Auditoria (RF17) */}
              <dl className='grid gap-4 border-t pt-4 sm:grid-cols-2'>
                <CampoLinha label='Criada por'>
                  {vaga.criadoPor &&
                    `${vaga.criadoPor} · ${formatarData(vaga.criadoEm)}`}
                </CampoLinha>
                <CampoLinha label='Última alteração'>
                  {vaga.atualizadoPor &&
                    `${vaga.atualizadoPor} · ${formatarData(vaga.atualizadoEm)}`}
                </CampoLinha>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
