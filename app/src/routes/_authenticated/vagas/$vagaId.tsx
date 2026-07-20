import { createFileRoute } from '@tanstack/react-router'
import { VagaDetalhePage } from '@/features/vagas/detalhe'

export const Route = createFileRoute('/_authenticated/vagas/$vagaId')({
  component: VagaDetalhePage,
})
