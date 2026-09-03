import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useVagasStore } from '../../data/vagas-store'
import { MudarStatus } from './mudar-status'

// Segurança do fluxo operacional (F3): transições inválidas ficam visíveis
// porém desabilitadas, e Finalizar só aplica após confirmação explícita.
describe('MudarStatus', () => {
  function vagaAberta() {
    const vaga = useVagasStore
      .getState()
      .vagas.find((v) => v.status === 'aberta')
    if (!vaga) throw new Error('seed sem vaga aberta')
    return vaga
  }

  it('mostra transições inválidas desabilitadas (não escondidas)', async () => {
    const vaga = vagaAberta()
    const { getByRole } = await render(
      <TooltipProvider>
        <MudarStatus vaga={vaga} />
      </TooltipProvider>
    )

    await userEvent.click(getByRole('button', { name: /Mudar status/ }))

    // A partir de Aberta, "Rascunho" não é transição válida (matriz B1) —
    // aparece desabilitado com tooltip, nunca some
    const invalida = getByRole('menuitem', { name: /Rascunho/ })
    await expect.element(invalida).toHaveAttribute('aria-disabled', 'true')
  })

  it('Finalizar exige confirmação e só aplica no Confirmar', async () => {
    const vaga = vagaAberta()
    const { getByRole } = await render(
      <TooltipProvider>
        <MudarStatus vaga={vaga} />
      </TooltipProvider>
    )

    await userEvent.click(getByRole('button', { name: /Mudar status/ }))
    await userEvent.click(getByRole('menuitem', { name: /Finalizada/ }))

    // Nada mudou ainda — o diálogo de consequência está aberto
    expect(
      useVagasStore.getState().vagas.find((v) => v.id === vaga.id)?.status
    ).toBe('aberta')
    await expect
      .element(getByRole('alertdialog'))
      .toHaveTextContent(/encerra o processo seletivo/)

    // CTA repete o verbo da ação (padrão de confirmação), não "Confirmar"
    await userEvent.click(getByRole('button', { name: /^Finalizar$/ }))

    expect(
      useVagasStore.getState().vagas.find((v) => v.id === vaga.id)?.status
    ).toBe('finalizada')
  })
})
