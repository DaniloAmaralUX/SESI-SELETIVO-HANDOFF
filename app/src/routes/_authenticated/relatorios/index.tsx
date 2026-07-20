import { createFileRoute } from '@tanstack/react-router'
import { Relatorios } from '@/features/relatorios'

export const Route = createFileRoute('/_authenticated/relatorios/')({
  component: Relatorios,
})
