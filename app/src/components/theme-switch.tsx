import { useEffect } from 'react'
import { useTheme } from '@/context/theme-provider'
import { ThemeToggle } from '@/components/iconiq/theme-toggle'

// Toggle animado sol/lua (iconiq) em modo CONTROLADO: o estado vem do
// theme-provider do app (cookie + classe .dark), nunca do storage interno
// do componente. O modo "Sistema" continua disponível no ConfigDrawer e
// no menu de comando (⌘K).
export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme()

  /* Update theme-color meta tag when theme is updated.
   * Exceção better-colors: meta theme-color fica em hex por compatibilidade;
   * valores = --background dark/light do theme.css convertidos. */
  useEffect(() => {
    const themeColor = resolvedTheme === 'dark' ? '#0a1018' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  }, [resolvedTheme])

  return (
    <ThemeToggle
      aria-label='Alternar tema'
      size='md'
      pressed={resolvedTheme === 'dark'}
      onPressedChange={(escuro) => setTheme(escuro ? 'dark' : 'light')}
      applyToDocument={false}
      persist={false}
      // Tokens do tema no lugar do âmbar/creme default do iconiq — o header
      // não ganha um 4º matiz de destaque
      trackClassName='border-border bg-muted'
      knobClassName='bg-primary'
    />
  )
}
