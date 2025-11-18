"use client";
// Force recompile for Turbopack cache refresh

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Shield, User, LogOut, Calculator } from "lucide-react";
import { logout } from "@/lib/auth-client";
import { useConfig } from "@/hooks/useConfig";

// Composant NavItem séparé pour gérer le hover state
function NavItem({ item, pathname, primaryColor, secondaryColor, accentColor }: {
  item: { href: string; label: string };
  pathname: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = pathname === item.href;

  return (
    <li>
      <span
        onMouseEnter={() => !isActive && setIsHovered(true)}
        onMouseLeave={() => !isActive && setIsHovered(false)}
      >
        <Link
          href={item.href}
          className={`font-inter inline-flex items-center justify-center min-w-[100px] text-center font-medium px-4 py-2 rounded-full transition-all duration-300 hover:text-white hover:-translate-y-0.5 hover:shadow-lg text-sm tracking-normal whitespace-nowrap ${
            isActive ? "text-white" : ""
          }`}
          style={
            isActive || isHovered
              ? { background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }
              : { color: accentColor }
          }
        >
          {item.label}
        </Link>
      </span>
    </li>
  );
}

type OrgPlan = 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM' | 'STARTER' | 'ESSENTIAL' | 'PROFESSIONAL' | 'ENTERPRISE';

interface OrganizationData {
  name: string;
  plan: OrgPlan;
  featureBlog: boolean;
  featureProducts: boolean;
  featureFormations: boolean;
  config: {
    siteName: string | null;
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

interface HeaderProps {
  organizationData?: any;
}

export default function Header({ organizationData }: HeaderProps = {}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { config } = useConfig();
  const [orgData, setOrgData] = useState<OrganizationData | null>(organizationData || null);

  useEffect(() => {
    const checkUser = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch {
          setUser(null);
        }
      }
    };

    checkUser();
    // Vérifier à chaque changement de page
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, [pathname]);

  const [showProducts, setShowProducts] = useState(false);
  const [showFormations, setShowFormations] = useState(false);
  const [showServices, setShowServices] = useState(false);

  useEffect(() => {
    // Charger les données de l'organisation seulement si pas déjà passées en props
    if (!organizationData) {
      const loadOrgData = async () => {
        try {
          const res = await fetch('/api/organization/current');
          if (res.ok) {
            const data = await res.json();
            setOrgData(data);
          }
        } catch (error) {
          console.log('Could not load organization data');
        }
      };

      loadOrgData();
    }

    // Vérifier s'il y a des produits, formations et prestations actifs
    const checkContent = async () => {
      try {
        const [productsRes, formationsRes, servicesRes] = await Promise.all([
          fetch('/api/products').catch(() => null),
          fetch('/api/formations').catch(() => null),
          fetch('/api/services').catch(() => null)
        ]);

        if (productsRes && productsRes.ok) {
          const products = await productsRes.json();
          setShowProducts(products.length > 0);
        }

        if (formationsRes && formationsRes.ok) {
          const formations = await formationsRes.json();
          setShowFormations(formations.length > 0);
        }

        if (servicesRes && servicesRes.ok) {
          const services = await servicesRes.json();
          setShowServices(services.length > 0);
        }
      } catch (error) {
        console.log('Could not check content visibility');
      }
    };

    checkContent();
  }, [pathname]);

  // Fonction pour vérifier si un onglet doit être affiché selon le plan
  const isFeatureEnabled = (feature: 'blog' | 'products' | 'formations') => {
    if (!orgData) return true; // Si pas encore chargé, afficher tout par défaut

    switch (feature) {
      case 'blog':
        // Blog disponible à partir de TEAM
        return ['TEAM', 'PREMIUM', 'PROFESSIONAL', 'ENTERPRISE'].includes(orgData.plan) && orgData.featureBlog;
      case 'products':
        // Produits disponibles à partir de TEAM
        return ['TEAM', 'PREMIUM', 'PROFESSIONAL', 'ENTERPRISE'].includes(orgData.plan) && orgData.featureProducts;
      case 'formations':
        // Formations disponibles à partir de TEAM (via boutique)
        return ['TEAM', 'PREMIUM', 'PROFESSIONAL', 'ENTERPRISE'].includes(orgData.plan) && orgData.featureFormations;
      default:
        return true;
    }
  };

  const allNavItems = [
    { href: "/", label: "Accueil" },
    { href: "/prestations", label: "Mes Prestations", showCondition: showServices },
    { href: "/produits", label: "Mes Produits", showCondition: showProducts && isFeatureEnabled('products') },
    { href: "/formations", label: "Mes Formations", showCondition: showFormations && isFeatureEnabled('formations') },
    { href: "/carte-cadeau", label: "Carte Cadeau" },
    { href: "/blog", label: "Blog", showCondition: isFeatureEnabled('blog') },
    { href: "/a-propos", label: "À Propos" },
    { href: "/reservation", label: "Réserver" },
    { href: "/contact", label: "Contact" },
    { href: "/espace-client", label: "Espace Client" },
  ];

  const navItems = allNavItems.filter(item => !item.hasOwnProperty('showCondition') || item.showCondition);

  // Couleurs dynamiques
  const primaryColor = orgData?.config?.primaryColor || '#d4b5a0';
  const secondaryColor = orgData?.config?.secondaryColor || '#c9a084';
  const accentColor = orgData?.config?.accentColor || '#2c3e50';

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-xl border-b z-50 shadow-lg" style={{ borderColor: `${primaryColor}33` }}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 relative">
              <Image
                src={orgData?.config?.logoUrl || config.logoUrl || "/logo-laia-skin.png"}
                alt={`${orgData?.config?.siteName || config.siteName} Logo`}
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-semibold tracking-wide" style={{ color: accentColor }}>
              {pathname === '/login' ? 'LAIA CONNECT' : (orgData?.config?.siteName || config.siteName)?.toUpperCase() || 'MON INSTITUT'}
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:block overflow-x-auto overflow-y-hidden flex-1 mx-4 scrollbar-custom">
            <ul className="flex items-center gap-2 min-w-max pb-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  accentColor={accentColor}
                />
              ))}

              {/* Boutons spéciaux pour les utilisateurs connectés */}
              {user && (
                <>
                  {user.role === 'EMPLOYEE' && (
                    <li>
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        <Shield className="w-4 h-4" />
                        Espace Employé
                      </Link>
                    </li>
                  )}
                  {user.role === 'COMPTABLE' && (
                    <li>
                      <Link
                        href="/comptable"
                        className="flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl text-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        <Calculator className="w-4 h-4" />
                        Espace Comptable
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 text-red-600 font-medium px-4 py-2 rounded-full transition-all duration-300 hover:bg-red-50 hover:-translate-y-0.5 text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: accentColor }}>
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block font-medium px-6 py-3 rounded-full transition-all duration-300 ${
                  pathname === item.href ? "text-white" : ""
                }`}
                style={
                  pathname === item.href
                    ? { background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }
                    : { color: accentColor, backgroundColor: 'transparent' }
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Boutons spéciaux dans le menu mobile */}
            {user && (
              <>
                {user.role === 'EMPLOYEE' && (
                  <Link
                    href="/admin"
                    className="block text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="w-4 h-4 inline mr-2" />
                    Espace Employé
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-red-600 font-medium px-6 py-3 rounded-full transition-all duration-300 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Déconnexion
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}