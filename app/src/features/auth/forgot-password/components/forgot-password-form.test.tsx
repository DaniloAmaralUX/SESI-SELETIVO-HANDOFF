import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { userEvent, type Locator } from 'vitest/browser'
import { ForgotPasswordForm } from './forgot-password-form'

vi.mock('@/lib/utils', async (orig) => ({
  ...(await orig()),
  sleep: vi.fn(() => Promise.resolve()),
}))

describe('ForgotPasswordForm', () => {
  let screen: RenderResult
  let emailInput: Locator
  let continueButton: Locator

  beforeEach(async () => {
    vi.clearAllMocks()

    screen = await render(<ForgotPasswordForm />)
    emailInput = screen.getByRole('textbox', { name: /^E-mail$/i })
    continueButton = screen.getByRole('button', { name: /Continuar/i })
  })

  it('renderiza campo de e-mail e botão continuar', async () => {
    await expect.element(emailInput).toBeInTheDocument()
    await expect.element(continueButton).toBeInTheDocument()
  })

  it('valida o form vazio no submit', async () => {
    await userEvent.click(continueButton)
    await expect
      .element(screen.getByText(/^Informe seu e-mail\.$/i))
      .toBeInTheDocument()
  })

  it('reseta o form após o envio simulado (protótipo, sem OTP)', async () => {
    await userEvent.fill(emailInput, 'a@b.com')
    await userEvent.click(continueButton)

    // Form deve resetar quando o envio simulado conclui
    await vi.waitFor(async () => {
      await expect.element(emailInput).toHaveValue('')
    })
  })
})
