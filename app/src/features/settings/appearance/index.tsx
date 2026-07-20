import { ContentSection } from '../components/content-section'
import { AppearanceForm } from './appearance-form'

export function SettingsAppearance() {
  return (
    <ContentSection
      title='Aparência'
      desc='Personalize a aparência do sistema: tema claro ou escuro e fonte.'
    >
      <AppearanceForm />
    </ContentSection>
  )
}
