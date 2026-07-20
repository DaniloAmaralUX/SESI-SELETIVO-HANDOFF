import {
  BarChart3,
  Briefcase,
  FileUp,
  LayoutDashboard,
  Palette,
  Settings,
  UserCog,
} from 'lucide-react'
import { type SidebarData } from '../types'

// Navegação do produto (IA §5): Operação · Indicadores · Sistema
export const sidebarData: SidebarData = {
  user: {
    name: 'Recrutador SESI',
    email: 'recrutador@sesi.org.br',
    avatar: '',
  },
  navGroups: [
    {
      title: 'Operação',
      items: [
        {
          title: 'Vagas',
          url: '/vagas',
          icon: Briefcase,
        },
        {
          title: 'Importar planilha',
          url: '/vagas/importar',
          icon: FileUp,
        },
      ],
    },
    {
      title: 'Indicadores',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Relatórios',
          url: '/relatorios',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'Sistema',
      items: [
        {
          title: 'Configurações',
          icon: Settings,
          items: [
            {
              title: 'Perfil',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Aparência',
              url: '/settings/appearance',
              icon: Palette,
            },
          ],
        },
      ],
    },
  ],
}
