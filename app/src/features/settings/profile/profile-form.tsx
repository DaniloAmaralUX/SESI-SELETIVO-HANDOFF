import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { labelDoPapel, usePapel } from '@/features/vagas/lib/papel'

const profileFormSchema = z.object({
  nome: z
    .string('Informe seu nome.')
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(60, 'O nome deve ter no máximo 60 caracteres.'),
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Informe seu e-mail.' : undefined),
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// Perfil do protótipo (B3): nome e e-mail editáveis localmente; o papel vem
// do PapelSwitcher e é somente leitura aqui.
export function ProfileForm() {
  const papel = usePapel()
  const email = useAuthStore((s) => s.auth.user?.email)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nome: 'Recrutadora SESI',
      email: email ?? 'recrutadora@sesi.org.br',
    },
  })

  function onSubmit(_values: ProfileFormValues) {
    toast.success('Perfil atualizado')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='nome'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder='Seu nome' {...field} />
              </FormControl>
              <FormDescription>
                Como você aparece nos registros do sistema.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder='nome@sesi.org.br' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Papel</FormLabel>
          <FormControl>
            <Input value={labelDoPapel(papel)} disabled readOnly />
          </FormControl>
          <FormDescription>
            Definido pela administração do sistema. No protótipo, use o seletor
            de papel no topo da tela para simular outros perfis.
          </FormDescription>
        </FormItem>
        <Button type='submit'>Salvar perfil</Button>
      </form>
    </Form>
  )
}
