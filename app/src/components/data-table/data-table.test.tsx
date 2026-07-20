import { type ColumnDef } from '@tanstack/react-table'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { DataTable } from './data-table'

type Item = { id: string; nome: string }

const columns: ColumnDef<Item>[] = [
  {
    accessorKey: 'nome',
    header: 'Nome',
    cell: ({ row }) => row.getValue('nome'),
  },
  {
    id: 'acoes',
    header: 'Ações',
    cell: () => (
      <button type='button' data-no-row-click>
        Menu
      </button>
    ),
  },
]

const data: Item[] = [
  { id: '1', nome: 'Primeiro item' },
  { id: '2', nome: 'Segundo item' },
]

// search/navigate fakes — useTableUrlState aceita dependências injetadas (DI)
function makeUrlState() {
  return { search: {}, navigate: vi.fn() }
}

describe('DataTable', () => {
  it('renderiza as linhas dos dados', async () => {
    const { getByText } = await render(
      <DataTable data={data} columns={columns} urlState={makeUrlState()} />
    )

    await expect.element(getByText('Primeiro item')).toBeInTheDocument()
    await expect.element(getByText('Segundo item')).toBeInTheDocument()
  })

  it('exibe emptyMessage quando não há dados', async () => {
    const { getByText } = await render(
      <DataTable
        data={[]}
        columns={columns}
        urlState={makeUrlState()}
        emptyMessage='Nenhuma vaga encontrada.'
      />
    )

    await expect
      .element(getByText('Nenhuma vaga encontrada.'))
      .toBeInTheDocument()
  })

  it('dispara onRowClick ao clicar na linha', async () => {
    const onRowClick = vi.fn()
    const { getByText } = await render(
      <DataTable
        data={data}
        columns={columns}
        urlState={makeUrlState()}
        onRowClick={onRowClick}
      />
    )

    await userEvent.click(getByText('Primeiro item'))

    expect(onRowClick).toHaveBeenCalledOnce()
    expect(onRowClick).toHaveBeenCalledWith(data[0])
  })

  it('não dispara onRowClick em célula com data-no-row-click', async () => {
    const onRowClick = vi.fn()
    const { getByRole } = await render(
      <DataTable
        data={data}
        columns={columns}
        urlState={makeUrlState()}
        onRowClick={onRowClick}
      />
    )

    await userEvent.click(getByRole('button', { name: 'Menu' }).first())

    expect(onRowClick).not.toHaveBeenCalled()
  })
})
