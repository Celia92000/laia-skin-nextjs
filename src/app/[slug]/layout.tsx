import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { detectOrganizationFromSlug, getAllOrganizationSlugs } from '@/lib/organization-detector'
import { OrganizationProvider } from '@/contexts/OrganizationContext'

interface SlugLayoutProps {
  children: ReactNode
  params: Promise<{ slug: string }>
}

/**
 * Layout pour les sites vitrines multi-tenant
 * Chaque organisation a son propre site accessible via /{slug}
 */
export default async function SlugLayout({ children, params }: SlugLayoutProps) {
  const { slug } = await params

  // Détecter l'organisation depuis le slug
  const organization = await detectOrganizationFromSlug(slug)

  if (!organization) {
    notFound()
  }

  return (
    <OrganizationProvider organization={organization}>
      {children}
    </OrganizationProvider>
  )
}

/**
 * Générer les routes statiques pour toutes les organisations
 * Améliore les performances en pré-générant les pages
 */
export async function generateStaticParams() {
  const slugs = await getAllOrganizationSlugs()

  return slugs.map((slug) => ({
    slug,
  }))
}
