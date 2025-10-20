"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { generateCSSVariables, DEFAULT_COLORS, DEFAULT_FONTS } from '@/lib/laia-design-system'

interface ThemeContextType {
  organizationConfig: any
  colors: {
    primary: string
    secondary: string
    accent: string
    nude: string
    rose: string
    dark: string
    cream: string
  }
  fonts: {
    body: string
    heading: string
  }
  organizationName: string
  organizationSlug: string
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  organizationConfig,
  organizationName,
  organizationSlug
}: {
  children: React.ReactNode
  organizationConfig: any
  organizationName: string
  organizationSlug: string
}) {
  const [mounted, setMounted] = useState(false)

  // Générer les couleurs à partir de la config
  const colors = {
    primary: organizationConfig?.primaryColor || DEFAULT_COLORS.primary,
    secondary: organizationConfig?.secondaryColor || DEFAULT_COLORS.secondary,
    accent: organizationConfig?.accentColor || DEFAULT_COLORS.accent,
    nude: DEFAULT_COLORS.nude,
    rose: DEFAULT_COLORS.rose,
    dark: DEFAULT_COLORS.dark,
    cream: DEFAULT_COLORS.cream,
  }

  const fonts = {
    body: organizationConfig?.fontFamily || DEFAULT_FONTS.body,
    heading: organizationConfig?.headingFont || DEFAULT_FONTS.heading,
  }

  // Injecter les CSS variables dans le DOM
  useEffect(() => {
    setMounted(true)
    
    const cssVars = generateCSSVariables(organizationConfig)
    const root = document.documentElement
    
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Cleanup
    return () => {
      Object.keys(cssVars).forEach((key) => {
        root.style.removeProperty(key)
      })
    }
  }, [organizationConfig])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider
      value={{
        organizationConfig,
        colors,
        fonts,
        organizationName,
        organizationSlug
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook pour accéder au thème de l'organisation
 * Utilisé dans tous les composants pour récupérer les couleurs/polices
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
