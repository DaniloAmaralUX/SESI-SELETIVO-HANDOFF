import { ContentSection } from '../components/content-section'
import { ProfileForm } from './profile-form'

export function SettingsProfile() {
  return (
    <ContentSection
      title='Perfil'
      desc='Como você aparece no sistema de gestão de vagas.'
    >
      <ProfileForm />
    </ContentSection>
  )
}
