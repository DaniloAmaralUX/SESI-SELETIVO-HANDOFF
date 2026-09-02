import { useSearch } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

// Sem auto-cadastro: contas são criadas pela administração (B3) — por isso
// não há link de "criar conta".
export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      {/* Entrada em cascata (better-ui): título → formulário → aviso */}
      <div className='flex flex-col gap-6'>
        <div className='stagger-item space-y-1.5'>
          <h1 className='font-(family-name:--font-heading) text-2xl font-semibold tracking-tight text-balance'>
            Entrar
          </h1>
          <p className='text-sm text-pretty text-muted-foreground'>
            Informe seu e-mail e senha para acessar o sistema de gestão de
            vagas.
          </p>
        </div>
        <div className='stagger-item'>
          <UserAuthForm redirectTo={redirect} />
        </div>
        <p className='stagger-item text-center text-sm text-balance text-muted-foreground'>
          Acesso restrito ao time de RH do SESI/PE. Em caso de dúvida, procure a
          administração do sistema.
        </p>
      </div>
    </AuthLayout>
  )
}
