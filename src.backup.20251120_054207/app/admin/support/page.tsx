'use client'

import { useState, useEffect } from 'react'
import { Plus, MessageSquare, Clock, CheckCircle } from 'lucide-react'

interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'QUESTION' | 'BUG' | 'OTHER'
  createdAt: string
  updatedAt: string
  messages?: TicketMessage[]
}

interface TicketMessage {
  id: string
  message: string
  author: {
    name: string
  }
  isInternal: boolean
  createdAt: string
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [replyMessage, setReplyMessage] = useState('')

  // Formulaire de création
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'MEDIUM' as const,
    category: 'QUESTION' as const
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    try {
      const response = await fetch('/api/admin/support/tickets')
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault()

    try {
      const response = await fetch('/api/admin/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowCreateForm(false)
        setFormData({
          subject: '',
          description: '',
          priority: 'MEDIUM',
          category: 'QUESTION'
        })
        fetchTickets()
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
    }
  }

  async function handleReply(ticketId: string) {
    if (!replyMessage.trim()) return

    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyMessage
        })
      })

      if (response.ok) {
        setReplyMessage('')
        // Recharger le ticket
        const ticketResponse = await fetch(`/api/admin/support/tickets/${ticketId}`)
        if (ticketResponse.ok) {
          const updatedTicket = await ticketResponse.json()
          setSelectedTicket(updatedTicket)
        }
        fetchTickets()
      }
    } catch (error) {
      console.error('Error sending reply:', error)
    }
  }

  async function viewTicketDetails(ticketId: string) {
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`)
      if (response.ok) {
        const ticket = await response.json()
        setSelectedTicket(ticket)
      }
    } catch (error) {
      console.error('Error fetching ticket:', error)
    }
  }

  const getStatusBadge = (status: SupportTicket['status']) => {
    const styles = {
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      WAITING_CUSTOMER: 'bg-purple-100 text-purple-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800'
    }
    const labels = {
      OPEN: 'Ouvert',
      IN_PROGRESS: 'En cours',
      WAITING_CUSTOMER: 'En attente',
      RESOLVED: 'Résolu',
      CLOSED: 'Fermé'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800'
    }
    return colors[priority]
  }

  const getCategoryLabel = (category: SupportTicket['category']) => {
    const labels = {
      TECHNICAL: 'Technique',
      BILLING: 'Facturation',
      FEATURE_REQUEST: 'Nouvelle fonctionnalité',
      QUESTION: 'Question',
      BUG: 'Bug',
      OTHER: 'Autre'
    }
    return labels[category]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💬 Support</h1>
          <p className="text-gray-600">Contactez l'équipe LAIA Connect</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau ticket
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8 text-purple-600" />
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <p className="text-3xl font-bold text-purple-600">{tickets.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <p className="text-sm text-gray-600">En cours</p>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {tickets.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8 text-purple-600" />
            <p className="text-sm text-gray-600">En attente</p>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {tickets.filter(t => t.status === 'WAITING_CUSTOMER').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <p className="text-sm text-gray-600">Résolus</p>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {tickets.filter(t => t.status === 'RESOLVED').length}
          </p>
        </div>
      </div>

      {/* Liste des tickets */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Mes tickets de support</h2>
        </div>

        {tickets.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg mb-2">Aucun ticket de support</p>
            <p className="text-sm">Créez un ticket pour contacter l'équipe LAIA Connect</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priorité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ticket.ticketNumber}</div>
                        <div className="text-sm text-gray-500">{ticket.subject}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {getCategoryLabel(ticket.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewTicketDetails(ticket.id)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de création */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Créer un ticket de support</h2>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  required
                  placeholder="Décrivez brièvement votre demande"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                >
                  <option value="QUESTION">Question</option>
                  <option value="TECHNICAL">Problème technique</option>
                  <option value="BILLING">Facturation</option>
                  <option value="FEATURE_REQUEST">Demande de fonctionnalité</option>
                  <option value="BUG">Signaler un bug</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                >
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Haute</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  required
                  placeholder="Décrivez votre demande en détail..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
                >
                  Créer le ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal détail ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedTicket.ticketNumber}</h2>
                <p className="text-gray-600">{selectedTicket.subject}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Info ticket */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Catégorie</label>
                <p className="text-gray-900">{getCategoryLabel(selectedTicket.category)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Priorité</label>
                <div className="mt-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Statut</label>
                <div className="mt-1">
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date de création</label>
                <p className="text-gray-900">
                  {new Date(selectedTicket.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
            </div>

            {/* Messages */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Conversation</h3>
              <div className="space-y-4 mb-4">
                {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                  selectedTicket.messages
                    .filter(msg => !msg.isInternal)
                    .map((message) => (
                      <div
                        key={message.id}
                        className="p-4 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{message.author.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucun message</p>
                )}
              </div>

              {/* Formulaire de réponse */}
              {selectedTicket.status !== 'CLOSED' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter une réponse</label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    placeholder="Votre message..."
                  />
                  <button
                    onClick={() => handleReply(selectedTicket.id)}
                    disabled={!replyMessage.trim()}
                    className="mt-2 px-6 py-2 bg-purple-600 rounded-lg font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Envoyer
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setSelectedTicket(null)}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
