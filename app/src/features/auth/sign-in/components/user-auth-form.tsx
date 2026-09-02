import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { sleep, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/iconiq/spinner'
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  email: z.email({
    error: (iss) =>
      iss.input === ''
        ? 'Informe seu e-mail.'
        : 'Use um e-mail válido, como nome@sesi.org.br.',
  }),
  // Comprimento de senha é política de cadastro/redefinição, não de login
  password: z.string().min(1, 'Informe sua senha.'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function signIn(email: string) {
    // Autenticação mockada (B3): entra sempre, como Recrutadora — o
    // PapelSwitcher permite simular os demais papéis
    const mockUser = {
      accountNo: 'ACC001',
      email,
      role: ['recrutadora'],
      // eslint-disable-next-line react-hooks/purity -- só executa em event handlers (login mock)
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
    }

    auth.setUser(mockUser)
    auth.setAccessToken('mock-access-token')

    const targetPath = redirectTo || '/'
    navigate({ to: targetPath, replace: true })
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    toast.promise(sleep(2000), {
      loading: 'Entrando...',
      success: () => {
        setIsLoading(false)
        signIn(data.email)
        return `Você entrou como ${data.email}.`
      },
      error: 'Não foi possível entrar. Verifique sua conexão e tente de novo.',
    })
  }

  function onMicrosoftLogin() {
    const email = 'recrutadora@sesi.org.br'
    signIn(email)
    toast.success(`Você entrou como ${email}.`)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  inputMode='email'
                  autoComplete='email'
                  spellCheck={false}
                  autoCapitalize='none'
                  placeholder='nome@sesi.org.br'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center justify-between gap-2'>
                <FormLabel>Senha</FormLabel>
                <Link
                  to='/forgot-password'
                  className='-my-1 py-1 text-sm font-medium text-muted-foreground transition-opacity hover:opacity-75'
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <FormControl>
                <PasswordInput
                  autoComplete='current-password'
                  placeholder='********'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Spinner /> : <LogIn />}
          Entrar
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs tracking-wider uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>ou</span>
          </div>
        </div>

        <Button
          type='button'
          variant='outline'
          disabled={isLoading}
          onClick={onMicrosoftLogin}
        >
          <MicrosoftLogo />
          Entrar com Microsoft
        </Button>
      </form>
    </Form>
  )
}

function MicrosoftLogo() {
  return (
    <svg viewBox='0 0 21 21' aria-hidden='true' className='size-4'>
      <rect x='1' y='1' width='9' height='9' fill='oklch(0.651 0.206 35.638)' />
      <rect
        x='11'
        y='1'
        width='9'
        height='9'
        fill='oklch(0.721 0.191 128.857)'
      />
      <rect
        x='1'
        y='11'
        width='9'
        height='9'
        fill='oklch(0.685 0.156 239.642)'
      />
      <rect
        x='11'
        y='11'
        width='9'
        height='9'
        fill='oklch(0.829 0.171 81.038)'
      />
    </svg>
  )
}
