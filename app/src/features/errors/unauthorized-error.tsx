import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function UnauthorisedError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <main className='min-h-svh'>
      <div className='m-auto flex min-h-svh w-full flex-col items-center justify-center gap-2'>
        <p aria-hidden='true' className='text-[7rem] leading-tight font-bold'>
          401
        </p>
        <h1 className='text-xl font-medium'>Sessão expirada</h1>
        <p className='text-center text-muted-foreground'>
          Entre novamente para acessar esta área.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            Voltar
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>Entrar</Button>
        </div>
      </div>
    </main>
  )
}
