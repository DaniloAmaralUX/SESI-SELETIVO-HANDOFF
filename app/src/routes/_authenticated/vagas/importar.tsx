import { createFileRoute } from '@tanstack/react-router'
import { ImportarVagas } from '@/features/vagas/importar'

export const Route = createFileRoute('/_authenticated/vagas/importar')({
  component: ImportarVagas,
})
