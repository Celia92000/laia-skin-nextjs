'use client'

import Link from 'next/link'
import DemoCalendar from '@/components/super-admin/DemoCalendar'

export default function DemosPage() {
  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      <div className="mb-8">
        <Link href="/super-admin" className="text-gray-600 hover:text-purple-600 mb-4 inline-block">
          ← Retour au dashboard
        </Link>
        <div>
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#7c3aed' }}>
            Calendrier des démos
          </h2>
          <p className="text-gray-700">Gérez vos disponibilités et visualisez les réservations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <DemoCalendar />
      </div>
    </div>
  )
}
