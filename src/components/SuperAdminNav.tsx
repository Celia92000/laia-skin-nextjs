'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function SuperAdminNav() {
  const pathname = usePathname()

  const tabs = [
    { name: 'Dashboard', href: '/super-admin', icon: '🏠' },
    { name: 'Site Vitrine', href: '/platform', icon: '🌐', external: true },
    { name: 'Inscriptions', href: '/platform/register', icon: '📝', external: true },
    { name: 'Organisations', href: '/super-admin/organizations', icon: '🏢' },
    { name: 'Utilisateurs', href: '/super-admin/users', icon: '👥' },
    { name: 'Facturation', href: '/super-admin/billing', icon: '💳' },
    { name: 'Analytics', href: '/super-admin/analytics', icon: '📊' },
    { name: 'Campagnes Email', href: '/super-admin/email-campaigns', icon: '📧' },
    { name: 'Nouveautés', href: '/super-admin/blog', icon: '✨' },
    { name: 'Support', href: '/super-admin/tickets', icon: '💬' },
    { name: 'Codes Promo', href: '/super-admin/promo-codes', icon: '🎁' },
    { name: 'Témoignages', href: '/super-admin/testimonials', icon: '⭐' },
    { name: 'Templates Email', href: '/super-admin/email-templates', icon: '📝' },
    { name: 'Push Notifications', href: '/super-admin/push-notifications', icon: '🔔' },
    { name: 'Logs', href: '/super-admin/logs', icon: '📋' },
    { name: 'Configuration', href: '/super-admin/settings', icon: '⚙️' },
  ]

  const isActive = (href: string, external?: boolean) => {
    if (external) return false // Les liens externes ne sont jamais actifs
    if (href === '/super-admin') {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              LAIA - Super Admin
            </h1>
            <p className="text-sm text-gray-600">Gestion de la plateforme LAIA</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/admin"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Retour Admin Laia Skin
            </a>
            <a
              href="/api/auth/logout"
              className="text-sm text-red-600 hover:text-red-800"
            >
              Déconnexion
            </a>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex space-x-1 overflow-x-auto pb-px -mb-px scrollbar-hide">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              target={tab.external ? '_blank' : undefined}
              rel={tab.external ? 'noopener noreferrer' : undefined}
              className={`
                flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all
                ${
                  isActive(tab.href, tab.external)
                    ? 'border-purple-600 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
              {tab.external && <span className="ml-1 text-xs">↗</span>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
