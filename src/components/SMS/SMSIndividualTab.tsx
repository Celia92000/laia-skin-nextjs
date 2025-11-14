'use client'

import { useState, useEffect } from 'react'
import { calculateSMSCount, calculateSMSCost, replaceVariables } from '@/lib/sms-service'

interface Client {
  id: string
  name: string
  email: string
  phone: string
}

interface SMSIndividualTabProps {
  organizationId: string
  smsCredits: number
  onSent?: () => void
}

export default function SMSIndividualTab({ organizationId, smsCredits, onSent }: SMSIndividualTabProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/admin/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error)
    }
  }

  const handleSend = async () => {
    if (!selectedClient || !message.trim()) {
      alert('Veuillez sélectionner un client et saisir un message')
      return
    }

    const smsCount = calculateSMSCount(message)

    if (smsCredits < smsCount) {
      alert(`Crédits insuffisants. Vous avez ${smsCredits} crédits, mais ${smsCount} SMS requis.`)
      return
    }

    if (!confirm(`Envoyer ${smsCount} SMS à ${selectedClient.name} ?`)) {
      return
    }

    setSending(true)

    try {
      const response = await fetch('/api/admin/sms/send-individual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient.id,
          message
        })
      })

      if (response.ok) {
        alert('SMS envoyé avec succès !')
        setMessage('')
        setSelectedClient(null)
        if (onSent) onSent()
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de l\'envoi du SMS')
      }
    } catch (error) {
      console.error('Erreur envoi SMS:', error)
      alert('Erreur lors de l\'envoi du SMS')
    } finally {
      setSending(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  )

  const smsCount = calculateSMSCount(message)
  const smsCost = calculateSMSCost(message)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sélection du client */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sélectionner un client</h3>

        <input
          type="text"
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
        />

        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredClients.map((client) => (
            <button
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className={`w-full p-3 text-left rounded-lg border transition-colors ${
                selectedClient?.id === client.id
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium text-gray-900">{client.name}</div>
              <div className="text-sm text-gray-500">{client.phone}</div>
            </button>
          ))}
        </div>

        {selectedClient && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm font-medium text-green-900">Client sélectionné</div>
            <div className="text-sm text-green-700">{selectedClient.name}</div>
            <div className="text-xs text-green-600">{selectedClient.phone}</div>
          </div>
        )}
      </div>

      {/* Composer le message */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Composer le message</h3>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Bonjour {'{{'} prenom {'}}'}, votre rendez-vous est confirmé pour le {'{{'} dateRDV {'}}'}..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg h-48 resize-none"
          maxLength={612}
        />

        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            {message.length}/612 caractères
          </div>
          <div className="text-gray-600">
            {smsCount} SMS ({smsCost.toFixed(3)}€)
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800 mb-2">
            💡 Variables disponibles : {'{{'} prenom {'}}'},  {'{{'} nom {'}}'},  {'{{'} dateRDV {'}}'},  {'{{'} heureRDV {'}}'},  {'{{'} service {'}}'},  {'{{'} institut {'}}'},  {'{{'} points {'}}'}
          </p>
        </div>

        <button
          onClick={handleSend}
          disabled={!selectedClient || !message.trim() || sending || smsCredits < smsCount}
          className="w-full mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Envoi en cours...' : `Envoyer le SMS (${smsCount} crédit${smsCount > 1 ? 's' : ''})`}
        </button>

        {smsCredits < smsCount && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              ⚠️ Crédits insuffisants. Rechargez vos crédits SMS.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
