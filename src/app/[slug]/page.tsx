import { Metadata } from 'next'
import { detectOrganizationFromSlug } from '@/lib/organization-detector'
import { notFound } from 'next/navigation'
import DynamicHomePage from '@/components/sites/DynamicHomePage'

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * Page d'accueil dynamique pour chaque organisation
 * Le design change en fonction du template sélectionné
 */
export default async function OrganizationHomePage({ params }: PageProps) {
  const { slug } = await params
  const organization = await detectOrganizationFromSlug(slug)

  if (!organization) {
    notFound()
  }

  return <DynamicHomePage organization={organization} />
}

/**
 * Génération des métadonnées dynamiques par organisation
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const organization = await detectOrganizationFromSlug(slug)

  if (!organization) {
    return {
      title: 'Organisation non trouvée',
    }
  }

  return {
    title: organization.name,
    description: `Site officiel de ${organization.name}`,
  }
}
