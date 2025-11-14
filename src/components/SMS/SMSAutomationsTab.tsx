'use client'

import { useState, useEffect } from 'react'

interface Automation {
  id: string
  name: string
  trigger: string
  template: string
  isActive: boolean
  sentCount: number
}

interface SMSAutomationsTabProps {
  organizationId: string
}

export default function SMSAutomationsTab({ organizationId }: SMSAutomationsTabProps) {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Confirmation RDV',
      trigger: 'booking_confirmed',
      template: 'Bonjour {{prenom}}, votre RDV du {{dateRDV}} à {{heureRDV}} est confirmé. À bientôt !',
      isActive: true,
      sentCount: 245
    },
    {
      id: '2',
      name: 'Rappel RDV 24h',
      trigger: 'booking_reminder_24h',
      template: 'Rappel : RDV demain à {{heureRDV}} pour {{service}}. Répondez ANNULER pour annuler.',
      isActive: true,
      sentCount: 198
    },
    {
      id: '3',
      name: 'Anniversaire client',
      trigger: 'client_birthday',
      template: '🎉 Joyeux anniversaire {{prenom}} ! Profitez de -20% sur votre prochain soin.',
      isActive: false,
      sentCount: 12
    }
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null)

  const handleToggleActive = (id: string) => {
    setAutomations(automations.map(auto =>
      auto.id === id ? { ...auto, isActive: !auto.isActive } : auto
    ))
  }

  const handleEdit = (automation: Automation) => {
    setEditingAutomation(automation)
    setShowModal(true)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Supprimer l'automatisation "${name}" ?`)) {
      setAutomations(automations.filter(auto => auto.id !== id))
    }
  }

  const getTriggerLabel = (trigger: string) => {
    const labels: { [key: string]: string } = {
      booking_confirmed: '📅 Réservation confirmée',
      booking_reminder_24h: '⏰ Rappel 24h avant RDV',
      booking_reminder_2h: '⏰ Rappel 2h avant RDV',
      booking_cancelled: '❌ Réservation annulée',
      client_birthday: '🎂 Anniversaire client',
      first_visit: '🆕 Première visite',
      loyalty_milestone: '⭐ Palier fidélité atteint'
    }
    return labels[trigger] || trigger
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Automatisations SMS</h3>
          <p className="text-sm text-gray-500 mt-1">
            Envoyez automatiquement des SMS selon des événements prédéfinis
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAutomation(null)
            setShowModal(true)
          }}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          + Nouvelle automatisation
        </button>
      </div>

      {/* Liste des automatisations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-200">
          {automations.map((automation) => (
            <div key={automation.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {automation.name}
                    </h4>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      automation.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {automation.isActive ? '✓ Active' : '○ Inactive'}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    {getTriggerLabel(automation.trigger)}
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="text-sm text-gray-700 font-mono">
                      {automation.template}
                    </p>
                  </div>

                  <div className="text-sm text-gray-500">
                    📊 {automation.sentCount} SMS envoyés
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(automation.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      automation.isActive ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        automation.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => handleEdit(automation)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Modifier"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => handleDelete(automation.id, automation.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Nouvelle/Modification automatisation */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingAutomation ? 'Modifier l\'automatisation' : 'Nouvelle automatisation'}
              </h2>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'automatisation
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ex: Rappel RDV 24h"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Déclencheur
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="booking_confirmed">📅 Réservation confirmée</option>
                    <option value="booking_reminder_24h">⏰ Rappel 24h avant RDV</option>
                    <option value="booking_reminder_2h">⏰ Rappel 2h avant RDV</option>
                    <option value="booking_cancelled">❌ Réservation annulée</option>
                    <option value="client_birthday">🎂 Anniversaire client</option>
                    <option value="first_visit">🆕 Première visite</option>
                    <option value="loyalty_milestone">⭐ Palier fidélité atteint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message SMS
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg h-32"
                    placeholder="Bonjour {{prenom}}, votre RDV..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Variables: {'{{'} prenom {'}}'},  {'{{'} nom {'}}'},  {'{{'} dateRDV {'}}'},  {'{{'} heureRDV {'}}'},  {'{{'} service {'}}'},  {'{{'} institut {'}}'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    defaultChecked
                    className="w-4 h-4 text-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Automatisation active
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {editingAutomation ? 'Enregistrer' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
