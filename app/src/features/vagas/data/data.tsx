import {
  Archive,
  BadgeCheck,
  Briefcase,
  CheckCircle,
  CircleDot,
  CircleOff,
  ClipboardList,
  FileText,
  Inbox,
  Megaphone,
  MessageSquare,
  Pause,
  Scale,
  Send,
  Snowflake,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { type AcaoVaga, type Papel, type StatusVaga } from './schema'

export const statusOptions: Array<{
  value: StatusVaga
  label: string
  icon: LucideIcon
}> = [
  {
    value: 'aberta',
    label: 'Aberta',
    icon: CircleDot,
  },
  {
    value: 'suspensa',
    label: 'Suspensa',
    icon: Pause,
  },
  {
    value: 'congelada',
    label: 'Congelada',
    icon: Snowflake,
  },
  {
    value: 'cancelada',
    label: 'Cancelada',
    icon: CircleOff,
  },
  {
    value: 'finalizada',
    label: 'Finalizada',
    icon: CheckCircle,
  },
  {
    value: 'arquivada',
    label: 'Arquivada',
    icon: Archive,
  },
]

// Etapas na ordem canônica do processo (ADR 0001)
export const acaoOptions: Array<{
  value: AcaoVaga
  label: string
  icon: LucideIcon
}> = [
  {
    value: 'solicitacao-recebida',
    label: 'Solicitação recebida',
    icon: Inbox,
  },
  {
    value: 'encaminhada-ao-gestor',
    label: 'Encaminhada ao gestor',
    icon: Send,
  },
  {
    value: 'chamado-juridico',
    label: 'Chamado jurídico',
    icon: Scale,
  },
  {
    value: 'inscricoes',
    label: 'Inscrições',
    icon: ClipboardList,
  },
  {
    value: 'prova',
    label: 'Prova',
    icon: FileText,
  },
  {
    value: 'entrevista-rh',
    label: 'Entrevista RH',
    icon: MessageSquare,
  },
  {
    value: 'entrevista-gestor',
    label: 'Entrevista gestor',
    icon: Users,
  },
  {
    value: 'habilitacao',
    label: 'Habilitação',
    icon: BadgeCheck,
  },
  {
    value: 'divulgacao-do-resultado',
    label: 'Divulgação do resultado',
    icon: Megaphone,
  },
  {
    value: 'admissao',
    label: 'Admissão',
    icon: Briefcase,
  },
]

export const papelOptions: Array<{ value: Papel; label: string }> = [
  {
    value: 'recrutadora',
    label: 'Recrutadora',
  },
  {
    value: 'gestora-rh',
    label: 'Gestora de RH',
  },
  {
    value: 'admin',
    label: 'Administrador',
  },
]
