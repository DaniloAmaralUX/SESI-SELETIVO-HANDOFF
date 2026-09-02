import { Link } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { ForgotPasswordForm } from './components/forgot-password-form'

export function ForgotPassword() {
  return (
    <AuthLayout>
      <div className='flex flex-col gap-6'>
        <div className='stagger-item space-y-1.5'>
          <h1 className='font-(family-name:--font-heading) text-2xl font-semibold tracking-tight text-balance'>
            Redefinir senha
          </h1>
          <p className='text-sm text-pretty text-muted-foreground'>
            Informe seu e-mail cadastrado e enviaremos um link para redefinir a
            senha.
          </p>
        </div>
        <div className='stagger-item'>
          <ForgotPasswordForm />
        </div>
        <p className='stagger-item text-center text-sm text-balance text-muted-foreground'>
          Lembrou a senha?{' '}
          <Link
            to='/sign-in'
            className='underline underline-offset-4 hover:text-primary'
          >
            Voltar para o login
          </Link>
          .
        </p>
      </div>
    </AuthLayout>
  )
}
