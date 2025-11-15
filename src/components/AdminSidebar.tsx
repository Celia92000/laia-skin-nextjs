"use client";

import { useState } from 'react';
import {
  LayoutDashboard, Calendar, Users, Package, Euro,
  BarChart3, Settings, FileText, Image, Star,
  MessageCircle, Bell, Gift, TrendingUp, Clock,
  ChevronLeft, ChevronRight, Sparkles, Heart, MapPin, ThumbsUp, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
    badge: null,
    tab: 'stats'
  },
  {
    id: 'planning',
    label: 'Planning',
    icon: Calendar,
    href: '/admin',
    badge: '12',
    tab: 'planning'
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: Users,
    href: '/admin',
    badge: null,
    tab: 'soins-paiements'
  },
  {
    id: 'stock',
    label: 'Stock',
    icon: Package,
    href: '/admin',
    badge: null,
    tab: 'stock',
    conditional: 'featureShop'
  },
  {
    id: 'commandes',
    label: 'Commandes',
    icon: Package,
    href: '/admin',
    badge: null,
    tab: 'pending',
    conditional: 'featureShop'
  },
  {
    id: 'finances',
    label: 'Finances',
    icon: Euro,
    href: '/admin',
    badge: null,
    tab: 'comptabilite'
  },
  {
    id: 'loyalty',
    label: 'Fidélité',
    icon: Gift,
    href: '/admin',
    badge: null,
    tab: 'fidelite'
  },
  {
    id: 'reviews',
    label: 'Avis & Photos',
    icon: Star,
    href: '/admin',
    badge: '3',
    tab: 'reviews'
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: TrendingUp,
    href: '/admin',
    badge: null,
    tab: 'crm',
    conditional: 'featureCRM'
  },
  {
    id: 'communications',
    label: 'Communications',
    icon: MessageCircle,
    href: '/admin',
    badge: null,
    tab: 'emailing',
    conditional: 'featureEmailing'
  },
  {
    id: 'social-media',
    label: 'Réseaux Sociaux',
    icon: MessageCircle,
    href: '/admin',
    badge: null,
    tab: 'social-media',
    conditional: 'featureSocialMedia'
  },
  {
    id: 'blog',
    label: 'Blog',
    icon: FileText,
    href: '/admin',
    badge: null,
    tab: 'blog',
    conditional: 'featureBlog'
  },
  {
    id: 'divider-config',
    label: '── Configuration ──',
    icon: null,
    href: null,
    divider: true
  },
  {
    id: 'services',
    label: 'Services',
    icon: Package,
    href: '/admin',
    badge: null,
    tab: 'services'
  },
  {
    id: 'products-catalog',
    label: 'Catalogue Produits',
    icon: Package,
    href: '/admin',
    badge: null,
    tab: 'products-catalog',
    conditional: 'featureShop'
  },
  {
    id: 'locations',
    label: 'Points de vente',
    icon: MapPin,
    href: '/admin/locations',
    badge: null,
    conditional: 'featureMultiLocation'
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    href: '/admin/settings',
    badge: null
  },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  orgFeatures?: any;
}

export default function AdminSidebar({ activeTab, onTabChange, orgFeatures }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-white border-r border-laia-primary/10 shadow-laia-md`}>
      <div className="h-full flex flex-col">
        {/* Header avec toggle */}
        <div className="p-4 border-b border-laia-primary/10">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-laia-primary animate-pulse" />
                <span className="font-bold text-laia-dark">Menu</span>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-laia-nude transition-colors"
            >
              {isCollapsed ? 
                <ChevronRight className="h-4 w-4 text-laia-gray" /> : 
                <ChevronLeft className="h-4 w-4 text-laia-gray" />
              }
            </button>
          </div>
        </div>

        {/* Menu items */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {menuItems.map((item: any) => {
              // Skip if conditional and feature not available
              if (item.conditional && orgFeatures && !orgFeatures[item.conditional]) {
                return null;
              }

              // Divider
              if (item.divider) {
                return (
                  <li key={item.id} className="py-2">
                    {!isCollapsed && (
                      <div className="text-xs text-laia-gray/50 font-semibold px-3">
                        {item.label}
                      </div>
                    )}
                  </li>
                );
              }

              const Icon = item.icon;
              const isActive = item.tab ? item.tab === activeTab : false;

              return (
                <li key={item.id}>
                  {item.tab ? (
                    <button
                      onClick={() => onTabChange(item.tab)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all
                        ${isActive
                          ? 'bg-gradient-to-r from-laia-primary/10 to-laia-rose/10 text-laia-primary shadow-laia-sm'
                          : 'hover:bg-laia-nude text-laia-gray hover:text-laia-dark'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        {Icon && (
                          <div className={`${isActive ? 'text-laia-primary' : ''}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                        )}
                        {!isCollapsed && (
                          <span className="font-medium text-sm">{item.label}</span>
                        )}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span className={`
                          px-2 py-0.5 text-xs font-bold rounded-full
                          ${item.badge === 'NEW'
                            ? 'bg-gradient-to-r from-laia-primary to-laia-rose text-white'
                            : 'bg-laia-rose-light text-laia-rose-dark'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all
                        hover:bg-laia-nude text-laia-gray hover:text-laia-dark
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        {Icon && (
                          <div>
                            <Icon className="h-5 w-5" />
                          </div>
                        )}
                        {!isCollapsed && (
                          <span className="font-medium text-sm">{item.label}</span>
                        )}
                      </div>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Stats rapides */}
        {!isCollapsed && (
          <div className="p-4 border-t border-laia-primary/10">
            <div className="bg-gradient-to-br from-laia-nude to-laia-rose-light rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-laia-gray">Aujourd'hui</span>
                <Clock className="h-4 w-4 text-laia-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-laia-gray">Rendez-vous</span>
                  <span className="text-sm font-bold text-laia-dark">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-laia-gray">Revenus</span>
                  <span className="text-sm font-bold text-laia-primary">560€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-laia-gray">Nouveaux clients</span>
                  <span className="text-sm font-bold text-laia-rose">3</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Centre d'aide */}
        <div className="p-4 border-t border-laia-primary/10">
          <Link
            href="/aide"
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-laia-nude text-laia-gray hover:text-laia-dark`}
          >
            <HelpCircle className="h-5 w-5" />
            {!isCollapsed && <span className="font-medium text-sm">Centre d'aide</span>}
          </Link>
        </div>

        {/* Bouton Noter LAIA */}
        {!isCollapsed && (
          <div className="px-4 pb-4">
            <Link
              href="/admin/rate-laia"
              className="block w-full"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-3 hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg cursor-pointer">
                <div className="flex items-center justify-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="font-semibold text-sm">Noter LAIA Connect</span>
                </div>
                <p className="text-xs text-center mt-1 text-purple-100">
                  Donnez-nous votre avis
                </p>
              </div>
            </Link>
          </div>
        )}

        {/* Footer avec cœur */}
        <div className="p-4 border-t border-laia-primary/10">
          <div className="flex items-center justify-center space-x-2 text-xs text-laia-gray">
            {!isCollapsed && <span>Fait avec</span>}
            <Heart className="h-3 w-3 text-laia-rose fill-current animate-pulse" />
            {!isCollapsed && <span>par LAIA</span>}
          </div>
        </div>
      </div>
    </aside>
  );
}