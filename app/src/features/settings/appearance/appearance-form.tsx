import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { fonts } from '@/config/fonts'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useFont } from '@/context/font-provider'
import { useTheme } from '@/context/theme-provider'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark'], { error: 'Escolha um tema.' }),
  font: z.enum(fonts, { error: 'Escolha uma fonte.' }),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

export function AppearanceForm() {
  const { font, setFont } = useFont()
  const { theme, setTheme, resolvedTheme } = useTheme()

  const defaultValues: Partial<AppearanceFormValues> = {
    theme: resolvedTheme,
    font,
  }

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues,
  })

  function onSubmit(data: AppearanceFormValues) {
    if (data.font != font) setFont(data.font)
    if (data.theme != theme) setTheme(data.theme)

    toast.success('Preferências atualizadas')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='font'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fonte</FormLabel>
              <div className='relative w-max'>
                <FormControl>
                  <select
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'w-50 appearance-none font-normal capitalize',
                      'dark:bg-background dark:hover:bg-background'
                    )}
                    {...field}
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <ChevronDownIcon className='absolute inset-e-3 top-2.5 h-4 w-4 opacity-50' />
              </div>
              <FormDescription>
                Define a fonte usada na aplicação.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='theme'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tema</FormLabel>
              <FormDescription>Escolha o tema do sistema.</FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className='grid max-w-md grid-cols-2 gap-8 pt-2'
                aria-label='Tema'
              >
                <FormItem>
                  <FormLabel className='[&:has(:focus-visible)>div]:ring-2 [&:has(:focus-visible)>div]:ring-ring [&:has(:focus-visible)>div]:ring-offset-2 [&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>span]:font-semibold'>
                    <FormControl>
                      <RadioGroupItem value='light' className='sr-only' />
                    </FormControl>
                    {/* Radius concêntrico (better-ui): externo = interno + padding */}
                    <div className='items-center rounded-2xl border-2 border-muted p-1 hover:border-accent'>
                      <div className='space-y-2 rounded-lg bg-[oklch(0.946_0.003_264.542)] p-2'>
                        <div className='space-y-2 rounded-xs bg-[oklch(1_0_0)] p-2 shadow-xs'>
                          <div className='h-2 w-20 rounded-lg bg-[oklch(0.946_0.003_264.542)]' />
                          <div className='h-2 w-25 rounded-lg bg-[oklch(0.946_0.003_264.542)]' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-xs bg-[oklch(1_0_0)] p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-[oklch(0.946_0.003_264.542)]' />
                          <div className='h-2 w-25 rounded-lg bg-[oklch(0.946_0.003_264.542)]' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-xs bg-[oklch(1_0_0)] p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-[oklch(0.946_0.003_264.542)]' />
                          <div className='h-2 w-25 rounded-lg bg-[oklch(0.946_0.003_264.542)]' />
                        </div>
                      </div>
                    </div>
                    <span className='block w-full p-2 text-center font-normal'>
                      Claro
                    </span>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className='[&:has(:focus-visible)>div]:ring-2 [&:has(:focus-visible)>div]:ring-ring [&:has(:focus-visible)>div]:ring-offset-2 [&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>span]:font-semibold'>
                    <FormControl>
                      <RadioGroupItem value='dark' className='sr-only' />
                    </FormControl>
                    <div className='items-center rounded-2xl border-2 border-muted bg-popover p-1 hover:border-accent'>
                      <div className='space-y-2 rounded-lg bg-[oklch(0.129_0.042_264.695)] p-2'>
                        <div className='space-y-2 rounded-xs bg-[oklch(0.279_0.041_260.031)] p-2 shadow-xs'>
                          <div className='h-2 w-20 rounded-lg bg-[oklch(0.704_0.04_256.788)]' />
                          <div className='h-2 w-25 rounded-lg bg-[oklch(0.704_0.04_256.788)]' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-xs bg-[oklch(0.279_0.041_260.031)] p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-[oklch(0.704_0.04_256.788)]' />
                          <div className='h-2 w-25 rounded-lg bg-[oklch(0.704_0.04_256.788)]' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-xs bg-[oklch(0.279_0.041_260.031)] p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-[oklch(0.704_0.04_256.788)]' />
                          <div className='h-2 w-25 rounded-lg bg-[oklch(0.704_0.04_256.788)]' />
                        </div>
                      </div>
                    </div>
                    <span className='block w-full p-2 text-center font-normal'>
                      Escuro
                    </span>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />

        <Button type='submit'>Salvar preferências</Button>
      </form>
    </Form>
  )
}
