import { SesiWordmark } from '@/assets/logo'
import { AuthVisualPanel } from './components/auth-visual-panel'

type AuthLayoutProps = {
  children: React.ReactNode
}

// Split de autenticação: coluna de trabalho à esquerda (marca, formulário,
// rodapé) e painel visual interativo à direita (≥lg). O painel é uma moldura
// escura inset — o seam entre as colunas é o próprio respiro do layout.
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className='flex min-h-svh gap-3 bg-background p-3'>
      <div className='flex w-full flex-col px-3 py-4 sm:px-7 lg:w-120 lg:shrink-0'>
        {/* items-center: o wordmark agora é SVG, sem baseline tipográfica */}
        <header className='stagger-item flex items-center gap-2.5'>
          <SesiWordmark className='text-2xl' />
          <span className='text-sm font-medium text-muted-foreground'>
            Processo Seletivo
          </span>
        </header>

        <div className='flex flex-1 items-center py-10'>
          <div className='mx-auto w-full max-w-sm'>{children}</div>
        </div>

        <footer className='stagger-item'>
          <p className='text-center text-xs text-balance text-muted-foreground'>
            Protótipo de gestão de vagas · © 2026 SESI Pernambuco
          </p>
        </footer>
      </div>

      <AuthVisualPanel />
    </main>
  )
}
