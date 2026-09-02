import { useMemo } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PapelSwitcher } from '@/components/papel-switcher'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useVagas } from '@/features/vagas/data/vagas-store'
import { slaDaVaga } from '@/features/vagas/lib/sla-vaga'
import { AtencaoList } from './components/atencao-list'
import { HeroSlaCard } from './components/hero-sla-card'
import { PipelineChart } from './components/pipeline-chart'
import { StatusCompositionBar } from './components/status-composition-bar'
import { UnidadeRanking } from './components/unidade-ranking'
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
//
// Bento com hierarquia real: (A) herói de SLA — a pergunta nº 1, (B) fila de
// atenção — a ação, (C) composição/pipeline/ranking — o contexto. Um único
// grid, sem repetição de forma entre as células.

export function Dashboard() {
  const vagas = useVagas()

  // As agregações varrem a lista inteira e o SLA de cada vaga é DERIVADO
  // (slaDaVaga percorre dia a dia o intervalo). Sem memo isso recalcularia a
  // cada render do painel — troca de tema, abertura do drawer, digitação na
  // busca —, e o custo cresce com o volume real de vagas.
  const { sla, porStatus, porAcao, porUnidade, atencao } = useMemo(
    () => ({
      sla: resumoSla(vagas, slaDaVaga),
      porStatus: contagemPorStatus(vagas),
      porAcao: contagemPorAcao(vagas),
      porUnidade: contagemPorUnidade(vagas),
      atencao: vagasEmAtencao(vagas, slaDaVaga),
    }),
    [vagas]
  )

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
      {/* Entrada em cascata (better-ui): título → células do bento, ~100ms */}
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='stagger-item'>
          <h1 className='text-2xl font-bold tracking-tight'>Painel</h1>
          {/* Neutro de persona: o painel é visível a todos os papéis */}
          <p className='text-muted-foreground'>
            Saúde do SLA e andamento das vagas num só lugar
          </p>
        </div>

        {/* ===== Bento ===== */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-6 xl:gap-6'>
          <div className='stagger-item sm:col-span-2 lg:col-span-4'>
            <HeroSlaCard sla={sla} />
          </div>
          <div className='stagger-item sm:col-span-2 lg:col-span-2 lg:row-span-2'>
            <AtencaoList atencao={atencao} />
          </div>
          <div className='stagger-item sm:col-span-2 lg:col-span-4'>
            <StatusCompositionBar porStatus={porStatus} />
          </div>
          <div className='stagger-item sm:col-span-2 lg:col-span-4'>
            <PipelineChart porAcao={porAcao} />
          </div>
          <div className='stagger-item sm:col-span-2 lg:col-span-2'>
            <UnidadeRanking porUnidade={porUnidade} />
          </div>
        </div>
      </Main>
    </>
  )
}
