import { useMemo } from 'react'
import { Link, getRouteApi } from '@tanstack/react-router'
import { Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { DataTable } from '@/components/data-table'
import { acaoOptions, statusOptions } from '../data/data'
import { type Vaga } from '../data/schema'
import { ExportarCsv } from './exportar-csv'
import { vagasColumns, vagasColumnVisibility } from './vagas-columns'

const route = getRouteApi('/_authenticated/vagas/')

type VagasTableProps = {
  data: Vaga[]
}

// Opções de faceta derivadas dos próprios dados (valores distintos ordenados)
function opcoesDe(data: Vaga[], campo: keyof Vaga) {
  const valores = [...new Set(data.map((v) => String(v[campo])))].sort()
  return valores.map((valor) => ({ label: valor, value: valor }))
}

export function VagasTable({ data }: VagasTableProps) {
  const navigate = route.useNavigate()

  const facetas = useMemo(
    () => ({
      unidade: opcoesDe(data, 'unidade'),
      area: opcoesDe(data, 'area'),
      recrutadora: opcoesDe(data, 'recrutadora'),
      gestor: opcoesDe(data, 'gestorSolicitante'),
    }),
    [data]
  )

  return (
    <DataTable
      data={data}
      columns={vagasColumns}
      initialColumnVisibility={vagasColumnVisibility}
      urlState={{
        search: route.useSearch(),
        navigate,
        pagination: { defaultPage: 1, defaultPageSize: 10 },
        globalFilter: { enabled: true, key: 'filter' },
        columnFilters: [
          { columnId: 'status', searchKey: 'status', type: 'array' },
          { columnId: 'acaoAtual', searchKey: 'acao', type: 'array' },
          { columnId: 'unidade', searchKey: 'unidade', type: 'array' },
          { columnId: 'area', searchKey: 'area', type: 'array' },
          { columnId: 'recrutadora', searchKey: 'recrutadora', type: 'array' },
          { columnId: 'gestorSolicitante', searchKey: 'gestor', type: 'array' },
          // Período (dataAbertura) fica fora da URL: o hook preserva filtros
          // não configurados no estado local da tabela
        ],
      }}
      toolbar={{
        searchPlaceholder: 'Filtrar por chamado ou cargo...',
        filters: [
          { columnId: 'status', title: 'Status', options: statusOptions },
          { columnId: 'acaoAtual', title: 'Ação', options: acaoOptions },
          { columnId: 'unidade', title: 'Unidade', options: facetas.unidade },
          { columnId: 'area', title: 'Área', options: facetas.area },
          {
            columnId: 'recrutadora',
            title: 'Recrutadora',
            options: facetas.recrutadora,
          },
          {
            columnId: 'gestorSolicitante',
            title: 'Gestor',
            options: facetas.gestor,
          },
        ],
        dateRangeFilters: [{ columnId: 'dataAbertura', title: 'Período' }],
      }}
      toolbarActions={(table) => <ExportarCsv table={table} />}
      globalFilterFn={(row, _columnId, filterValue) => {
        const chamado = String(row.getValue('chamado')).toLowerCase()
        const cargo = String(row.getValue('cargo')).toLowerCase()
        const searchValue = String(filterValue).toLowerCase()

        return chamado.includes(searchValue) || cargo.includes(searchValue)
      }}
      onRowClick={(vaga) =>
        navigate({ to: '/vagas/$vagaId', params: { vagaId: vaga.id } })
      }
      emptyMessage={
        <Empty className='border-0'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <Briefcase />
            </EmptyMedia>
            <EmptyTitle>Nenhuma vaga encontrada</EmptyTitle>
            <EmptyDescription>
              Ajuste a busca, limpe os filtros ou cadastre uma nova vaga.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className='flex gap-2'>
              <Button size='sm' asChild>
                <Link to='/vagas/nova'>Criar vaga</Link>
              </Button>
              <Button size='sm' variant='outline' asChild>
                <Link to='/vagas/importar'>Importar planilha</Link>
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      }
    />
  )
}
