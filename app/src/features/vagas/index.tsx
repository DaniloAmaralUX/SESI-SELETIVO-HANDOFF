import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PapelSwitcher } from '@/components/papel-switcher'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { VagasTable } from './components/vagas-table'
import { useVagas } from './data/vagas-store'

export function Vagas() {
  const vagas = useVagas()
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
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Vagas</h2>
            <p className='text-muted-foreground'>
              Acompanhe as vagas e o andamento dos processos seletivos
            </p>
          </div>
          <Button asChild>
            <Link to='/vagas/nova'>
              <Plus className='size-4' />
              Nova vaga
            </Link>
          </Button>
        </div>
        <VagasTable data={vagas} />
      </Main>
    </>
  )
}
