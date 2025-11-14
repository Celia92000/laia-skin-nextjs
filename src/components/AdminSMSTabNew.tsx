'use client'

import { useState, useEffect } from 'react'
import SMSCreditsWidget from './SMS/SMSCreditsWidget'
import SMSIndividualTab from './SMS/SMSIndividualTab'
import SMSAutomationsTab from './SMS/SMSAutomationsTab'

interface Organization {
  id: string
  smsCredits: number
  smsTotalPurchased: number
}

export default function AdminSMSTabNew() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<'individual' | 'campaigns' | 'automations' | 'templates'>('individual')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrganization()
  }, [])

  const fetchOrganization = async () => {
    try {
      const response = await fetch('/api/admin/organization')
      if (response.ok) {
        const data = await response.json()
        setOrganization(data.organization)
      }
    } catch (error) {
      console.error('Erreur chargement organisation:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshCredits = () => {
    fetchOrganization()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">Erreur de chargement de l'organisation</p>
      </div>
    )
  }

  const tabs = [
    { id: 'individual', label: 'SMS Individuel', icon: '💬' },
    { id: 'campaigns', label: 'Campagnes', icon: '📢' },
    { id: 'automations', label: 'Automatisations', icon: '⚡' },
    { id: 'templates', label: 'Templates', icon: '📝' }
  ]

  return (
    <div className="space-y-6">
      {/* Widget Crédits SMS */}
      <SMSCreditsWidget
        currentCredits={organization.smsCredits}
        organizationId={organization.id}
        onPurchase={refreshCredits}
      />

      {/* Navigation sous-onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium transition-colors ${
                  activeSubTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des sous-onglets */}
        <div className="p-6">
          {activeSubTab === 'individual' && (
            <SMSIndividualTab
              organizationId={organization.id}
              smsCredits={organization.smsCredits}
              onSent={refreshCredits}
            />
          )}

          {activeSubTab === 'campaigns' && (
            <div className="text-center p-12 text-gray-500">
              <div className="text-6xl mb-4">📢</div>
              <h3 className="text-xl font-semibold mb-2">Campagnes SMS</h3>
              <p>Envoyez des SMS à plusieurs clients en même temps</p>
              <p className="text-sm mt-2">Fonctionnalité en cours de développement</p>
            </div>
          )}

          {activeSubTab === 'automations' && (
            <SMSAutomationsTab organizationId={organization.id} />
          )}

          {activeSubTab === 'templates' && (
            <div className="text-center p-12 text-gray-500">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">Templates SMS</h3>
              <p>Créez et gérez vos modèles de messages réutilisables</p>
              <p className="text-sm mt-2">Fonctionnalité en cours de développement</p>
            </div>
          )}
        </div>
      </div>

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ À propos des SMS</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Coût : 0.035€ par SMS via Brevo</li>
          <li>• Les crédits n'expirent jamais</li>
          <li>• 1 crédit = 1 SMS (160 caractères max par SMS)</li>
          <li>• Messages longs = plusieurs SMS (153 caractères par SMS)</li>
          <li>• Achetez des packs pour bénéficier de réductions jusqu'à -40%</li>
        </ul>
      </div>
    </div>
  )
}
