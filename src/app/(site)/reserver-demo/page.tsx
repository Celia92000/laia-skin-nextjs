'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Video, ArrowRight, Check } from 'lucide-react'

interface DemoSlot {
  id: string
  date: string
  duration: number
  isBooked: boolean
}

export default function ReserverDemoPage() {
  const [slots, setSlots] = useState<DemoSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<DemoSlot | null>(null)
  const [step, setStep] = useState<'calendar' | 'time' | 'form' | 'success'>('calendar')
  const [meetingType, setMeetingType] = useState<'ONLINE' | 'PHYSICAL'>('ONLINE')
  const [formData, setFormData] = useState({
    institutName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    message: '',
    city: '',
    location: ''
  })
  const [submitting, setSubmitting] = useState(false)

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
    } catch (error) {
      console.error('Erreur chargement créneaux:', error)
    } finally {
      setLoading(false)
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

  const getAvailableSlotsForSelectedDate = () => {
    if (!selectedDate) return []
    return slots.filter(slot => {
      const slotDate = new Date(slot.date)
      return slotDate.toDateString() === selectedDate.toDateString()
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlot) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/platform/demo-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          type: meetingType,
          ...formData
        })
      })

      if (response.ok) {
        setStep('success')
      } else {
        alert('Erreur lors de la réservation')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la réservation')
    } finally {
      setSubmitting(false)
    }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-purple-600 text-xl font-semibold">Chargement...</div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">✅ Réservation confirmée !</h1>
          {meetingType === 'ONLINE' ? (
            <p className="text-gray-600 mb-6">
              Vous recevrez un email avec le lien de visioconférence Jitsi Meet.
              Aucune inscription requise, cliquez simplement sur le lien à l'heure du rendez-vous.
            </p>
          ) : (
            <p className="text-gray-600 mb-6">
              Nous vous contacterons rapidement pour organiser votre rendez-vous physique.
            </p>
          )}
          <a
            href="/"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📅 Réserver une démo
          </h1>
          <p className="text-gray-600 text-lg">
            Découvrez notre solution en direct avec un expert
          </p>
        </div>

        {/* Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'calendar' ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'calendar' ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>1</div>
              <span className="font-semibold hidden md:inline">Date</span>
            </div>
            <ArrowRight className="text-gray-400" size={20} />
            <div className={`flex items-center gap-2 ${step === 'time' ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'time' ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>2</div>
              <span className="font-semibold hidden md:inline">Heure</span>
            </div>
            <ArrowRight className="text-gray-400" size={20} />
            <div className={`flex items-center gap-2 ${step === 'form' ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'form' ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>3</div>
              <span className="font-semibold hidden md:inline">Infos</span>
            </div>
          </div>
        </div>

        {/* Calendar Step */}
        {step === 'calendar' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 capitalize flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              {monthName}
            </h2>

            <div className="flex justify-center gap-2 mb-6">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition"
              >
                ← Mois précédent
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition"
              >
                Mois suivant →
              </button>
            </div>

            {/* Calendrier classique */}
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
              {/* En-tête des jours */}
              <div className="grid grid-cols-7 bg-gray-100 border-b-2 border-gray-300">
                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => (
                  <div key={day} className="text-center font-bold text-gray-700 py-3 border-r border-gray-300 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grille des jours */}
              <div className="grid grid-cols-7">
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[120px] bg-gray-50 border-r border-b border-gray-300" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const daySlots = getSlotsForDate(day)
                  const hasSlots = daySlots.length > 0
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
                  const isToday = date.toDateString() === new Date().toDateString()

                  return (
                    <div
                      key={day}
                      className={`min-h-[120px] border-r border-b border-gray-300 p-2 ${
                        isPast ? 'bg-gray-50' : isToday ? 'bg-blue-50' : 'bg-white'
                      } ${(startingDayOfWeek + day - 1) % 7 === 6 ? 'border-r-0' : ''}`}
                    >
                      <div className={`text-right font-bold mb-2 ${
                        isToday ? 'text-blue-600' : isPast ? 'text-gray-400' : 'text-gray-900'
                      }`}>
                        {day}
                      </div>

                      <div className="space-y-1">
                        {hasSlots && !isPast ? (
                          daySlots.slice(0, 3).map(slot => (
                            <button
                              key={slot.id}
                              disabled={slot.isBooked}
                              onClick={() => {
                                if (!slot.isBooked) {
                                  setSelectedDate(date)
                                  setSelectedSlot(slot)
                                  setStep('form')
                                }
                              }}
                              className={`w-full text-left px-2 py-1 border rounded text-xs font-semibold transition ${
                                slot.isBooked
                                  ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed line-through'
                                  : 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-900'
                              }`}
                            >
                              {new Date(slot.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              {slot.isBooked && <span className="ml-1 text-xs">(Réservé)</span>}
                            </button>
                          ))
                        ) : null}
                        {daySlots.length > 3 && (
                          <button
                            onClick={() => {
                              setSelectedDate(date)
                              setStep('time')
                            }}
                            className="w-full text-left px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700 font-semibold transition"
                          >
                            +{daySlots.length - 3} autres
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border border-gray-300 rounded"></div>
                <span>Aujourd'hui</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
                <span>Créneaux disponibles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-50 border border-gray-300 rounded"></div>
                <span>Passé</span>
              </div>
            </div>
          </div>
        )}

        {/* Time Step */}
        {step === 'time' && selectedDate && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Choisissez votre horaire - {selectedDate.toLocaleDateString('fr-FR')}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {getAvailableSlotsForSelectedDate().map(slot => (
                <button
                  key={slot.id}
                  disabled={slot.isBooked}
                  onClick={() => {
                    if (!slot.isBooked) {
                      setSelectedSlot(slot)
                    }
                  }}
                  className={`p-4 rounded-lg border-2 transition ${
                    slot.isBooked
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                      : selectedSlot?.id === slot.id
                      ? 'border-purple-600 bg-purple-100'
                      : 'border-gray-300 hover:border-purple-400'
                  }`}
                >
                  <Clock className={`w-5 h-5 mx-auto mb-2 ${slot.isBooked ? 'text-gray-400' : 'text-purple-600'}`} />
                  <div className={`font-bold ${slot.isBooked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {new Date(slot.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs text-gray-600">{slot.duration} min</div>
                  {slot.isBooked && <div className="text-xs text-red-600 mt-1">Réservé</div>}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep('calendar')
                  setSelectedSlot(null)
                }}
                className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold transition"
              >
                ← Retour
              </button>
              <button
                onClick={() => setStep('form')}
                disabled={!selectedSlot}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Form Step */}
        {step === 'form' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vos informations</h2>

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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom de l'institut *</label>
                <input
                  type="text"
                  required
                  value={formData.institutName}
                  onChange={(e) => setFormData({ ...formData, institutName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Ex: Institut Beauté Zen"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Votre nom *</label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Ex: Marie Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="contact@institut.fr"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="06 12 34 56 78"
                />
              </div>

              {meetingType === 'PHYSICAL' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ville *</label>
                    <input
                      type="text"
                      required={meetingType === 'PHYSICAL'}
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Ex: Paris"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse complète *</label>
                    <input
                      type="text"
                      required={meetingType === 'PHYSICAL'}
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="123 Rue de la Beauté, 75001 Paris"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message (optionnel)</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Dites-nous ce qui vous intéresse..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('time')}
                  className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold transition"
                >
                  ← Retour
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-xl font-bold transition disabled:opacity-50"
                >
                  {submitting ? 'Envoi...' : '✨ Confirmer la réservation'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
