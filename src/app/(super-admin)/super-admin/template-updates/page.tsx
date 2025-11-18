'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TemplateUpdatesPage() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function handleSync() {
    if (!confirm('Synchroniser le template LAIA Skin Institut vers toutes les organisations ?')) {
      return
    }

    setSyncing(true)
    setResult(null)

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1]

      const response = await fetch('/api/super-admin/sync-template', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        alert(data.message || 'Synchronisation reussie !')
      } else {
        alert(`Erreur : ${data.error}`)
      }
    } catch (error) {
      console.error('Erreur sync:', error)
      alert('Erreur lors de la synchronisation')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      <div className="mb-8">
        <Link href="/super-admin" className="text-gray-600 hover:text-purple-600 mb-4 inline-block">
          Retour au dashboard
        </Link>
        <div>
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#7c3aed' }}>
            Synchronisation Template
          </h2>
          <p className="text-gray-700">
            Synchroniser le contenu de LAIA Skin Institut vers toutes les organisations
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">A propos de la synchronisation</h3>
          <div className="space-y-3 text-gray-700">
            <p><strong>Contenu synchronise</strong> : Services, Produits, Articles de blog, Formations, Configuration</p>
            <p><strong>Elements personnalises</strong> : Les contenus marques comme personnalises ne seront jamais modifies</p>
            <p><strong>Nouveaux elements</strong> : Seront crees automatiquement depuis le template</p>
            <p><strong>Elements existants</strong> : Seront mis a jour uniquement s ils ne sont pas personnalises</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`w-full py-4 rounded-lg font-semibold text-white text-lg transition-all ${
              syncing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'hover:shadow-xl'
            }`}
            style={syncing ? {} : { background: 'linear-gradient(to right, #7c3aed, #6b46c1)' }}
          >
            {syncing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">...</span>
                Synchronisation en cours...
              </span>
            ) : (
              'Lancer la synchronisation'
            )}
          </button>

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                {result.message}
              </h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>Organisations synchronisees : {result.synced} / {result.total}</p>
                {result.report && (
                  <>
                    <p>Services : {result.report.services.created} crees, {result.report.services.updated} mis a jour, {result.report.services.skipped} ignores</p>
                    <p>Produits : {result.report.products.created} crees, {result.report.products.updated} mis a jour, {result.report.products.skipped} ignores</p>
                    <p>Articles : {result.report.blogPosts.created} crees, {result.report.blogPosts.updated} mis a jour, {result.report.blogPosts.skipped} ignores</p>
                    <p>Formations : {result.report.formations.created} creees, {result.report.formations.updated} mises a jour, {result.report.formations.skipped} ignorees</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
