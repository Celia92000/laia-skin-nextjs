'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, X } from 'lucide-react'
import TemplateClassic from '@/components/templates/TemplateClassic'
import TemplateModern from '@/components/templates/TemplateModern'
import TemplateMinimal from '@/components/templates/TemplateMinimal'
import TemplateProfessional from '@/components/templates/TemplateProfessional'
import TemplateBoutique from '@/components/templates/TemplateBoutique'
import TemplateFresh from '@/components/templates/TemplateFresh'
import TemplateLuxe from '@/components/templates/TemplateLuxe'
import TemplateElegance from '@/components/templates/TemplateElegance'
import TemplateZen from '@/components/templates/TemplateZen'
import TemplateMedical from '@/components/templates/TemplateMedical'
import TemplateSpaLuxe from '@/components/templates/TemplateSpaLuxe'
import TemplateLaserTech from '@/components/templates/TemplateLaserTech'

// Données de démo
const demoOrganization = {
  name: 'Laia Skin Institut',
  description: 'Institut spécialisé dans les techniques esthétiques avancées pour sublimer votre beauté naturelle',
  primaryColor: '#c084fc',
  secondaryColor: '#4a044e'
}

const demoServices = [
  {
    id: '1',
    name: 'Soin Visage Éclat',
    price: 75,
    duration: 60,
    description: 'Nettoyage en profondeur, gommage doux et masque hydratant pour une peau lumineuse'
  },
  {
    id: '2',
    name: 'Massage Relaxant',
    price: 85,
    duration: 90,
    description: 'Massage corps complet aux huiles essentielles pour une détente absolue'
  },
  {
    id: '3',
    name: 'Épilation Jambes Complètes',
    price: 45,
    duration: 45,
    description: 'Épilation à la cire douce pour une peau lisse et soyeuse'
  },
  {
    id: '4',
    name: 'Manucure Spa',
    price: 35,
    duration: 45,
    description: 'Soin complet des mains avec pose de vernis semi-permanent'
  },
  {
    id: '5',
    name: 'Pédicure Beauté',
    price: 40,
    duration: 50,
    description: 'Soin des pieds avec gommage et massage relaxant'
  },
  {
    id: '6',
    name: 'Soin Anti-Âge',
    price: 95,
    duration: 75,
    description: 'Traitement complet pour réduire les signes de l\'âge et raffermir la peau'
  },
  {
    id: '7',
    name: 'Extension de Cils',
    price: 65,
    duration: 120,
    description: 'Pose d\'extensions de cils pour un regard intense et naturel'
  },
  {
    id: '8',
    name: 'Maquillage Professionnel',
    price: 55,
    duration: 60,
    description: 'Maquillage sur-mesure pour toutes occasions'
  }
]

const demoTeam = [
  {
    id: '1',
    name: 'Sophie Martin',
    role: 'Esthéticienne diplômée',
    imageUrl: undefined
  },
  {
    id: '2',
    name: 'Emma Dubois',
    role: 'Spécialiste soins visage',
    imageUrl: undefined
  },
  {
    id: '3',
    name: 'Lucas Bernard',
    role: 'Masseur professionnel',
    imageUrl: undefined
  }
]

export default function TemplatePreviewPage() {
  const params = useParams()
  const templateId = params.id as string

  const getTemplateName = () => {
    const names: Record<string, string> = {
      classic: 'Classic',
      modern: 'Modern',
      minimal: 'Minimal',
      professional: 'Professional',
      boutique: 'Boutique Chic',
      fresh: 'Fresh & Dynamic',
      luxe: 'Luxe',
      elegance: 'Élégance',
      zen: 'Zen',
      medical: 'Medical Premium',
      'spa-luxe': 'Spa Luxe Premium',
      'laser-tech': 'Laser Tech Premium'
    }
    return names[templateId] || 'Inconnu'
  }

  const renderTemplate = () => {
    switch (templateId) {
      case 'classic':
        return <TemplateClassic organization={demoOrganization} services={demoServices} team={demoTeam} />
      case 'modern':
        return <TemplateModern organization={demoOrganization} services={demoServices} team={demoTeam} />
      case 'minimal':
        return <TemplateMinimal organization={demoOrganization} services={demoServices} team={demoTeam} />
      case 'professional':
        return <TemplateProfessional organization={demoOrganization} services={demoServices} team={demoTeam} />
      case 'boutique':
        return <TemplateBoutique organization={demoOrganization} services={demoServices} team={demoTeam} />
      case 'fresh':
        return <TemplateFresh organization={demoOrganization} services={demoServices} team={demoTeam} />
      case 'luxe':
        return <TemplateLuxe organization={demoOrganization} services={demoServices} team={demoTeam} />
      case 'elegance':
        return <TemplateElegance organization={demoOrganization} services={demoServices} team={demoTeam} />
      case 'zen':
        return <TemplateZen organization={demoOrganization} services={demoServices} team={demoTeam} />
      case 'medical':
        return <TemplateMedical organization={demoOrganization} services={demoServices} team={demoTeam} />
      case 'spa-luxe':
        return <TemplateSpaLuxe organization={demoOrganization} services={demoServices} team={demoTeam} />
      case 'laser-tech':
        return <TemplateLaserTech organization={demoOrganization} services={demoServices} team={demoTeam} />
      default:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Template non trouvé</h1>
              <Link
                href="/super-admin/templates"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Retour aux templates
              </Link>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="relative">
      {/* Floating back button */}
      <Link
        href="/super-admin/templates"
        className="fixed top-6 left-6 z-50 bg-white hover:bg-gray-50 text-gray-900 px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 font-semibold transition-all hover:scale-105 border-2 border-gray-200"
      >
        <ArrowLeft className="w-5 h-5" />
        Retour
      </Link>

      {/* Preview label */}
      <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-semibold text-white ${
        ['medical', 'spa-luxe', 'laser-tech'].includes(templateId)
          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
          : ['professional', 'boutique', 'fresh', 'luxe', 'elegance', 'zen'].includes(templateId)
          ? 'bg-gradient-to-r from-blue-500 to-purple-500'
          : 'bg-purple-600'
      }`}>
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        Aperçu - {getTemplateName()}
      </div>

      {/* Template preview */}
      {renderTemplate()}
    </div>
  )
}
