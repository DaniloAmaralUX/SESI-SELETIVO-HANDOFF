import { useAuthStore } from '@/stores/auth-store'
import { PAPEIS, type Papel } from '../data/schema'

// Papel do usuário logado — lê o primeiro role do auth-store e valida
// contra os papéis canônicos. Fallback: recrutadora (menor privilégio útil).
export function usePapel(): Papel {
  const role = useAuthStore((s) => s.auth.user?.role?.[0])
  return PAPEIS.find((papel) => papel === role) ?? 'recrutadora'
}

// B7: só Admin exporta/vê dados sensíveis de candidato (LGPD)
export function podeVerDadosSensiveis(papel: Papel): boolean {
  return papel === 'admin'
}

// Rótulo pt-BR do papel — usado como "quem" nos eventos de histórico (RF17),
// já que o protótipo não tem usuários reais (B3).
const PAPEL_LABELS: Record<Papel, string> = {
  recrutadora: 'Recrutadora',
  'gestora-rh': 'Gestora de RH',
  admin: 'Administrador',
}

export function labelDoPapel(papel: Papel): string {
  return PAPEL_LABELS[papel]
}
