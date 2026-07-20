import { Link } from '@tanstack/react-router'
import { AlertTriangle, Briefcase, CircleCheck, Timer } from 'lucide-react'
import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PapelSwitcher } from '@/components/papel-switcher'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SlaIndicator } from '@/features/vagas/components/sla-indicator'
import { StatusBadge } from '@/features/vagas/components/status-badge'
import { type StatusVaga } from '@/features/vagas/data/schema'
import { useVagas } from '@/features/vagas/data/vagas-store'
import { SLA_META_DIAS_UTEIS } from '@/features/vagas/lib/sla'
import { slaDaVaga } from '@/features/vagas/lib/sla-vaga'
import {
  contagemPorAcao,
  contagemPorStatus,
  contagemPorUnidade,
  resumoSla,
  vagasEmAtencao,
} from './lib/indicadores'

// Painel da Gestora de RH — indicadores REAIS das Vagas, todos derivados do
// store via funções puras de agregação (lib/indicadores). Só dados agregados,
// nada de campo sensível de candidato (LGPD).

// Cor de cada Status para as barras do gráfico (tokens --status-* do theme.css,
// expostos como --color-status-* dentro do @theme).
const statusFill: Record<StatusVaga, string> = {
  aberta: 'var(--color-status-aberta)',
  suspensa: 'var(--color-status-suspensa)',
  congelada: 'var(--color-status-congelada)',
  cancelada: 'var(--color-status-cancelada)',
  finalizada: 'var(--color-status-finalizada)',
  arquivada: 'var(--color-status-arquivada)',
}

// Config do wrapper Chart (shadcn): série única "total"
const chartConfig = {
  total: { label: 'Vagas', color: 'var(--primary)' },
} satisfies ChartConfig

const MAX_ATENCAO = 8

