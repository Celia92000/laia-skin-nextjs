'use client'

import { useEffect, useState } from 'react'
import { Mail, MessageCircle, Phone, FileText, Download, Eye } from 'lucide-react'

interface Attachment {
  name: string
  url?: string
  size?: number
  type?: string
}

interface Communication {
  id: string
  type: 'email' | 'sms' | 'whatsapp'
  direction: 'outbound' | 'inbound'
  subject?: string
  content: string
  attachments?: Attachment[]
  metadata?: {
    emailType?: string
    hasCredentials?: boolean
    generatedPassword?: string
    [key: string]: any
  }
  status: 'sent' | 'delivered' | 'failed' | 'read'
  sentBy?: string
  sentAt: string
  createdAt: string
}

interface CommunicationHistoryProps {
  organizationId: string
  ownerEmail: string
}

export default function CommunicationHistory({ organizationId, ownerEmail }: CommunicationHistoryProps) {
  const [communications, setCommunications] = useState<Communication[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'email' | 'sms' | 'whatsapp'>('all')

  useEffect(() => {
    fetchCommunications()
  }, [organizationId, ownerEmail])

  async function fetchCommunications() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ clientEmail: ownerEmail })
      const res = await fetch(`/api/crm/communications?${params}`)
      if (res.ok) {
        const data = await res.json()
        setCommunications(data.history || [])
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredComms = filter === 'all'
    ? communications
    : communications.filter(c => c.type === filter)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail size={18} className="text-blue-600" />
      case 'sms':
        return <Phone size={18} className="text-green-600" />
      case 'whatsapp':
        return <MessageCircle size={18} className="text-green-500" />
      default:
        return <Mail size={18} />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'email':
        return 'Email'
      case 'sms':
        return 'SMS'
      case 'whatsapp':
        return 'WhatsApp'
      default:
        return type
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      read: 'bg-purple-100 text-purple-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle size={20} />
          Historique des communications ({communications.length})
        </h2>

        {/* Filtres */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-lg transition ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tous ({communications.length})
          </button>
          <button
            onClick={() => setFilter('email')}
            className={`px-3 py-1 text-sm rounded-lg transition ${
              filter === 'email'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📧 Emails ({communications.filter(c => c.type === 'email').length})
          </button>
          <button
            onClick={() => setFilter('sms')}
            className={`px-3 py-1 text-sm rounded-lg transition ${
              filter === 'sms'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📱 SMS ({communications.filter(c => c.type === 'sms').length})
          </button>
          <button
            onClick={() => setFilter('whatsapp')}
            className={`px-3 py-1 text-sm rounded-lg transition ${
              filter === 'whatsapp'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            💬 WhatsApp ({communications.filter(c => c.type === 'whatsapp').length})
          </button>
        </div>
      </div>

      {filteredComms.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
          <p>Aucune communication enregistrée</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComms.map((comm) => (
            <div key={comm.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getTypeIcon(comm.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {getTypeLabel(comm.type)}
                      </span>
                      {getStatusBadge(comm.status)}
                      {comm.metadata?.emailType === 'welcome' && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          🎉 Bienvenue
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(comm.sentAt).toLocaleString('fr-FR', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sujet (email uniquement) */}
              {comm.subject && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700">{comm.subject}</p>
                </div>
              )}

              {/* Contenu */}
              <div className="mb-3">
                <p className="text-sm text-gray-600 whitespace-pre-line">{comm.content}</p>
              </div>

              {/* Badge email de bienvenue avec identifiants */}
              {comm.metadata?.hasCredentials && (
                <div className="mb-3 flex gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    🔑 Contient les identifiants de connexion
                  </span>
                  {comm.metadata?.needsDataMigration && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      📦 Migration demandée
                      {comm.metadata?.currentSoftware && ` depuis ${comm.metadata.currentSoftware}`}
                    </span>
                  )}
                </div>
              )}

              {/* Détails migration si demandée */}
              {comm.metadata?.needsDataMigration && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="text-lg">📦</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900">Migration de données demandée</p>
                      {comm.metadata?.currentSoftware && (
                        <p className="text-sm text-blue-700 mt-1">
                          Logiciel actuel : <span className="font-medium">{comm.metadata.currentSoftware}</span>
                        </p>
                      )}
                      <p className="text-xs text-blue-600 mt-2">
                        💰 Prestation facturée : 300€ (paiement unique)<br/>
                        📧 Le client doit envoyer son fichier de données à : <a href="mailto:contact@laiaconnect.fr" className="underline font-medium">contact@laiaconnect.fr</a>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pièces jointes */}
              {comm.attachments && comm.attachments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    📎 Pièces jointes ({comm.attachments.length})
                  </p>
                  <div className="space-y-2">
                    {comm.attachments.map((attachment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                            {attachment.size && (
                              <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                            )}
                          </div>
                        </div>
                        {attachment.url ? (
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                          >
                            <Eye size={14} />
                            Voir
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">Fichier local</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata supplémentaires */}
              {comm.sentBy && (
                <div className="mt-2 text-xs text-gray-500">
                  Envoyé par : {comm.sentBy}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
