import { useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

// Sem auto-cadastro: contas são criadas pela administração (B3) — por isso
// não há link de "criar conta".
export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <Card className='max-w-sm gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>Entrar</CardTitle>
          <CardDescription>
            Informe seu e-mail e senha para acessar
            <br className='max-sm:hidden' /> o sistema de gestão de vagas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
        <CardFooter>
          <p className='px-8 text-center text-sm text-muted-foreground'>
            Acesso restrito ao time de RH do SESI/PE. Em caso de dúvida, procure
            a administração do sistema.
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
