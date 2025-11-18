'use client'

/**
 * Context Provider pour l'organisation courante
 * Permet d'accéder aux données de l'organisation dans n'importe quel composant client
 */

import { createContext, useContext, ReactNode } from 'react'

interface Organization {
  id: string
  name: string
  slug: string
  domain: string | null
  subdomain: string
  websiteTemplateId: string | null
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
}

interface OrganizationContextValue {
  organization: Organization | null
  isLoading: boolean
}

const OrganizationContext = createContext<OrganizationContextValue>({
  organization: null,
  isLoading: true,
})

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization doit être utilisé dans un OrganizationProvider')
  }
  return context
}

interface OrganizationProviderProps {
  children: ReactNode
  organization: Organization | null
}

export function OrganizationProvider({ children, organization }: OrganizationProviderProps) {
  return (
    <OrganizationContext.Provider
      value={{
        organization,
        isLoading: false,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}
