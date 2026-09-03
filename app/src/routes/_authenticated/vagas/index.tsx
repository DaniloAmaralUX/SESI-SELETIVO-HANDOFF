import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Vagas } from '@/features/vagas'
import { acaoVagaSchema, statusVagaSchema } from '@/features/vagas/data/schema'

const vagasSearchSchema = z.object({
  filter: z.string().optional().catch(''),
  status: z.array(statusVagaSchema).optional().catch([]),
  acao: z.array(acaoVagaSchema).optional().catch([]),
  unidade: z.array(z.string()).optional().catch([]),
  area: z.array(z.string()).optional().catch([]),
  recrutadora: z.array(z.string()).optional().catch([]),
  gestor: z.array(z.string()).optional().catch([]),
  // Período de abertura (yyyy-MM-dd) — URL compartilhável reproduz o recorte
  periodo: z
    .object({ de: z.string().optional(), ate: z.string().optional() })
    .optional()
    .catch(undefined),
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
})

export const Route = createFileRoute('/_authenticated/vagas/')({
  validateSearch: vagasSearchSchema,
  component: Vagas,
})