export function Dashboard() {
  const vagas = useVagas()

  const sla = resumoSla(vagas, slaDaVaga)
  const porStatus = contagemPorStatus(vagas)
  const porAcao = contagemPorAcao(vagas)
  const porUnidade = contagemPorUnidade(vagas)
  const atencao = vagasEmAtencao(vagas, slaDaVaga)

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header fixed>
        <Search className='me-auto' />
        <PapelSwitcher />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      {/* ===== Main ===== */}
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Painel</h1>
          <p className='text-muted-foreground'>
            Visão da Gestora de RH — acompanhamento das vagas e do SLA
          </p>
        </div>

        {/* ===== KPIs ===== */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <KpiCard
            title='Vagas ativas'
            icon={Briefcase}
            value={sla.total}
            hint='Abertas, suspensas ou congeladas'
          />
          <KpiCard
            title='Dentro da meta'
            icon={CircleCheck}
            value={`${sla.percentualDentroMeta}%`}
            hint={`${sla.dentroMeta} de ${sla.total} vaga(s) ativas`}
          />
          <KpiCard
            title='Estouradas'
            icon={AlertTriangle}
            value={sla.estourado}
            hint={`SLA acima de ${SLA_META_DIAS_UTEIS} dias úteis`}
            emphasis={sla.estourado > 0}
          />
          <KpiCard
            title='Tempo médio'
            icon={Timer}
            value={sla.mediaDiasUteis}
            hint={`de ${SLA_META_DIAS_UTEIS} dias úteis de meta`}
          />
        </div>

        {/* ===== Gráficos ===== */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Vagas por status */}
          <Card>
            <CardHeader>
              <CardTitle>Vagas por status</CardTitle>
              <CardDescription>
                Distribuição de todas as vagas pela situação atual
              </CardDescription>
            </CardHeader>
            <CardContent className='ps-2'>
              <ChartContainer config={chartConfig} className='h-75 w-full'>
                <BarChart accessibilityLayer data={porStatus}>
                  <XAxis
                    dataKey='label'
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    width={28}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent labelKey='label' />}
                  />
                  <Bar dataKey='total' radius={[4, 4, 0, 0]}>
                    {porStatus.map((item) => (
                      <Cell key={item.status} fill={statusFill[item.status]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Pipeline por etapa */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline por etapa</CardTitle>
              <CardDescription>
                Em que ação estão as vagas ativas (10 etapas)
              </CardDescription>
            </CardHeader>
            <CardContent className='ps-2'>
              <ChartContainer config={chartConfig} className='h-85 w-full'>
                <BarChart
                  layout='vertical'
                  accessibilityLayer
                  data={porAcao}
                  margin={{ left: 8, right: 16 }}
                >
                  <XAxis
                    type='number'
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis
                    type='category'
                    dataKey='label'
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    width={150}
                    interval={0}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent labelKey='label' />}
                  />
                  <Bar
                    dataKey='total'
                    fill='var(--color-total)'
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Vagas por unidade */}
          <Card>
            <CardHeader>
              <CardTitle>Vagas por unidade</CardTitle>
              <CardDescription>
                Total de vagas em cada Unidade do SESI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {porUnidade.length === 0 ? (
                <p className='text-sm text-muted-foreground'>
                  Nenhuma vaga cadastrada.
                </p>
              ) : (
                <UnidadeList itens={porUnidade} />
              )}
            </CardContent>
          </Card>

          {/* Precisam de atenção */}
          <Card>
            <CardHeader>
              <CardTitle>Precisam de atenção</CardTitle>
              <CardDescription>
                Vagas ativas em atenção ou com SLA estourado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {atencao.length === 0 ? (
                <Empty className='py-8'>
                  <EmptyHeader>
                    <EmptyMedia variant='icon'>
                      <CircleCheck className='text-sla-ok' />
                    </EmptyMedia>
                    <EmptyTitle>Tudo em dia</EmptyTitle>
                    <EmptyDescription>
                      Nenhuma vaga ativa precisa de atenção no momento.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <ul className='divide-y'>
                  {atencao.slice(0, MAX_ATENCAO).map(({ vaga, sla: dias }) => (
                    <li key={vaga.id}>
                      <Link
                        to='/vagas/$vagaId'
                        params={{ vagaId: vaga.id }}
                        className='flex flex-wrap items-center justify-between gap-2 py-3 transition-colors hover:bg-muted/50'
                      >
                        <div className='flex min-w-0 items-center gap-2'>
                          <span className='truncate font-medium'>
                            {vaga.cargo}
                          </span>
                          <StatusBadge status={vaga.status} />
                        </div>
                        <SlaIndicator diasUteis={dias} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {atencao.length > MAX_ATENCAO && (
                <p className='pt-3 text-sm text-muted-foreground'>
                  +{atencao.length - MAX_ATENCAO} outra(s) vaga(s) precisando de
                  atenção.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}

type KpiCardProps = {
  title: string
  icon: React.ComponentType<{ className?: string }>
  value: string | number
  hint: string
  emphasis?: boolean
}

function KpiCard({
  title,
  icon: Icon,
  value,
  hint,
  emphasis = false,
}: KpiCardProps) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon
          className={cn(
            'size-4 text-muted-foreground',
            emphasis && 'text-sla-estourado'
          )}
        />
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'text-2xl font-bold tabular-nums',
            emphasis && 'text-sla-estourado'
          )}
        >
          {value}
        </div>
        <p className='text-xs text-muted-foreground'>{hint}</p>
      </CardContent>
    </Card>
  )
}

function UnidadeList({
  itens,
}: {
  itens: Array<{ unidade: string; total: number }>
}) {
  const maior = Math.max(...itens.map((i) => i.total), 1)
  return (
    <ul className='flex flex-col gap-3'>
      {itens.map((item) => (
        <li key={item.unidade} className='flex flex-col gap-1'>
          <div className='flex items-center justify-between gap-2 text-sm'>
            <span className='truncate'>{item.unidade}</span>
            <span className='font-medium tabular-nums'>{item.total}</span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
            <div
              className='h-full rounded-full bg-primary'
              style={{ width: `${(item.total / maior) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
