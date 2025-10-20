'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Building2, Users, CreditCard, BarChart3, Mail, Sparkles, MessageCircle, Gift, Star, FileText, Bell, ScrollText, Settings, Home, Globe, UserPlus } from 'lucide-react'

export default function SuperAdminNav() {
  const pathname = usePathname()

  const tabs = [
    { name: 'Dashboard', href: '/super-admin', icon: Home },
    { name: 'Site Vitrine', href: '/platform', icon: Globe, external: true },
    { name: 'Inscriptions', href: '/platform/register', icon: UserPlus, external: true },
    { name: 'Organisations', href: '/super-admin/organizations', icon: Building2 },
    { name: 'Utilisateurs', href: '/super-admin/users', icon: Users },
    { name: 'Facturation', href: '/super-admin/billing', icon: CreditCard },
    { name: 'Analytics', href: '/super-admin/analytics', icon: BarChart3 },
    { name: 'Campagnes Email', href: '/super-admin/email-campaigns', icon: Mail },
    { name: 'Nouveautés', href: '/super-admin/blog', icon: Sparkles },
    { name: 'Support', href: '/super-admin/tickets', icon: MessageCircle },
    { name: 'Codes Promo', href: '/super-admin/promo-codes', icon: Gift },
    { name: 'Témoignages', href: '/super-admin/testimonials', icon: Star },
    { name: 'Templates Email', href: '/super-admin/email-templates', icon: FileText },
    { name: 'Push Notifications', href: '/super-admin/push-notifications', icon: Bell },
    { name: 'Logs', href: '/super-admin/logs', icon: ScrollText },
    { name: 'Configuration', href: '/super-admin/settings', icon: Settings },
  ]

  const isActive = (href: string, external?: boolean) => {
    if (external) return false
    if (href === '/super-admin') {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#d4b5a0' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
              LAIA
            </h1>
            <p className="text-sm text-white/90">Super Admin</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/admin"
              className="text-sm px-3 py-1.5 rounded-full transition-colors text-white/90 hover:text-white hover:bg-white/10"
            >
              ← Admin Laia Skin
            </a>
            <a
              href="/api/auth/logout"
              className="text-sm px-4 py-1.5 rounded-full transition-all bg-white/20 hover:bg-white/30 text-white"
            >
              Déconnexion
            </a>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = isActive(tab.href, tab.external)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                target={tab.external ? '_blank' : undefined}
                rel={tab.external ? 'noopener noreferrer' : undefined}
                className={`flex items-center px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-lg transition-all`}
                style={{
                  color: active ? '#2c1810' : 'rgba(255, 255, 255, 0.85)',
                  backgroundColor: active ? 'white' : 'rgba(255, 255, 255, 0.1)',
                  fontWeight: active ? '600' : '500',
                  boxShadow: active ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'
                }}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
                {tab.external && <span className="ml-1 text-xs">↗</span>}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
