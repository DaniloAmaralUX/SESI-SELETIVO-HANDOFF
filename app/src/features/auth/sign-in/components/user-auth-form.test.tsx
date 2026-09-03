import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { type Locator, userEvent } from 'vitest/browser'
import { UserAuthForm } from './user-auth-form'

const FORM_MESSAGES = {
  emailEmpty: 'Informe seu e-mail.',
} as const

const navigate = vi.fn()
const setUserMock = vi.fn()
const setAccessTokenMock = vi.fn()

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    auth: {
      setUser: setUserMock,
      setAccessToken: setAccessTokenMock,
    },
  }),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => navigate,
  }
})

vi.mock('@/lib/utils', async (orig) => ({
  ...(await orig()),
  sleep: vi.fn(() => Promise.resolve()),
}))

// Protótipo SEM SENHA: e-mail identifica quem entra, acesso liberado direto
describe('UserAuthForm', () => {
  describe('Rendering without redirectTo', () => {
    let screen: RenderResult
    let emailInput: Locator
    let signInButton: Locator

    beforeEach(async () => {
      vi.clearAllMocks()
      screen = await render(<UserAuthForm />)
      emailInput = screen.getByRole('textbox', { name: /^E-mail$/i })
      signInButton = screen.getByRole('button', { name: /^Entrar$/i })
    })

    it('renders email field and submit button, without password field', async () => {
      await expect.element(emailInput).toBeInTheDocument()
      await expect.element(signInButton).toBeInTheDocument()
      expect(
        screen.container.querySelector('input[type="password"]')
      ).toBeNull()
    })

    it('shows validation message when submitting empty form', async () => {
      await userEvent.click(signInButton)

      await expect
        .element(screen.getByText(FORM_MESSAGES.emailEmpty))
        .toBeInTheDocument()
    })

    it('authenticates with e-mail only and navigates to default route', async () => {
      await userEvent.fill(emailInput, 'a@b.com')

      await userEvent.click(signInButton)

      await vi.waitFor(() => expect(setUserMock).toHaveBeenCalledOnce())
      expect(setUserMock).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'a@b.com',
          accountNo: expect.any(String),
          role: expect.any(Array),
          exp: expect.any(Number),
        })
      )
      expect(setAccessTokenMock).toHaveBeenCalledOnce()
      expect(setAccessTokenMock).toHaveBeenCalledWith('mock-access-token')

      await vi.waitFor(() =>
        expect(navigate).toHaveBeenCalledWith({ to: '/', replace: true })
      )
    })
  })

  it('authenticates immediately via Microsoft button', async () => {
    vi.clearAllMocks()

    const { getByRole } = await render(<UserAuthForm />)

    await userEvent.click(
      getByRole('button', { name: /Entrar com Microsoft/i })
    )

    await vi.waitFor(() => expect(setUserMock).toHaveBeenCalledOnce())
    expect(setUserMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'recrutadora@sesi.org.br',
        role: expect.any(Array),
      })
    )
    expect(setAccessTokenMock).toHaveBeenCalledWith('mock-access-token')

    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: '/', replace: true })
    )
  })

  it('navigates to redirectTo when provided', async () => {
    vi.clearAllMocks()

    const { getByRole } = await render(<UserAuthForm redirectTo='/settings' />)

    await userEvent.fill(getByRole('textbox', { name: /E-mail/i }), 'a@b.com')

    await userEvent.click(getByRole('button', { name: /^Entrar$/i }))

    await vi.waitFor(() => expect(setUserMock).toHaveBeenCalledOnce())
    expect(setAccessTokenMock).toHaveBeenCalledOnce()

    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/settings',
        replace: true,
      })
    )
  })
})
