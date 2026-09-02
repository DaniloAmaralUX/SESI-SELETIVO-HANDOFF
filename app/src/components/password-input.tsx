import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  ref?: React.Ref<HTMLInputElement>
}

export function PasswordInput({
  className,
  disabled,
  ref,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className={cn('relative rounded-md', className)}>
      <input
        type={showPassword ? 'text' : 'password'}
        className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:ring-destructive/40'
        ref={ref}
        disabled={disabled}
        {...props}
      />
      <Button
        type='button'
        size='icon'
        variant='ghost'
        disabled={disabled}
        // after: estende o hit area a 36px (altura do input h-9); 40px estouraria
        // o campo e colidiria com a área de clique do próprio input (better-ui)
        className='absolute inset-e-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-md text-muted-foreground after:absolute after:top-1/2 after:left-1/2 after:size-9 after:-translate-x-1/2 after:-translate-y-1/2'
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {/* Cross-fade contextual (better-ui): ambos no DOM, scale 0.25→1,
            opacity 0→1, blur 4px→0, cubic-bezier(0.2,0,0,1) */}
        <span className='relative inline-flex items-center justify-center'>
          <Eye
            size={18}
            className={cn(
              'absolute inset-0 m-auto transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
              showPassword
                ? 'scale-100 opacity-100 blur-[0px]'
                : 'scale-[0.25] opacity-0 blur-[4px]'
            )}
          />
          <EyeOff
            size={18}
            className={cn(
              'transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
              showPassword
                ? 'scale-[0.25] opacity-0 blur-[4px]'
                : 'scale-100 opacity-100 blur-[0px]'
            )}
          />
        </span>
        <span className='sr-only'>
          {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        </span>
      </Button>
    </div>
  )
}
