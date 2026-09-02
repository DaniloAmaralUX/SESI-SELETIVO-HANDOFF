import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import NumberFlow from '@number-flow/react'
import { BarChart3, Download } from 'lucide-react'
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfigDrawer } from '@/components/config-drawer'
import { DatePicker } from '@/components/date-picker'
// Tabs do iconiq (r-tabs): indicador animado — mesma família do detalhe
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/iconiq/r-tabs'
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
import { SLA_META_DIAS_UTEIS } from '@/features/vagas/lib/sla'
import { slaDaVaga } from '@/features/vagas/lib/sla-vaga'
import { RankingDimensao } from './components/ranking-dimensao'
import {
  DIMENSAO_LABELS,
  DIMENSOES,
  agregarRelatorio,
  filtrarPorPeriodo,
  type Dimensao,
} from './lib/relatorios'

// Relatórios analíticos (RF24/RF25): recorte por dimensão + período, com
// tabela agregada, ranking de barras e exportação CSV. Agregações em lib/.

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

  // Soma geral para o rótulo de participação `total (share%)` das barras
  const somaTotal = linhas.reduce((soma, linha) => soma + linha.total, 0)

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

        {/* Filtros como linha quieta em GRID: coluna flexível para as abas
            (min-w-0 → scroll interno) + coluna fixa para o período. Sem card:
            hierarquia por espaço, não por molduras (interface-design) */}
        <div className='stagger-item grid items-end gap-x-8 gap-y-3 lg:grid-cols-[minmax(0,1fr)_auto]'>
          <div className='flex min-w-0 flex-col gap-2'>
            <Label id='agrupar-por-label'>Agrupar por</Label>
            {/* r-tabs: o indicador animado desliza entre as dimensões.
                [&>.mt-10]:hidden esconde a ÁREA DE CONTEÚDO do componente
                (os stubs abaixo existem só para resolver a aba ativa) —
                sem isso ela vira 40px de gap fantasma sob as abas */}
            <Tabs
              value={dimensao}
              onValueChange={(valor) => valor && setDimensao(valor as Dimensao)}
              className='[&>.mt-10]:hidden'
            >
              <TabsList
                aria-labelledby='agrupar-por-label'
                className='max-w-full justify-start overflow-x-auto p-1'
              >
                {DIMENSOES.map((d) => (
                  <TabsTrigger key={d} value={d} className='px-4 py-2'>
                    {DIMENSAO_LABELS[d]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {DIMENSOES.map((d) => (
                <TabsContent key={d} value={d} className='hidden' />
              ))}
            </Tabs>
          </div>
          <div className='flex flex-wrap items-end gap-x-4 gap-y-3'>
            <div className='flex flex-col gap-2'>
              <Label id='periodo-de-label'>De</Label>
              <DatePicker
                id='periodo-de'
                aria-labelledby='periodo-de-label periodo-de'
                selected={de}
                onSelect={setDe}
                limpavel
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label id='periodo-ate-label'>Até</Label>
              <DatePicker
                id='periodo-ate'
                aria-labelledby='periodo-ate-label periodo-ate'
                selected={ate}
                onSelect={setAte}
                limpavel
              />
            </div>
          </div>
        </div>

        {linhas.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <BarChart3 />
              </EmptyMedia>
              <EmptyTitle>Nenhuma vaga no período</EmptyTitle>
              {/* Desc não repete o título: diz o porquê + como resolver */}
              <EmptyDescription>
                Nenhuma vaga foi aberta entre as datas selecionadas. Ajuste ou
                limpe o período para ver os recortes.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant='outline'
                onClick={() => {
                  setDe(undefined)
                  setAte(undefined)
                }}
              >
                Limpar período
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
            <Card className='stagger-item shadow-(--shadow-border) transition-shadow duration-200 ease-out hover:shadow-(--shadow-border-hover)'>
              <CardHeader>
                <CardTitle role='heading' aria-level={2}>
                  Vagas por {DIMENSAO_LABELS[dimensao]}
                </CardTitle>
                <CardDescription>
                  <NumberFlow value={somaTotal} />{' '}
                  {somaTotal === 1 ? 'vaga' : 'vagas'} no recorte
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Leitores de tela recebem o resumo; o ranking é decorativo */}
                <p className='sr-only'>
                  {linhas
                    .map((linha) => `${linha.chave}: ${linha.total} vagas`)
                    .join('. ')}
                </p>
                <RankingDimensao
                  linhas={linhas}
                  porStatus={dimensao === 'status'}
                />
              </CardContent>
            </Card>

            <Card className='stagger-item shadow-(--shadow-border) transition-shadow duration-200 ease-out hover:shadow-(--shadow-border-hover)'>
              <CardHeader>
                <CardTitle role='heading' aria-level={2}>
                  Detalhamento
                </CardTitle>
                <CardDescription>
                  {`Prazo medido pela meta de ${SLA_META_DIAS_UTEIS} dias úteis`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto rounded-md shadow-(--shadow-border)'>
                  <Table>
                    <TableCaption className='sr-only'>
                      Vagas por {DIMENSAO_LABELS[dimensao]}: total, ativas,
                      finalizadas, percentual no prazo e média de SLA em dias
                      úteis
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead scope='col'>
                          {DIMENSAO_LABELS[dimensao]}
                        </TableHead>
                        <TableHead scope='col' className='text-end'>
                          Total
                        </TableHead>
                        <TableHead scope='col' className='text-end'>
                          Ativas
                        </TableHead>
                        <TableHead scope='col' className='text-end'>
                          Finalizadas
                        </TableHead>
                        <TableHead scope='col' className='text-end'>
                          % no prazo
                        </TableHead>
                        <TableHead scope='col' className='text-end'>
                          Média de SLA (dias úteis)
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
                            {linha.finalizadas === 0
                              ? '—'
                              : `${linha.percentualNoPrazo}%`}
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
