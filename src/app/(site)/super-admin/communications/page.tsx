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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/super-admin" className="text-purple-200 hover:text-white mb-2 inline-block">
                ← Retour au dashboard
              </Link>
              <h1 className="text-3xl font-bold mb-2">
                📧 Communications LAIA Beauty
              </h1>
              <p className="text-purple-100">
                Gestion globale des emails et WhatsApp pour toutes les organisations
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setActiveTab('emailing')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'emailing'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Mail className="w-5 h-5" />
              Emailing
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'whatsapp'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'emailing' && <SuperAdminEmailInterface />}
        {activeTab === 'whatsapp' && <SuperAdminWhatsAppHub />}
      </div>
    </div>
  )
}
