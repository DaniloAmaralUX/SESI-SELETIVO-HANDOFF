import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function ForbiddenError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <main className='min-h-svh'>
      <div className='m-auto flex min-h-svh w-full flex-col items-center justify-center gap-2'>
        <p aria-hidden='true' className='text-[7rem] leading-tight font-bold'>
          403
        </p>
        <h1 className='text-xl font-medium'>Você não tem acesso a esta área</h1>
        <p className='text-center text-muted-foreground'>
          Este recurso é restrito a outro papel. <br />
          Fale com a administração se precisar de acesso.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            Voltar
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>
            Ir para o início
          </Button>
        </div>
      </div>
    </main>
  )
}
