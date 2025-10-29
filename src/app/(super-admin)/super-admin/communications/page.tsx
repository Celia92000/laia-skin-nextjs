"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Mail, MessageCircle, Send } from 'lucide-react'

// Import dynamique des composants
const SuperAdminEmailInterface = dynamic(() => import("@/components/SuperAdminEmailInterface"), { ssr: false })
const SuperAdminWhatsAppHub = dynamic(() => import("@/components/SuperAdminWhatsAppHub"), { ssr: false })

export default function CommunicationsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'emailing' | 'whatsapp'>('emailing')

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      <div className="mb-8">
        <Link href="/super-admin" className="text-gray-600 hover:text-purple-600 mb-4 inline-block">
          ← Retour au dashboard
        </Link>
        <div>
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#7c3aed' }}>
            Communications LAIA Connect
          </h2>
          <p className="text-gray-700">
            Gestion globale des emails et WhatsApp pour toutes les organisations
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('emailing')}
          className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'emailing'
              ? 'bg-white shadow-md border-2'
              : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-sm'
          }`}
          style={activeTab === 'emailing' ? { color: '#7c3aed', borderColor: '#7c3aed' } : {}}
        >
          <Mail className="w-5 h-5" />
          Emailing
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'whatsapp'
              ? 'bg-white shadow-md border-2'
              : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-sm'
          }`}
          style={activeTab === 'whatsapp' ? { color: '#7c3aed', borderColor: '#7c3aed' } : {}}
        >
          <MessageCircle className="w-5 h-5" />
          WhatsApp
        </button>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'emailing' && <SuperAdminEmailInterface />}
        {activeTab === 'whatsapp' && <SuperAdminWhatsAppHub />}
      </div>
    </div>
  )
}
