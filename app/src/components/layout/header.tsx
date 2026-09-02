import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const top = document.body.scrollTop || document.documentElement.scrollTop
      setScrolled(top > 8)
    }

    onScroll()
    document.addEventListener('scroll', onScroll, { passive: true })
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'z-50 h-16',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        className
      )}
      {...props}
    >
      {/* Véu do topbar: sempre montado, só a opacidade anima (compositor).
          O blur + fundo se dissolvem por máscara 1rem abaixo da barra — o
          conteúdo desaparece gradualmente em vez de passar cru por baixo
          de uma borda dura. */}
      {fixed && (
        <div
          aria-hidden='true'
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 -z-10 h-[calc(100%+1rem)] transition-opacity duration-300 ease-out',
            scrolled ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div
            className='absolute inset-0 bg-background/85 backdrop-blur-xl'
            style={{
              maskImage:
                'linear-gradient(to bottom, black calc(100% - 1rem), transparent)',
              WebkitMaskImage:
                'linear-gradient(to bottom, black calc(100% - 1rem), transparent)',
            }}
          />
          <div className='absolute inset-x-0 top-16 h-px bg-border/60' />
        </div>
      )}
      <div className='relative flex h-full items-center gap-3 p-4 sm:gap-4'>
        <SidebarTrigger variant='outline' className='max-md:scale-125' />
        <Separator orientation='vertical' className='h-6' />
        {children}
      </div>
    </header>
  )
}
