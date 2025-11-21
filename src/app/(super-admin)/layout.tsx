'use client'

import { usePathname } from 'next/navigation'
import SuperAdminNav from '@/components/SuperAdminNav'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isPreviewPage = pathname?.includes('/preview')

  // Si c'est une page de preview de template, on affiche juste le contenu
  if (isPreviewPage) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SuperAdminNav />
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer LAIA Connect */}
      <footer className="text-white border-t" style={{ backgroundColor: '#6b46c1', borderColor: '#5b21b6' }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/90">
              © {new Date().getFullYear()} LAIA Connect. Tous droits réservés.
            </p>
            <p className="text-xs text-white/70">
              Plateforme SaaS de gestion pour instituts de beauté
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
