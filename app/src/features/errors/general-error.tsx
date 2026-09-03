import { useNavigate, useRouter } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean
}

export function GeneralError({
  className,
  minimal = false,
}: GeneralErrorProps) {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <main className={cn('min-h-svh w-full', className)}>
      <div className='m-auto flex min-h-svh w-full flex-col items-center justify-center gap-2'>
        {!minimal && (
          <p aria-hidden='true' className='text-[7rem] leading-tight font-bold'>
            500
          </p>
        )}
        <h1 className='text-xl font-medium'>
          Não foi possível carregar a página
        </h1>
        <p className='text-center text-muted-foreground'>
          Tente novamente em instantes. <br />
          Se persistir, procure o suporte do SESI.
        </p>
        {!minimal && (
          <div className='mt-6 flex gap-4'>
            <Button variant='outline' onClick={() => history.go(-1)}>
              Voltar
            </Button>
            <Button onClick={() => navigate({ to: '/' })}>
              Ir para o início
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
