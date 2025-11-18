'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, CreditCard, Sparkles, MessageCircle, Gift, Star, Bell, ScrollText, Settings, Home, Send, Target, Calendar, Palette, HelpCircle, TrendingDown, Zap, BarChart3 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function SuperAdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [newLeadsCount, setNewLeadsCount] = useState(0)
  const [newDemosCount, setNewDemosCount] = useState(0)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Compter les nouveaux leads
        const leadsResponse = await fetch('/api/super-admin/leads/count-new')
        if (leadsResponse.ok) {
          const data = await leadsResponse.json()
          setNewLeadsCount(data.count || 0)
        }

        // Compter les nouvelles démos
        const demosResponse = await fetch('/api/super-admin/demos/count-new')
        if (demosResponse.ok) {
          const data = await demosResponse.json()
          setNewDemosCount(data.count || 0)
        }
      } catch (error) {
        console.error('Erreur récupération compteurs:', error)
      }
    }

    fetchCounts()
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    try {
      // Appeler l'API de déconnexion
      await fetch('/api/auth/logout', { method: 'POST' })
      // Nettoyer le localStorage
      localStorage.removeItem('adminToken')
      // Rediriger vers la page de connexion
      router.push('/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      // Rediriger quand même
      router.push('/login')
    }
  }

  const tabs = [
    { name: 'Dashboard', href: '/super-admin', icon: Home },
    { name: 'Métriques', href: '/super-admin/metrics', icon: BarChart3 },
    { name: 'CRM', href: '/super-admin/crm', icon: Target, badge: newLeadsCount },
    { name: 'Churn', href: '/super-admin/churn', icon: TrendingDown },
    { name: 'Workflows', href: '/super-admin/workflows', icon: Zap },
    { name: 'Démos', href: '/super-admin/demos', icon: Calendar, badge: newDemosCount },
    { name: 'Organisations', href: '/super-admin/organizations', icon: Building2 },
    { name: 'Facturation', href: '/super-admin/billing', icon: CreditCard },
    { name: 'Communications', href: '/super-admin/communications', icon: Send },
    { name: 'Nouveautés', href: '/super-admin/blog', icon: Sparkles },
    { name: 'Support', href: '/super-admin/tickets', icon: MessageCircle },
    { name: 'Codes Promo', href: '/super-admin/promo-codes', icon: Gift },
    { name: 'Témoignages', href: '/super-admin/testimonials', icon: Star },
    { name: 'Templates Web', href: '/super-admin/templates', icon: Palette },
    { name: 'Push Notifications', href: '/super-admin/push-notifications', icon: Bell },
    { name: 'Logs', href: '/super-admin/logs', icon: ScrollText },
    { name: 'Configuration', href: '/super-admin/settings', icon: Settings },
    { name: 'Centre d\'aide', href: '/aide', icon: HelpCircle, external: true },
  ]

  const isActive = (href: string, external?: boolean) => {
    if (external) return false
    if (href === '/super-admin') {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#7c3aed' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{
              fontFamily: 'Playfair Display, serif'
            }}>
              LAIA Connect
            </h1>
            <p className="text-sm text-white/90">Super Admin</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/platform"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-3 py-1.5 rounded-full transition-colors text-white/90 hover:text-white hover:bg-white/10"
            >
              Site Vitrine ↗
            </a>
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-1.5 rounded-full transition-all bg-white/20 hover:bg-white/30 text-white"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const external = ('external' in tab ? tab.external : false) as boolean
            const active = isActive(tab.href, external)
            const badge = 'badge' in tab ? tab.badge : 0
            return (
              <Link
                key={tab.href}
                href={tab.href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className={`flex items-center px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-lg transition-all relative`}
                style={{
                  color: active ? '#6b21a8' : 'rgba(255, 255, 255, 0.85)',
                  backgroundColor: active ? 'white' : 'rgba(255, 255, 255, 0.15)',
                  fontWeight: active ? '600' : '500',
                  boxShadow: active ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'
                }}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
                {external && <span className="ml-1 text-xs">↗</span>}
                {badge > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white animate-pulse">
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
