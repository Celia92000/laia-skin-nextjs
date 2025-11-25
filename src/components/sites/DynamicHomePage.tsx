/**
 * Composant de page d'accueil dynamique
 * Charge les données et affiche le template correspondant à l'organisation
 * Server Component pour pouvoir charger les données depuis la DB
 */

import { DetectedOrganization } from '@/lib/organization-detector'
import { loadTemplateData } from '@/lib/template-data-loader'
import ModernTemplate from '@/components/templates/ModernTemplate'
import ClassicTemplate from '@/components/templates/ClassicTemplate'
import MinimalTemplate from '@/components/templates/MinimalTemplate'
// Import des autres templates à venir...

interface DynamicHomePageProps {
  organization: DetectedOrganization
}

export default async function DynamicHomePage({ organization }: DynamicHomePageProps) {
  const templateId = organization.websiteTemplateId || 'modern'

  console.log(`[DynamicHomePage] Rendu du template "${templateId}" pour ${organization.name}`)

  // Charger toutes les données nécessaires pour le template
  const templateData = await loadTemplateData(organization)

  // Switch entre les différents templates (tous reçoivent les mêmes données)
  switch (templateId) {
    case 'modern':
      return <ModernTemplate data={templateData} />

    case 'classic':
      return <ClassicTemplate data={templateData} />

    case 'minimal':
      return <MinimalTemplate data={templateData} />

    case 'professional':
      // TODO: Créer ProfessionalTemplate
      return <div>Template Professional (à venir)</div>

    case 'boutique':
      // TODO: Créer BoutiqueTemplate
      return <div>Template Boutique (à venir)</div>

    case 'fresh':
      // TODO: Créer FreshTemplate
      return <div>Template Fresh (à venir)</div>

    case 'luxe':
      // TODO: Créer LuxeTemplate
      return <div>Template Luxe (à venir)</div>

    case 'elegance':
      // TODO: Créer EleganceTemplate
      return <div>Template Elegance (à venir)</div>

    case 'zen':
      // TODO: Créer ZenTemplate
      return <div>Template Zen (à venir)</div>

    case 'medical':
      // TODO: Créer MedicalTemplate
      return <div>Template Medical Premium (à venir)</div>

    case 'spa-luxe':
      // TODO: Créer SpaLuxeTemplate
      return <div>Template Spa Luxe Premium (à venir)</div>

    case 'laser-tech':
      // TODO: Créer LaserTechTemplate
      return <div>Template Laser Tech Premium (à venir)</div>

    default:
      console.warn(`[DynamicHomePage] Template inconnu: ${templateId}, utilisation du template moderne par défaut`)
      return <ModernTemplate data={templateData} />
  }
}
