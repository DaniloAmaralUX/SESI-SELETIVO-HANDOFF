import { useEffect } from 'react'
import { Check, UserCog } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { papelOptions } from '@/features/vagas/data/data'
import { type Papel } from '@/features/vagas/data/schema'
import { usePapel } from '@/features/vagas/lib/papel'

// Usuário fake mínimo p/ o protótipo (sem backend/auth reais — decisão B3)
const usuarioPrototipo = {
  accountNo: 'PROTO-0001',
  email: 'recrutadora@sesi.example',
  role: ['recrutadora'],
  exp: Number.MAX_SAFE_INTEGER,
}

// Seletor de papel — recurso do protótipo p/ simular a visão de cada ator
// (Recrutadora, Gestora de RH, Admin) nos testes com usuários.
export function PapelSwitcher() {
  const papel = usePapel()
  const user = useAuthStore((s) => s.auth.user)
  const setUser = useAuthStore((s) => s.auth.setUser)

  // Sem login real: garante um usuário fake ao montar
  useEffect(() => {
    if (!user) setUser(usuarioPrototipo)
  }, [user, setUser])

  const papelAtual = papelOptions.find((option) => option.value === papel)

  const trocarPapel = (novoPapel: Papel) => {
    setUser({ ...(user ?? usuarioPrototipo), role: [novoPapel] })
  }

  return (
    <DropdownMenu modal={false}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' className='scale-95 gap-1.5'>
              <UserCog className='size-[1.2rem]' />
              <span className='max-sm:sr-only'>{papelAtual?.label}</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          Simulação de papel — recurso do protótipo
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Simular papel</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {papelOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => trocarPapel(option.value)}
          >
            {option.label}
            <Check
              size={14}
              className={cn('ms-auto', papel !== option.value && 'hidden')}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
