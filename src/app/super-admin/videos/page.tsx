"use client"

import { useState, useEffect } from 'react'
import { Save, Video, HelpCircle } from 'lucide-react'

export default function VideosPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [videos, setVideos] = useState({
    welcomeTutorial: '', // Vidéo tuto première connexion
    demoVideo: '', // Vidéo démo LAIA Connect
  })

  useEffect(() => {
    // Charger les URLs depuis l'API
    fetch('/api/platform/videos')
      .then(res => res.json())
      .then(data => setVideos({
        welcomeTutorial: data.welcomeTutorial || '',
        demoVideo: data.demoVideo || ''
      }))
      .catch(err => console.error('Erreur chargement vidéos:', err))
  }, [])

  const handleSave = async () => {
    setLoading(true)
    setSuccess(false)

    try {
      // Sauvegarder via l'API
      const response = await fetch('/api/platform/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videos)
      })

      if (!response.ok) throw new Error('Erreur sauvegarde')

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestion des Vidéos
        </h1>
        <p className="text-gray-600">
          Configurez les URL des vidéos affichées sur votre plateforme
        </p>
      </div>

      <div className="space-y-6">
        {/* Vidéo de bienvenue */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Video className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Vidéo Tutoriel - Première Connexion
              </h2>
              <p className="text-sm text-gray-600">
                Cette vidéo s'affiche à la première connexion des nouveaux instituts pour les aider à configurer leur site
              </p>
            </div>
          </div>

          <input
            type="url"
            value={videos.welcomeTutorial}
            onChange={(e) => setVideos({ ...videos, welcomeTutorial: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          {videos.welcomeTutorial && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Aperçu :</p>
              <p className="text-sm text-gray-600 break-all">{videos.welcomeTutorial}</p>
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Formats supportés :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>YouTube : https://www.youtube.com/watch?v=XXXXX</li>
                  <li>Vimeo : https://vimeo.com/XXXXX</li>
                  <li>Fichier direct : https://mon-cdn.com/video.mp4</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Vidéo démo LAIA Connect */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Video className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Vidéo Démo - LAIA Connect
              </h2>
              <p className="text-sm text-gray-600">
                Cette vidéo s'affiche sur la landing page laiaconnect.fr pour montrer le produit aux visiteurs
              </p>
            </div>
          </div>

          <input
            type="url"
            value={videos.demoVideo}
            onChange={(e) => setVideos({ ...videos, demoVideo: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />

          {videos.demoVideo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Aperçu :</p>
              <p className="text-sm text-gray-600 break-all">{videos.demoVideo}</p>
            </div>
          )}
        </div>

        {/* Bouton Sauvegarder */}
        <div className="flex items-center justify-between pt-6 border-t">
          {success && (
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Sauvegardé !</span>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="ml-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
        <h3 className="font-semibold text-gray-900 mb-3">
          📹 Comment créer vos vidéos ?
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>1. Enregistrez votre écran :</strong> Utilisez OBS Studio (gratuit) ou Xbox Game Bar (Windows)
          </p>
          <p>
            <strong>2. Uploadez sur YouTube :</strong> Créez une vidéo non-listée pour plus de confidentialité
          </p>
          <p>
            <strong>3. Copiez l'URL :</strong> Collez-la dans les champs ci-dessus
          </p>
          <p className="pt-2 text-purple-700">
            💡 <strong>Astuce :</strong> Des vidéos courtes (3-5 min) ont un meilleur taux de visionnage
          </p>
        </div>
      </div>
    </div>
  )
}