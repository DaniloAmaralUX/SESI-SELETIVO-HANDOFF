import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { BarChart3, Download } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ConfigDrawer } from '@/components/config-drawer'
import { DatePicker } from '@/components/date-picker'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PapelSwitcher } from '@/components/papel-switcher'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { STATUS_LABELS } from '@/features/vagas/data/campos'
import { type StatusVaga } from '@/features/vagas/data/schema'
import { useVagas } from '@/features/vagas/data/vagas-store'
import { gerarCsv, baixarCsv } from '@/features/vagas/lib/csv'
import { slaDaVaga } from '@/features/vagas/lib/sla-vaga'
import {
  DIMENSAO_LABELS,
  DIMENSOES,
  agregarRelatorio,
  filtrarPorPeriodo,
  type Dimensao,
} from './lib/relatorios'

// Relatórios analíticos (RF24/RF25): recorte por dimensão + período, com
// tabela agregada, gráfico e exportação CSV. Agregações puras em lib/.

const chartConfig = {
  total: { label: 'Vagas', color: 'var(--primary)' },
} satisfies ChartConfig

export function Relatorios() {
  const vagas = useVagas()
  const [dimensao, setDimensao] = useState<Dimensao>('area')
  const [de, setDe] = useState<Date | undefined>(undefined)
  const [ate, setAte] = useState<Date | undefined>(undefined)

  const linhas = useMemo(() => {
    const recorte = filtrarPorPeriodo(vagas, { de, ate })
    const rotuloDe =
      dimensao === 'status'
        ? (valor: string) => STATUS_LABELS[valor as StatusVaga] ?? valor
        : undefined
    return agregarRelatorio(recorte, dimensao, slaDaVaga, rotuloDe)
  }, [vagas, dimensao, de, ate])

  function exportar() {
    const csv = gerarCsv(
      [
        DIMENSAO_LABELS[dimensao],
        'Total',
        'Ativas',
        'Finalizadas',
        'Finalizadas no prazo',
        '% no prazo',
        'Média SLA (dias úteis)',
      ],
      linhas.map((l) => [
        l.chave,
        l.total,
        l.ativas,
        l.finalizadas,
        l.finalizadasNoPrazo,
        `${l.percentualNoPrazo}%`,
        l.mediaSlaDiasUteis,
      ])
    )
    baixarCsv(
      `relatorio-${dimensao}-${format(new Date(), 'yyyy-MM-dd')}.csv`,
      csv
    )
    toast.success('Relatório exportado')
  }

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
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Relatórios</h1>
            <p className='text-muted-foreground'>
              Recortes analíticos das vagas por dimensão e período
            </p>
          </div>
          <Button
            variant='outline'
            onClick={exportar}
            disabled={!linhas.length}
          >
            <Download className='size-4' />
            Exportar CSV
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recorte</CardTitle>
            <CardDescription>
              Dimensão de agrupamento e período pela data de abertura
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-wrap items-end gap-4'>
            <div className='flex flex-col gap-2'>
              <Label>Agrupar por</Label>
              <ToggleGroup
                type='single'
                variant='outline'
                value={dimensao}
                onValueChange={(valor) =>
                  valor && setDimensao(valor as Dimensao)
                }
              >
                {DIMENSOES.map((d) => (
                  <ToggleGroupItem key={d} value={d}>
                    {DIMENSAO_LABELS[d]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className='flex flex-col gap-2'>
              <Label>De</Label>
              <DatePicker selected={de} onSelect={setDe} limpavel />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>Até</Label>
              <DatePicker selected={ate} onSelect={setAte} limpavel />
            </div>
          </CardContent>
        </Card>

        {linhas.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <BarChart3 />
              </EmptyMedia>
              <EmptyTitle>Nenhuma vaga no recorte</EmptyTitle>
              <EmptyDescription>
                Ajuste o período ou limpe as datas para ver os dados.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Vagas por {DIMENSAO_LABELS[dimensao]}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className='max-h-90 w-full'
                >
                  <BarChart
                    layout='vertical'
                    accessibilityLayer
                    data={linhas}
                    margin={{ left: 8, right: 16 }}
                  >
                    <XAxis type='number' allowDecimals={false} hide />
                    <YAxis
                      type='category'
                      dataKey='chave'
                      tickLine={false}
                      axisLine={false}
                      width={150}
                      interval={0}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey='total'
                      fill='var(--color-total)'
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhamento</CardTitle>
                <CardDescription>
                  Prazo medido pela meta de 20 dias úteis (ADR 0002)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{DIMENSAO_LABELS[dimensao]}</TableHead>
                        <TableHead className='text-end'>Total</TableHead>
                        <TableHead className='text-end'>Ativas</TableHead>
                        <TableHead className='text-end'>Finalizadas</TableHead>
                        <TableHead className='text-end'>% no prazo</TableHead>
                        <TableHead className='text-end'>
                          Média SLA (d.ú.)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {linhas.map((linha) => (
                        <TableRow key={linha.chave}>
                          <TableCell className='font-medium'>
                            {linha.chave}
                          </TableCell>
                          <TableCell className='text-end tabular-nums'>
                            {linha.total}
                          </TableCell>
                          <TableCell className='text-end tabular-nums'>
                            {linha.ativas}
                          </TableCell>
                          <TableCell className='text-end tabular-nums'>
                            {linha.finalizadas}
                          </TableCell>
                          <TableCell className='text-end tabular-nums'>
                            {linha.percentualNoPrazo}%
                          </TableCell>
                          <TableCell className='text-end tabular-nums'>
                            {linha.mediaSlaDiasUteis}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Main>
    </>
  )
}
