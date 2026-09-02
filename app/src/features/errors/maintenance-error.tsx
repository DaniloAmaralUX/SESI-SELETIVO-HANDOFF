import { Button } from '@/components/ui/button'

export function MaintenanceError() {
  return (
    <main className='min-h-svh'>
      <div className='m-auto flex min-h-svh w-full flex-col items-center justify-center gap-2'>
        <p aria-hidden='true' className='text-[7rem] leading-tight font-bold'>
          503
        </p>
        <h1 className='text-xl font-medium'>Sistema em manutenção</h1>
        <p className='text-center text-muted-foreground'>
          Estamos concluindo uma atualização. <br />
          Tente novamente em alguns minutos.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    </main>
  )
}
