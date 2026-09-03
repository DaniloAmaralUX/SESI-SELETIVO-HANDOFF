import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PapelSwitcher } from '@/components/papel-switcher'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { VagaForm } from './components/vaga-form'
import { useVaga } from './data/vagas-store'

function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <PapelSwitcher />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col'>
        {/* Coluna de leitura: 768px (grid de 8) centralizada no container */}
        <div className='mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6'>
          {children}
        </div>
      </Main>
    </>
  )
}

export function NovaVagaPage() {
  return (
    <Chrome>
      <div>
        <Button
          variant='ghost'
          size='sm'
          className='-ms-3 text-muted-foreground'
          asChild
        >
          <Link to='/vagas'>
            <ArrowLeft className='size-4' />
            Voltar para vagas
          </Link>
        </Button>
      </div>
      <div className='space-y-2'>
        <h1 className='text-2xl font-bold tracking-tight'>Nova vaga</h1>
        <p className='text-pretty text-muted-foreground'>
          A vaga é criada como Rascunho. O prazo (SLA) começa a contar quando
          você muda o status para Aberta.
        </p>
      </div>
      <VagaForm mode='criar' />
    </Chrome>
  )
}

export function EditarVagaPage() {
  const { vagaId } = useParams({
    from: '/_authenticated/vagas/$vagaId/editar',
  })
  const vaga = useVaga(vagaId)

  return (
    <Chrome>
      <div>
        <Button
          variant='ghost'
          size='sm'
          className='-ms-3 text-muted-foreground'
          asChild
        >
          <Link to='/vagas/$vagaId' params={{ vagaId }} disabled={!vaga}>
            <ArrowLeft className='size-4' />
            Voltar para a vaga
          </Link>
        </Button>
      </div>
      {vaga ? (
        <>
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold tracking-tight'>Editar vaga</h1>
            <p className='text-pretty text-muted-foreground'>
              Chamado {vaga.chamado} · {vaga.cargo}
            </p>
          </div>
          <VagaForm mode='editar' vaga={vaga} />
        </>
      ) : (
        <div className='flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Vaga não encontrada
          </h1>
          <Button asChild>
            <Link to='/vagas'>
              <ArrowLeft className='size-4' />
              Voltar para a lista de vagas
            </Link>
          </Button>
        </div>
      )}
    </Chrome>
  )
}
