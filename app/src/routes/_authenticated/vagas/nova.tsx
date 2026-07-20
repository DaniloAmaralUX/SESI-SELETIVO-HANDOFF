import { createFileRoute } from '@tanstack/react-router'
import { NovaVagaPage } from '@/features/vagas/vaga-form-page'

export const Route = createFileRoute('/_authenticated/vagas/nova')({
  component: NovaVagaPage,
})
