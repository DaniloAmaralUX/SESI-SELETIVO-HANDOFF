import '@tanstack/react-table'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    label?: string // rótulo legível da coluna (menu Exibir)
    className?: string // apply to both th and td
    tdClassName?: string
    thClassName?: string
  }
}
