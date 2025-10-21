'use client'

import Link from 'next/link'
import DemoCalendar from '@/components/super-admin/DemoCalendar'

export default function DemosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="text-white" style={{ background: "linear-gradient(to right, #d4b5a0, #c9a589)" }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/super-admin" className="text-white/80 hover:text-white mb-2 inline-block">
            ← Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">📅 Calendrier des démos</h1>
          <p className="text-white/90">Gérez vos disponibilités et visualisez les réservations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <DemoCalendar />
      </div>
    </div>
  )
}
