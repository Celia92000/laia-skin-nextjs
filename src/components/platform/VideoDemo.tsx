"use client"

import { useState, useEffect } from 'react'
import VideoPlayer from './VideoPlayer'

export default function VideoDemo() {
  const [videoUrl, setVideoUrl] = useState('')

  useEffect(() => {
    // Charger l'URL de la vidéo démo depuis l'API
    fetch('/api/platform/videos')
      .then(res => res.json())
      .then(data => setVideoUrl(data.demoVideo))
      .catch(err => console.error('Erreur chargement vidéo:', err))
  }, [])

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Titre section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Voyez LAIA Connect en action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez comment créer votre site professionnel et gérer votre institut
            en quelques minutes seulement. Aucune compétence technique requise.
          </p>
        </div>

        {/* Vidéo */}
        <div className="max-w-4xl mx-auto">
          <VideoPlayer
            videoUrl={videoUrl}
            title="Créez votre site d'institut en 15 minutes"
            description="Sans compétences techniques, avec votre propre design"
          />
        </div>

        {/* Stats sous la vidéo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">15 min</div>
            <div className="text-gray-600">Pour créer votre site</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">+40%</div>
            <div className="text-gray-600">De réservations en moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
            <div className="text-gray-600">Instituts nous font confiance</div>
          </div>
        </div>

        {/* CTA sous les stats */}
        <div className="text-center mt-12">
          <a
            href="/onboarding?skip=true&plan=SOLO"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-xl transition-all hover:scale-105"
          >
            Essayer gratuitement maintenant
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <p className="mt-4 text-sm text-gray-500">
            14 jours d'essai gratuit • Sans carte bancaire
          </p>
        </div>
      </div>
    </section>
  )
}