'use client'

import { useState, useEffect } from 'react'
import { calculateSMSCount, calculateSMSCost, replaceVariables } from '@/lib/sms-service'
import { Plus, UserPlus, X } from 'lucide-react'

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
  const [showAddContact, setShowAddContact] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' })
  const [createAsClient, setCreateAsClient] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/admin/clients')
      if (response.ok) {
        const data = await response.json()
        // L'API retourne soit data.clients soit directement un array
        const clientsData = Array.isArray(data) ? data : (data.clients || [])
        // Filtrer uniquement les clients avec numéro de téléphone
        const clientsWithPhone = clientsData.filter((c: Client) => c.phone && c.phone.trim() !== '')
        setClients(clientsWithPhone)

        console.log(`📱 Clients chargés: ${clientsData.length} total, ${clientsWithPhone.length} avec téléphone`)
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error)
    }
  }

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      alert('Veuillez saisir au minimum un nom et un numéro de téléphone')
      return
    }

    const contact: Client = {
      id: `temp-${Date.now()}`,
      name: newContact.name,
      phone: newContact.phone,
      email: newContact.email || `${newContact.phone}@temp.com`
    }

    setClients([contact, ...clients])
    setSelectedClient(contact)
    setShowAddContact(false)
    setNewContact({ name: '', phone: '', email: '' })
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
      // Si c'est un contact temporaire ET qu'on veut créer un client
      if (selectedClient.id.startsWith('temp-') && createAsClient) {
        const createResponse = await fetch('/api/admin/crm/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: selectedClient.name,
            phone: selectedClient.phone,
            email: selectedClient.email !== `${selectedClient.phone}@temp.com` ? selectedClient.email : `${selectedClient.phone}@contact.com`
          })
        })

        if (createResponse.ok) {
          const newClient = await createResponse.json()
          console.log('✅ Client créé:', newClient)
          // Mettre à jour le selectedClient avec le vrai ID
          selectedClient.id = newClient.id
          // Rafraîchir la liste des clients
          await fetchClients()
        } else {
          console.warn('⚠️ Impossible de créer le client, envoi du SMS quand même')
        }
      }

      const response = await fetch('/api/admin/sms/send-individual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient.id.startsWith('temp-') ? null : selectedClient.id,
          phone: selectedClient.phone,
          message
        })
      })

      if (response.ok) {
        alert('SMS envoyé avec succès !')
        setMessage('')
        setSelectedClient(null)
        setCreateAsClient(false)
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sélectionner un client</h3>
          <button
            onClick={() => setShowAddContact(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            <Plus className="w-4 h-4" />
            Nouveau contact
          </button>
        </div>

        {/* Formulaire ajout contact */}
        {showAddContact && (
          <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-blue-900">Ajouter un contact</h4>
              <button
                onClick={() => {
                  setShowAddContact(false)
                  setNewContact({ name: '', phone: '', email: '' })
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="jean@example.com"
                />
              </div>

              <button
                onClick={handleAddContact}
                disabled={!newContact.name || !newContact.phone}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Ajouter ce contact
              </button>
            </div>
          </div>
        )}

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
          <div className="mt-4 space-y-3">
            <div className={`p-3 border rounded-lg ${
              selectedClient.id.startsWith('temp-')
                ? 'bg-blue-50 border-blue-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className={`text-sm font-medium ${
                  selectedClient.id.startsWith('temp-') ? 'text-blue-900' : 'text-green-900'
                }`}>
                  {selectedClient.id.startsWith('temp-') ? '📞 Contact temporaire' : '✅ Client sélectionné'}
                </div>
                {selectedClient.id.startsWith('temp-') && (
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                    Nouveau
                  </span>
                )}
              </div>
              <div className={`text-sm ${
                selectedClient.id.startsWith('temp-') ? 'text-blue-700' : 'text-green-700'
              }`}>
                {selectedClient.name}
              </div>
              <div className={`text-xs ${
                selectedClient.id.startsWith('temp-') ? 'text-blue-600' : 'text-green-600'
              }`}>
                {selectedClient.phone}
              </div>
            </div>

            {/* Option pour créer le contact comme client */}
            {selectedClient.id.startsWith('temp-') && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createAsClient}
                    onChange={(e) => setCreateAsClient(e.target.checked)}
                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-purple-900">
                      💾 Enregistrer comme client
                    </div>
                    <div className="text-xs text-purple-700 mt-1">
                      Ce contact sera ajouté à votre base clients après l'envoi du SMS
                    </div>
                  </div>
                </label>
              </div>
            )}
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
