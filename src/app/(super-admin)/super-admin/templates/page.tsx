'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Palette, Eye, Check, Sparkles, Zap, Feather, Crown, Heart, Leaf, Briefcase, Store, Smile, Stethoscope, Flower2, Zap as ZapTech } from 'lucide-react'
import SuperAdminNav from '@/components/SuperAdminNav'

interface TemplatePreview {
  id: string
  name: string
  description: string
  style: 'classic' | 'modern' | 'minimal' | 'professional' | 'boutique' | 'fresh' | 'luxe' | 'elegance' | 'zen' | 'medical' | 'spa-luxe' | 'laser-tech'
  tier: 'standard' | 'premium'
  icon: any
  preview: {
    colors: string[]
    features: string[]
    bestFor: string
  }
}

const templates: TemplatePreview[] = [
  {
    id: 'classic',
    name: 'Élégance Classic',
    description: 'Design élégant et chaleureux avec gradients doux et animations fluides',
    style: 'classic',
    tier: 'standard',
    icon: Sparkles,
    preview: {
      colors: ['#fdfbf7', '#f8f6f0', 'Gradients clairs'],
      features: [
        'Hero avec animations de gradient',
        'Grille services 3 colonnes',
        'Section fonctionnalités (3 cartes)',
        'Call-to-action engageant',
        'Design lumineux et accueillant'
      ],
      bestFor: 'Instituts classiques, spas haut de gamme, centres esthétiques traditionnels'
    }
  },
  {
    id: 'modern',
    name: 'Futuriste Modern',
    description: 'Design ultra-moderne avec fond noir, effets néon et grilles animées pour une ambiance cyberpunk',
    style: 'modern',
    tier: 'standard',
    icon: Zap,
    preview: {
      colors: ['#000000', 'Effets néon', 'Gradients colorés'],
      features: [
        'Header transparent fixe avec backdrop-blur',
        'Grille de fond animée',
        'Cartes services avec effets 3D hover',
        'Typographie bold et futuriste',
        'Ombres lumineuses néon'
      ],
      bestFor: 'Salons avant-gardistes, cliniques high-tech, instituts de médecine esthétique'
    }
  },
  {
    id: 'minimal',
    name: 'Éditorial Minimal',
    description: 'Style magazine éditorial avec typographie géante, espacement extrême et design ultra épuré',
    style: 'minimal',
    tier: 'standard',
    icon: Feather,
    preview: {
      colors: ['#FFFFFF', 'Gris subtils', 'Accents de couleur'],
      features: [
        'Typographie géante (8xl/9xl)',
        'Espacement généreux',
        'Liste services verticale numérotée',
        'Grille équipe alignée',
        'Style magazine luxe'
      ],
      bestFor: 'Instituts de luxe, concept stores beauté, boutiques haut de gamme'
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Design corporate et professionnel avec mise en page structurée et ambiance business',
    style: 'professional',
    tier: 'standard',
    icon: Briefcase,
    preview: {
      colors: ['Blanc', 'Gris', 'Accents colorés'],
      features: [
        'Header corporate sticky',
        'Grid services en cartes',
        'Section stats et badges',
        'Layout structuré et clair',
        'Footer professionnel'
      ],
      bestFor: 'Cliniques esthétiques, centres médicaux, instituts corporates'
    }
  },
  {
    id: 'boutique',
    name: 'Boutique Chic',
    description: 'Style boutique raffiné avec touches élégantes et ambiance intime',
    style: 'boutique',
    tier: 'standard',
    icon: Store,
    preview: {
      colors: ['Rose pâle', 'Violet', 'Blanc'],
      features: [
        'Design chic et raffiné',
        'Cartes services numérotées',
        'Étoiles décoratives',
        'Photos équipe rondes',
        'Ambiance boutique intimiste'
      ],
      bestFor: 'Boutiques beauté, instituts chics, salons urbains tendance'
    }
  },
  {
    id: 'fresh',
    name: 'Fresh & Dynamic',
    description: 'Design jeune et dynamique avec couleurs vives et ambiance énergique',
    style: 'fresh',
    tier: 'standard',
    icon: Smile,
    preview: {
      colors: ['Cyan', 'Bleu', 'Violet'],
      features: [
        'Design coloré et dynamique',
        'Badges numérotés colorés',
        'Formes en arrière-plan',
        'Typographie bold et fun',
        'Ambiance jeune et moderne'
      ],
      bestFor: 'Instituts jeunes, salons modernes, centres urbains dynamiques'
    }
  },
  {
    id: 'luxe',
    name: 'Luxe',
    description: 'Design sophistiqué avec fond noir et effets élégants. Ambiance moderne et chic',
    style: 'luxe',
    tier: 'standard',
    icon: Crown,
    preview: {
      colors: ['#000000', '#d4af37', 'Or & Noir'],
      features: [
        'Navbar glassmorphism premium',
        'Ornements dorés animés',
        'Cartes services glassmorphism',
        'Typographie serif élégante',
        'Effets lumineux dorés',
        'Section stats premium'
      ],
      bestFor: 'Instituts de luxe 5 étoiles, spas palace, cliniques esthétiques premium'
    }
  },
  {
    id: 'elegance',
    name: 'Élégance',
    description: 'Design raffiné avec animations fluides et dégradés subtils',
    style: 'elegance',
    tier: 'standard',
    icon: Heart,
    preview: {
      colors: ['#FFFFFF', 'Dégradés', 'Pastels élégants'],
      features: [
        'Header avec backdrop-blur',
        'Badges premium élégants',
        'Cartes services avec hover 3D',
        'Section équipe avec overlay',
        'Animations fluides',
        'Stats élégantes'
      ],
      bestFor: 'Instituts premium, centres bien-être haut de gamme, spas urbains chics'
    }
  },
  {
    id: 'zen',
    name: 'Zen',
    description: 'Ambiance naturelle et apaisante avec tons organiques et design zen',
    style: 'zen',
    tier: 'standard',
    icon: Leaf,
    preview: {
      colors: ['Beige', 'Émeraude', 'Tons naturels'],
      features: [
        'Design organique apaisant',
        'Motifs naturels animés',
        'Palette éco-responsable',
        'Typographie zen',
        'Cadres décoratifs ronds',
        'Ambiance spa naturel'
      ],
      bestFor: 'Spas naturels, centres ayurvédiques, instituts bio, wellness centers'
    }
  },
  {
    id: 'medical',
    name: 'Medical Premium',
    description: 'Design médical professionnel inspiré des cliniques esthétiques de pointe. Interface moderne et rassurante',
    style: 'medical',
    tier: 'premium',
    icon: Stethoscope,
    preview: {
      colors: ['Blanc', 'Bleu médical', 'Gris professionnel'],
      features: [
        'Design médical premium',
        'Interface clinique moderne',
        'Sections avant/après',
        'Certifications médicales',
        'Formulaire de consultation',
        'Galerie résultats'
      ],
      bestFor: 'Cliniques esthétiques médicales, médecins esthétiques, centres laser médicaux'
    }
  },
  {
    id: 'spa-luxe',
    name: 'Spa Luxe Premium',
    description: 'Expérience spa haut de gamme avec carrousel immersif, vidéos et réservation intégrée',
    style: 'spa-luxe',
    tier: 'premium',
    icon: Flower2,
    preview: {
      colors: ['Or', 'Blanc crème', 'Tons chauds'],
      features: [
        'Carrousel full-screen',
        'Vidéo de fond immersive',
        'Formulaire multi-étapes',
        'Galerie d\'ambiance',
        'Témoignages vidéo',
        'Packages exclusifs'
      ],
      bestFor: 'Spas 5 étoiles, resorts wellness, centres thalasso luxe, hôtels spa'
    }
  },
  {
    id: 'laser-tech',
    name: 'Laser Tech Premium',
    description: 'Design technologique pour centres d\'épilation laser avec calculateurs et comparatifs interactifs',
    style: 'laser-tech',
    tier: 'premium',
    icon: ZapTech,
    preview: {
      colors: ['Blanc', 'Cyan tech', 'Gradients futuristes'],
      features: [
        'Animations technologiques',
        'Comparatifs interactifs avant/après',
        'Carte zones de traitement',
        'Calculateur de prix dynamique',
        'FAQ interactive',
        'Booking intelligent'
      ],
      bestFor: 'Centres épilation laser, cliniques laser, franchises épilation, instituts tech'
    }
  }
]

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const standardTemplates = templates.filter(t => t.tier === 'standard')
  const premiumTemplates = templates.filter(t => t.tier === 'premium')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <SuperAdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Templates de Site Web
              </h1>
              <p className="text-gray-600 text-lg">
                Gérez les templates disponibles pour les organisations clientes
              </p>
            </div>
          </div>
        </div>

        {/* Templates Standard */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Templates Standard</h2>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
              {standardTemplates.length} templates
            </span>
          </div>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            {standardTemplates.map((template) => {
            const Icon = template.icon
            const isSelected = selectedTemplate === template.id

            return (
              <div
                key={template.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                  isSelected ? 'ring-4 ring-purple-500 shadow-2xl scale-105' : 'hover:shadow-xl hover:scale-102'
                }`}
              >
                {/* Header coloré selon le style */}
                <div className={`p-6 ${
                  template.style === 'classic' ? 'bg-gradient-to-r from-purple-100 to-pink-100' :
                  template.style === 'modern' ? 'bg-gradient-to-r from-gray-900 to-gray-800' :
                  'bg-gradient-to-r from-gray-100 to-white'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      template.style === 'classic' ? 'bg-purple-200' :
                      template.style === 'modern' ? 'bg-gray-700' :
                      'bg-gray-200'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        template.style === 'modern' ? 'text-white' : 'text-gray-700'
                      }`} />
                    </div>
                    {isSelected && (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold">
                        <Check className="w-4 h-4" />
                        Sélectionné
                      </div>
                    )}
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${
                    template.style === 'modern' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {template.name}
                  </h3>
                  <p className={`text-sm ${
                    template.style === 'modern' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {template.description}
                  </p>
                </div>

                {/* Preview colors */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Palette de couleurs
                  </h4>
                  <div className="flex gap-2">
                    {template.preview.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {color}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Caractéristiques
                  </h4>
                  <ul className="space-y-2">
                    {template.preview.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best for */}
                <div className="p-6 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Idéal pour
                  </h4>
                  <p className="text-sm text-gray-600">
                    {template.preview.bestFor}
                  </p>
                </div>

                {/* Actions */}
                <div className="p-6 flex gap-3">
                  <button
                    onClick={() => setSelectedTemplate(isSelected ? null : template.id)}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected ? 'Sélectionné' : 'Sélectionner'}
                  </button>
                  <Link
                    href={`/super-admin/templates/${template.id}/preview`}
                    className="px-4 py-2 rounded-lg font-semibold bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300 hover:text-purple-600 transition-all flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Aperçu
                  </Link>
                </div>
              </div>
            )
          })}
          </div>
        </div>

        {/* Templates Premium */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Templates Premium</h2>
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm rounded-full font-bold flex items-center gap-1.5 shadow-lg">
              <Crown className="w-4 h-4" />
              {premiumTemplates.length} templates
            </span>
          </div>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            {premiumTemplates.map((template) => {
            const Icon = template.icon
            const isSelected = selectedTemplate === template.id

            return (
              <div
                key={template.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 border-2 ${
                  isSelected ? 'ring-4 ring-yellow-500 shadow-2xl scale-105 border-yellow-400' : 'border-yellow-200 hover:shadow-2xl hover:scale-102 hover:border-yellow-300'
                }`}
              >
                {/* Badge Premium */}
                <div className="absolute -top-2 -right-2 z-20 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-xl flex items-center gap-1.5">
                  <Crown className="w-4 h-4" />
                  PREMIUM
                </div>

                {/* Header coloré selon le style */}
                <div className={`p-6 ${
                  template.style === 'luxe' ? 'bg-gradient-to-r from-gray-900 to-black' :
                  template.style === 'elegance' ? 'bg-gradient-to-r from-purple-100 to-pink-100' :
                  'bg-gradient-to-r from-emerald-100 to-teal-100'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      template.style === 'luxe' ? 'bg-yellow-500/20' :
                      template.style === 'elegance' ? 'bg-purple-200' :
                      'bg-emerald-200'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        template.style === 'luxe' ? 'text-yellow-400' :
                        template.style === 'elegance' ? 'text-purple-600' :
                        'text-emerald-600'
                      }`} />
                    </div>
                    {isSelected && (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold">
                        <Check className="w-4 h-4" />
                        Sélectionné
                      </div>
                    )}
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${
                    template.style === 'luxe' ? 'text-yellow-400' : 'text-gray-900'
                  }`}>
                    {template.name}
                  </h3>
                  <p className={`text-sm ${
                    template.style === 'luxe' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {template.description}
                  </p>
                </div>

                {/* Preview colors */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Palette de couleurs
                  </h4>
                  <div className="flex gap-2">
                    {template.preview.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 text-gray-700"
                      >
                        {color}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Caractéristiques Premium
                  </h4>
                  <ul className="space-y-2">
                    {template.preview.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best for */}
                <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Idéal pour
                  </h4>
                  <p className="text-sm text-gray-600">
                    {template.preview.bestFor}
                  </p>
                </div>

                {/* Actions */}
                <div className="p-6 flex gap-3">
                  <button
                    onClick={() => setSelectedTemplate(isSelected ? null : template.id)}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                        : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 hover:from-yellow-200 hover:to-orange-200'
                    }`}
                  >
                    {isSelected ? 'Sélectionné' : 'Sélectionner'}
                  </button>
                  <Link
                    href={`/super-admin/templates/${template.id}/preview`}
                    className="px-4 py-2 rounded-lg font-semibold bg-white border-2 border-yellow-300 text-yellow-700 hover:border-yellow-400 hover:bg-yellow-50 transition-all flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Aperçu
                  </Link>
                </div>
              </div>
            )
          })}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            📐 Comment fonctionnent les templates ?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🎨 Design avant tout</h4>
              <p className="text-gray-700 text-sm">
                Chaque template propose une mise en page et une structure unique. Les couleurs sont entièrement personnalisables par l'organisation cliente.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🔄 Dynamique et réactif</h4>
              <p className="text-gray-700 text-sm">
                Les templates s'adaptent automatiquement aux couleurs primaires et secondaires choisies par le client dans ses paramètres.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📱 Mobile-first</h4>
              <p className="text-gray-700 text-sm">
                Tous les templates sont entièrement responsives et optimisés pour mobile, tablette et desktop.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">⚡ Performance</h4>
              <p className="text-gray-700 text-sm">
                Templates optimisés avec Next.js 15, Tailwind CSS et animations GPU pour une expérience ultra-rapide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
