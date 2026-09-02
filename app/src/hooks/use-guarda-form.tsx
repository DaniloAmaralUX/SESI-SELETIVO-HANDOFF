import { useEffect, type ReactNode } from 'react'
import { useBlocker } from '@tanstack/react-router'
import { ConfirmDialog } from '@/components/confirm-dialog'

/**
 * Guarda de formulário sujo: intercepta QUALQUER navegação interna (Cancelar,
 * sidebar, breadcrumb) com um ConfirmDialog e o fechamento da aba com
 * beforeunload. Um form de 15 campos não pode evaporar num clique (docs:
 * "nenhuma perda silenciosa de dados").
 *
 * Uso: const { dialogoDescarte } = useGuardaForm(form.formState.isDirty)
 * e renderize {dialogoDescarte} no fim do componente.
 */
export function useGuardaForm(isDirty: boolean): {
  dialogoDescarte: ReactNode
} {
  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => isDirty,
    withResolver: true,
  })

  useEffect(() => {
    if (!isDirty) return
    const aoSair = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', aoSair)
    return () => window.removeEventListener('beforeunload', aoSair)
  }, [isDirty])

  const dialogoDescarte = (
    <ConfirmDialog
      open={status === 'blocked'}
      onOpenChange={(open) => {
        if (!open) reset?.()
      }}
      destructive
      title='Descartar alterações?'
      desc='Os dados preenchidos neste formulário serão perdidos.'
      cancelBtnText='Continuar editando'
      confirmText='Descartar'
      handleConfirm={() => proceed?.()}
    />
  )

  return { dialogoDescarte }
}
