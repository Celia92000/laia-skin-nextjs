"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ImpersonationBanner() {
  const router = useRouter()
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedUser, setImpersonatedUser] = useState<any>(null)

  useEffect(() => {
    checkImpersonation()
  }, [])

  async function checkImpersonation() {
    try {
      const response = await fetch('/api/super-admin/impersonate/status')
      if (response.ok) {
        const data = await response.json()
        setIsImpersonating(data.isImpersonating)
        setImpersonatedUser(data.user)
      }
    } catch (error) {
      console.error('Error checking impersonation:', error)
    }
  }

  async function exitImpersonation() {
    try {
      const response = await fetch('/api/super-admin/impersonate', {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = data.redirect
      }
    } catch (error) {
      console.error('Error exiting impersonation:', error)
    }
  }

  if (!isImpersonating) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">👁️</span>
            <div>
              <div className="font-semibold">Mode Impersonnation Actif</div>
              <div className="text-sm opacity-90">
                Connecté en tant que : <span className="font-medium">{impersonatedUser?.name}</span> ({impersonatedUser?.email})
                {impersonatedUser?.organization && (
                  <span> - {impersonatedUser.organization.name}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={exitImpersonation}
            className="px-6 py-2 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition font-semibold shadow-md"
          >
            ⬅️ Retour Super Admin
          </button>
        </div>
      </div>
    </div>
  )
}
