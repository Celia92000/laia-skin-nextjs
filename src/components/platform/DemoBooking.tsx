'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Video } from 'lucide-react'

interface Slot {
  id: string
  date: string
  duration: number
  isBooked?: boolean
}

export default function DemoBooking() {
  const [step, setStep] = useState<'date' | 'time' | 'form' | 'success'>('date')
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [meetingType, setMeetingType] = useState<'ONLINE' | 'PHYSICAL'>('ONLINE')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    institutName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    city: '',
    location: '',
    message: ''
  })

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const response = await fetch('/api/platform/demo-booking')
      if (response.ok) {
        const data = await response.json()
        setSlots(data.slots)
      }
    } catch (err) {
      console.error('Erreur chargement créneaux:', err)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

    return { daysInMonth, startingDayOfWeek }
  }

  const getSlotsForDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return slots.filter(slot => {
      const slotDate = new Date(slot.date)
      return slotDate.toDateString() === date.toDateString()
    })
  }

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot)
    setStep('form')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/platform/demo-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slotId: selectedSlot?.id,
          type: meetingType
        })
      })

      if (response.ok) {
        setStep('success')
      } else {
        const data = await response.json()
        setError(data.error || 'Une erreur est survenue')

        // Si le créneau est déjà réservé, revenir à la sélection de l'heure
        if (response.status === 409) {
          setTimeout(() => {
            setStep('time')
            setSelectedSlot(null)
          }, 3000) // Attendre 3 secondes pour que l'utilisateur lise le message
        }
      }
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Étape 1: Choisir la DATE dans le calendrier
  if (step === 'date') {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
    const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

    return (
      <div className="relative">
        {/* Vidéo au-dessus du modal */}
        <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-white shadow-2xl bg-white">
            <video
              src="/team/celia-calendar.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col pt-20">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-br from-purple-600 via-purple-500 to-violet-700">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">
              Réserver une démo avec Celia
            </h2>
            <p className="text-sm text-white/90 mt-0.5">
              Étape 1/3 - Sélectionnez une date
            </p>
          </div>
        </div>

        {/* Navigation mois */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 capitalize">{monthName}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-4 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-50 rounded-xl transition"
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Calendrier */}
        <div className="flex-1 overflow-auto p-6">
          {/* En-tête jours */}
          <div className="grid grid-cols-7 gap-3 mb-3">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="text-center text-sm font-bold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grille jours */}
          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const daySlots = getSlotsForDate(day)
              const availableCount = daySlots.filter(s => !s.isBooked).length
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
              const isToday = date.toDateString() === new Date().toDateString()

              return (
                <button
                  key={day}
                  disabled={isPast || availableCount === 0}
                  onClick={() => {
                    setSelectedDate(date)
                    setStep('time')
                  }}
                  className={`
                    relative aspect-square rounded-2xl p-3 transition-all font-semibold
                    ${isPast ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : ''}
                    ${isToday && !isPast && availableCount > 0 ? 'ring-4 ring-purple-500 ring-offset-2' : ''}
                    ${availableCount > 0 && !isPast ? 'bg-gradient-to-br from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700 cursor-pointer hover:shadow-xl hover:scale-105 transform' : ''}
                    ${availableCount === 0 && !isPast ? 'bg-white border-2 border-gray-200 text-gray-400 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex flex-col items-center justify-center h-full gap-1">
                    <span className="text-lg">{day}</span>
                    {availableCount > 0 && !isPast && (
                      <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full">
                        {availableCount}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Légende modernisée */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center font-bold shadow-md">
              3
            </div>
            <span className="font-medium">Nombre de créneaux disponibles</span>
          </div>
        </div>
      </div>
      </div>
    )
  }

  // Étape 2: Choisir l'HEURE pour la date sélectionnée
  if (step === 'time' && selectedDate) {
    const daySlots = slots.filter(slot => {
      const slotDate = new Date(slot.date)
      return slotDate.toDateString() === selectedDate.toDateString() && !slot.isBooked
    })

    const dateFormatted = selectedDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    return (
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header avec vidéo */}
        <div className="relative">
          <video
            src="/team/celia-calendar.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-48 object-cover"
            style={{ objectPosition: 'center 20%', transform: 'scale(0.8)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-600/50 to-transparent"></div>
          <button
            onClick={() => setStep('date')}
            className="absolute top-4 left-4 text-white/90 hover:text-white flex items-center gap-2 text-sm font-semibold hover:translate-x-1 transition-all bg-black/20 px-3 py-2 rounded-lg backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Changer de date
          </button>
          <div className="absolute bottom-0 left-0 right-0 px-8 py-6">
            <h2 className="text-2xl font-bold text-white capitalize">
              {dateFormatted}
            </h2>
            <p className="text-sm text-white/90 mt-0.5">
              Étape 2/3 - {daySlots.length} créneau{daySlots.length > 1 ? 'x' : ''} disponible{daySlots.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Liste des créneaux améliorée */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-lg mx-auto space-y-3">
            {daySlots.map((slot, index) => (
              <button
                key={slot.id}
                onClick={() => {
                  setSelectedSlot(slot)
                  setStep('form')
                }}
                style={{ animationDelay: `${index * 50}ms` }}
                className="w-full flex items-center justify-between p-5 bg-white border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:shadow-xl transition-all group animate-fade-in-up"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {new Date(slot.date).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="text-sm text-gray-500 font-medium mt-1">
                      Durée : {slot.duration} min
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Sélectionner
                  </span>
                  <svg className="w-6 h-6 text-purple-600 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Étape 2: Formulaire
  if (step === 'form') {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-purple-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            setStep('date')
            setSelectedSlot(null)
          }}
          className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2"
        >
          ← Changer de créneau
        </button>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-purple-900">
            <Calendar className="w-6 h-6" />
            <div>
              <div className="font-semibold">
                {selectedSlot && formatDate(selectedSlot.date)}
              </div>
              <div className="text-sm text-purple-700">
                Durée : {selectedSlot?.duration} minutes
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Vos informations
        </h3>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            ❌ {error}
          </div>
        )}

        {/* Type de RDV */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Type de rendez-vous</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setMeetingType('ONLINE')}
              className={`p-4 rounded-lg border-2 transition ${
                meetingType === 'ONLINE'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400'
              }`}
            >
              <Video className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold">Visioconférence</div>
              <div className="text-xs text-gray-600 mt-1">Jitsi Meet</div>
            </button>
            <button
              type="button"
              onClick={() => setMeetingType('PHYSICAL')}
              className={`p-4 rounded-lg border-2 transition ${
                meetingType === 'PHYSICAL'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400'
              }`}
            >
              <MapPin className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold">Sur place</div>
              <div className="text-xs text-gray-600 mt-1">À votre institut</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom de votre institut <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.institutName}
                onChange={(e) => setFormData({ ...formData, institutName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Institut Belle Vie"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Votre nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Sophie Martin"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="contact@institut.fr"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="06 12 34 56 78"
              />
            </div>

            {meetingType === 'PHYSICAL' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={meetingType === 'PHYSICAL'}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Paris"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse complète <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={meetingType === 'PHYSICAL'}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="123 Rue de la Beauté, 75001 Paris"
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message (optionnel)
              </label>
              <textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Questions ou besoins spécifiques..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Confirmation en cours...' : '✅ Confirmer ma démo'}
          </button>
        </form>
      </div>
    )
  }

  // Étape 3: Succès
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-purple-100 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h3 className="text-3xl font-bold text-gray-900 mb-4">
        {meetingType === 'ONLINE' ? 'Démo confirmée !' : 'Demande enregistrée !'}
      </h3>
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <p className="text-lg text-green-900 font-semibold mb-2">
          {selectedSlot && formatDate(selectedSlot.date)}
        </p>
        <p className="text-green-700">
          Durée : {selectedSlot?.duration} minutes
        </p>
      </div>
      {meetingType === 'ONLINE' ? (
        <p className="text-gray-600 mb-6">
          Vous allez recevoir un email de confirmation avec le lien de la visioconférence Jitsi Meet.
          <span className="block mt-2 text-sm text-gray-500">
            Aucune inscription requise, cliquez simplement sur le lien à l'heure du rendez-vous.
          </span>
        </p>
      ) : (
        <p className="text-gray-600 mb-6">
          Nous vous contacterons rapidement pour organiser votre rendez-vous physique.
        </p>
      )}
      <p className="text-sm text-gray-500">
        📧 Email envoyé à : <span className="font-semibold">{formData.contactEmail}</span>
      </p>
    </div>
  )
}
