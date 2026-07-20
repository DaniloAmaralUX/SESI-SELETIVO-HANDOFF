import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

// Guard de autenticação: sem token → login, preservando o destino
// para redirecionar de volta após entrar. RBAC fino (por papel) fica no nível
// de dado/ação (ex.: CampoSensivel), não de rota, neste protótipo.
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const { accessToken } = useAuthStore.getState().auth
    if (!accessToken) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }
  },
  component: AuthenticatedLayout,
})
