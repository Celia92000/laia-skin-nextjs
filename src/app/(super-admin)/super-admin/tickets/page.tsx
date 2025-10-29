'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'QUESTION' | 'BUG' | 'OTHER'
  organization: {
    id: string
    name: string
  }
  createdBy: {
    name: string
    email: string
  }
  assignedTo?: {
    name: string
  }
  createdAt: Date
  updatedAt: Date
  messages?: TicketMessage[]
}

interface TicketMessage {
  id: string
  message: string
  author: {
    name: string
  }
  isInternal: boolean
  createdAt: Date
}

export default function TicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [filterStatus, setFilterStatus] = useState<'ALL' | SupportTicket['status']>('ALL')
  const [filterPriority, setFilterPriority] = useState<'ALL' | SupportTicket['priority']>('ALL')
  const [replyMessage, setReplyMessage] = useState('')

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    try {
      const response = await fetch('/api/super-admin/tickets')
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin/tickets')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateStatus(id: string, status: SupportTicket['status']) {
    try {
      const response = await fetch(`/api/super-admin/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (response.ok) {
        fetchTickets()
        if (selectedTicket?.id === id) {
          setSelectedTicket({ ...selectedTicket, status })
        }
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
    }
  }

  async function handleReply(ticketId: string) {
    if (!replyMessage.trim()) return

    try {
      const response = await fetch(`/api/super-admin/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyMessage,
          isInternal: false
        })
      })

      if (response.ok) {
        setReplyMessage('')
        // Recharger le ticket avec ses messages
        const ticketResponse = await fetch(`/api/super-admin/tickets/${ticketId}`)
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

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800'
    }
    return colors[priority]
  }

  const getStatusBadge = (status: SupportTicket['status']) => {
    const styles = {
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      WAITING_CUSTOMER: 'bg-purple-100 text-beige-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800'
    }
    const labels = {
      OPEN: 'Ouvert',
      IN_PROGRESS: 'En cours',
      WAITING_CUSTOMER: 'En attente client',
      RESOLVED: 'Résolu',
      CLOSED: 'Fermé'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getCategoryLabel = (category: SupportTicket['category']) => {
    const labels = {
      TECHNICAL: 'Technique',
      BILLING: 'Facturation',
      FEATURE_REQUEST: 'Demande de fonctionnalit�',
      QUESTION: 'Question',
      BUG: 'Bug',
      OTHER: 'Autre'
    }
    return labels[category]
  }

  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus !== 'ALL' && ticket.status !== filterStatus) return false
    if (filterPriority !== 'ALL' && ticket.priority !== filterPriority) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#7c3aed" }}></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">=� Support Clients</h1>
        <p className="text-gray-600">G�rez les tickets de support des organisations</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="OPEN">Ouverts</option>
          <option value="IN_PROGRESS">En cours</option>
          <option value="WAITING_CUSTOMER">En attente client</option>
          <option value="RESOLVED">R�solus</option>
          <option value="CLOSED">Ferm�s</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as typeof filterPriority)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
        >
          <option value="ALL">Toutes les priorit�s</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">Haute</option>
          <option value="MEDIUM">Moyenne</option>
          <option value="LOW">Basse</option>
        </select>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-3xl font-bold" style={{ color: "#7c3aed" }}>{tickets.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Ouverts</p>
          <p className="text-3xl font-bold text-blue-600">
            {tickets.filter(t => t.status === 'OPEN').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">En cours</p>
          <p className="text-3xl font-bold text-yellow-600">
            {tickets.filter(t => t.status === 'IN_PROGRESS').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Urgents</p>
          <p className="text-3xl font-bold text-red-600">
            {tickets.filter(t => t.priority === 'URGENT').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">R�solus</p>
          <p className="text-3xl font-bold text-green-600">
            {tickets.filter(t => t.status === 'RESOLVED').length}
          </p>
        </div>
      </div>

      {/* Liste des tickets */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Tickets de support</h2>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg mb-2">Aucun ticket trouv�</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organisation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cat�gorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priorit�</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ticket.ticketNumber}</div>
                        <div className="text-sm text-gray-500">{ticket.subject}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ticket.organization.name}
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
                        onClick={() => setSelectedTicket(ticket)}
                        className="hover:text-beige-900"
                        style={{ color: "#7c3aed" }}
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

      {/* Modal de d�tail */}
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
                
              </button>
            </div>

            {/* Info ticket */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Organisation</label>
                <p className="text-gray-900">{selectedTicket.organization.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Cr�� par</label>
                <p className="text-gray-900">{selectedTicket.createdBy.name}</p>
                <p className="text-sm text-gray-500">{selectedTicket.createdBy.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Cat�gorie</label>
                <p className="text-gray-900">{getCategoryLabel(selectedTicket.category)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Priorit�</label>
                <div className="mt-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Changer le statut */}
            <div className="mb-6 pb-6 border-b">
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut du ticket</label>
              <select
                value={selectedTicket.status}
                onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value as SupportTicket['status'])}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              >
                <option value="OPEN">Ouvert</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="WAITING_CUSTOMER">En attente client</option>
                <option value="RESOLVED">R�solu</option>
                <option value="CLOSED">Ferm�</option>
              </select>
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
                  selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.isInternal
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{message.author.name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                      {message.isInternal && (
                        <span className="text-xs text-yellow-700 mt-2 inline-block">Note interne</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucun message</p>
                )}
              </div>

              {/* Formulaire de réponse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Répondre au client</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  placeholder="Votre réponse..."
                />
                <button
                  onClick={() => handleReply(selectedTicket.id)}
                  disabled={!replyMessage.trim()}
                  className="mt-2 px-6 py-2 rounded-lg font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#7c3aed" }}
                >
                  Envoyer la réponse
                </button>
              </div>
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
