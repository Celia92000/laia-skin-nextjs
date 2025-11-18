'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Send, Heart } from 'lucide-react'

export default function RateLaiaPage() {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [improvements, setImprovements] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  async function fetchUserData() {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
        setName(data.name || '')
        setRole(data.organization?.name || '')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (rating === 0) {
      alert('Veuillez sélectionner une note')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/rate-laia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          comment,
          improvements,
          clientName: name,
          clientRole: role
        })
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          router.push('/admin')
        }, 3000)
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de l\'envoi de votre avis')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-green-600 fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Merci pour votre avis !</h2>
          <p className="text-gray-600 mb-4">
            Votre retour est précieux pour améliorer LAIA Connect.
          </p>
          <p className="text-sm text-gray-500">
            Redirection vers le dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">Noter LAIA Connect</h1>
            <p className="text-purple-100">
              Votre avis nous aide à améliorer notre plateforme
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Rating */}
            <div className="text-center">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Comment évaluez-vous LAIA Connect ?
              </label>
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-12 h-12 ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                {rating === 0 && 'Cliquez sur les étoiles pour noter'}
                {rating === 1 && 'Très insatisfait'}
                {rating === 2 && 'Insatisfait'}
                {rating === 3 && 'Correct'}
                {rating === 4 && 'Satisfait'}
                {rating === 5 && 'Très satisfait'}
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre nom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Marie Dupont"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institut / Fonction (optionnel)
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Gérante, Beauté Éternelle Paris"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qu'aimez-vous dans LAIA Connect ?
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                placeholder="Partagez votre expérience avec LAIA Connect..."
                required
              />
            </div>

            {/* Improvements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment pouvons-nous améliorer LAIA Connect ? (optionnel)
              </label>
              <textarea
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                placeholder="Vos suggestions d'amélioration, fonctionnalités souhaitées..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Vos idées nous aident à améliorer continuellement la plateforme
              </p>
            </div>

            {/* Privacy notice */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-900">
                <strong>ℹ️ Confidentialité :</strong> Votre avis sera examiné par notre équipe.
                Seuls les avis positifs (4-5 étoiles) pourront être publiés pour notre communication
                après votre approbation.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Envoyer mon avis
                </>
              )}
            </button>

            {/* Back link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                ← Retour au dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
