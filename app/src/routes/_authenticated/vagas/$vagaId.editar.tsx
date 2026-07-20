import { createFileRoute } from '@tanstack/react-router'
import { EditarVagaPage } from '@/features/vagas/vaga-form-page'

export const Route = createFileRoute('/_authenticated/vagas/$vagaId/editar')({
  component: EditarVagaPage,
})
