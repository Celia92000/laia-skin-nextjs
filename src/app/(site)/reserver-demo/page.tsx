'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Video, ArrowRight, Check, AlertCircle } from 'lucide-react'

interface DemoSlot {
  id: string
  date: string
  duration: number
  isBooked: boolean
}

export default function ReserverDemoPage() {
  const [slots, setSlots] = useState<DemoSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [step, setStep] = useState<'config' | 'info' | 'slot'>('config')
  const [formData, setFormData] = useState({
    institutName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    message: '',
    city: '',
    location: '',
    type: 'ONLINE' as 'ONLINE' | 'PHYSICAL',
    duration: 30
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

  // Filtrer les créneaux disponibles selon la durée choisie
  const availableSlots = slots.filter(slot => !slot.isBooked)

  // Vérifier si on a assez de créneaux consécutifs
  const hasEnoughConsecutiveSlots = (slot: DemoSlot, durationNeeded: number): boolean => {
    const slotDuration = slot.duration
    if (durationNeeded <= slotDuration) return true

    const sortedSlots = [...availableSlots].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const slotIndex = sortedSlots.findIndex(s => s.id === slot.id)
    if (slotIndex === -1) return false

    let totalDuration = slotDuration
    let currentTime = new Date(slot.date).getTime() + (slotDuration * 60000)

    for (let i = slotIndex + 1; i < sortedSlots.length; i++) {
      const nextSlot = sortedSlots[i]
      const nextSlotTime = new Date(nextSlot.date).getTime()

      if (nextSlotTime !== currentTime) break

      totalDuration += nextSlot.duration
      currentTime = nextSlotTime + (nextSlot.duration * 60000)

      if (totalDuration >= durationNeeded) return true
    }

    return totalDuration >= durationNeeded
  }

  // Obtenir les créneaux qui seront bloqués
  const getSlotsToBlock = (startSlot: DemoSlot, durationNeeded: number): string[] => {
    const slotsToBlock: string[] = [startSlot.id]
    const slotDuration = startSlot.duration

    if (durationNeeded <= slotDuration) return slotsToBlock

    const sortedSlots = [...availableSlots].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const slotIndex = sortedSlots.findIndex(s => s.id === startSlot.id)
    if (slotIndex === -1) return slotsToBlock

    let totalDuration = slotDuration
    let currentTime = new Date(startSlot.date).getTime() + (slotDuration * 60000)

    for (let i = slotIndex + 1; i < sortedSlots.length && totalDuration < durationNeeded; i++) {
      const nextSlot = sortedSlots[i]
      const nextSlotTime = new Date(nextSlot.date).getTime()

      if (nextSlotTime !== currentTime) break

      slotsToBlock.push(nextSlot.id)
      totalDuration += nextSlot.duration
      currentTime = nextSlotTime + (nextSlot.duration * 60000)
    }

    return slotsToBlock
  }

  const filteredSlots = availableSlots.filter(slot =>
    hasEnoughConsecutiveSlots(slot, formData.duration)
  )

  const slotsToBlock = selectedSlot
    ? getSlotsToBlock(
        availableSlots.find(s => s.id === selectedSlot)!,
        formData.duration
      )
    : []

  // Grouper les créneaux par date
  const groupedSlots = filteredSlots.reduce((acc, slot) => {
    const date = new Date(slot.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(slot)
    return acc
  }, {} as Record<string, DemoSlot[]>)

  const handleSubmit = async () => {
    if (!selectedSlot) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/platform/demo-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot,
          type: formData.type,
          institutName: formData.institutName,
          contactName: formData.contactName,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          message: formData.message,
          city: formData.city,
          location: formData.location,
          customDuration: formData.duration,
          slotsToBlock: slotsToBlock
        })
      })

      if (response.ok) {
        // Afficher message de succès
        alert('✅ Réservation confirmée ! Vous recevrez un email de confirmation.')
        window.location.href = '/platform'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 flex items-center justify-center">
        <div className="text-purple-600 text-xl font-semibold">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent mb-4">
            ✨ Réserver une démo LAIA Connect
          </h1>
          <p className="text-gray-700 text-lg font-medium">
            Découvrez notre solution en direct avec un expert
          </p>
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 transition ${step === 'config' ? 'opacity-100 scale-110' : step === 'info' || step === 'slot' ? 'opacity-50' : 'opacity-30'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition ${step === 'config' ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
              <span className="font-bold text-gray-800 hidden md:inline">Configuration</span>
            </div>
            <div className="w-16 h-1 bg-gray-300 rounded"></div>
            <div className={`flex items-center gap-2 transition ${step === 'info' ? 'opacity-100 scale-110' : step === 'slot' ? 'opacity-50' : 'opacity-30'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition ${step === 'info' ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
              <span className="font-bold text-gray-800 hidden md:inline">Informations</span>
            </div>
            <div className="w-16 h-1 bg-gray-300 rounded"></div>
            <div className={`flex items-center gap-2 transition ${step === 'slot' ? 'opacity-100 scale-110' : 'opacity-30'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition ${step === 'slot' ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' : 'bg-gray-300 text-gray-600'}`}>3</div>
              <span className="font-bold text-gray-800 hidden md:inline">Créneau</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* ÉTAPE 1: Configuration */}
          {step === 'config' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">1</div>
                  <h2 className="text-2xl font-bold text-purple-900">Configuration de la démo</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Durée */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Clock className="w-6 h-6 text-purple-600" />
                      Durée de la démo *
                    </label>
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-3">
                        {[15, 30, 45, 60].map((duration) => (
                          <button
                            key={duration}
                            type="button"
                            onClick={() => setFormData({ ...formData, duration })}
                            className={`py-4 px-3 border-2 rounded-xl transition font-bold text-sm shadow-md hover:shadow-lg ${
                              formData.duration === duration
                                ? 'border-purple-600 bg-gradient-to-br from-purple-600 to-pink-600 text-white scale-105'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-purple-400'
                            }`}
                          >
                            {duration}min
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 bg-white rounded-xl p-4 border-2 border-gray-300 shadow-sm">
                        <input
                          type="number"
                          min="5"
                          max="240"
                          step="5"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-bold text-center text-lg"
                        />
                        <span className="text-gray-700 font-bold whitespace-nowrap">minutes (personnalisé)</span>
                      </div>
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-purple-600" />
                      Type de rendez-vous *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'ONLINE' })}
                        className={`p-6 border-2 rounded-xl transition shadow-md hover:shadow-lg ${
                          formData.type === 'ONLINE'
                            ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl'
                            : 'border-gray-300 bg-white hover:border-purple-400'
                        }`}
                      >
                        <Video className={`w-8 h-8 mx-auto mb-3 ${formData.type === 'ONLINE' ? 'text-purple-600' : 'text-gray-600'}`} />
                        <div className="font-bold text-base">Visio</div>
                        <div className="text-xs text-gray-600 mt-1">Jitsi Meet</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'PHYSICAL' })}
                        className={`p-6 border-2 rounded-xl transition shadow-md hover:shadow-lg ${
                          formData.type === 'PHYSICAL'
                            ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl'
                            : 'border-gray-300 bg-white hover:border-purple-400'
                        }`}
                      >
                        <MapPin className={`w-8 h-8 mx-auto mb-3 ${formData.type === 'PHYSICAL' ? 'text-purple-600' : 'text-gray-600'}`} />
                        <div className="font-bold text-base">Présentiel</div>
                        <div className="text-xs text-gray-600 mt-1">À votre institut</div>
                      </button>
                    </div>
                    {formData.type === 'PHYSICAL' && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-800">
                            <span className="font-semibold">Zone de déplacement :</span> Paris et banlieue parisienne proche uniquement
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    onClick={() => setStep('info')}
                    className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition font-bold text-lg shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    Suivant
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 2: Informations */}
          {step === 'info' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">2</div>
                  <h2 className="text-2xl font-bold text-purple-900">Vos informations</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Nom de l'institut *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.institutName}
                      onChange={(e) => setFormData({ ...formData, institutName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                      placeholder="Ex: Institut Beauté Zen"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Votre nom *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                      placeholder="Ex: Marie Dupont"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                      placeholder="contact@institut.fr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                      placeholder="06 12 34 56 78"
                    />
                  </div>

                  {formData.type === 'PHYSICAL' && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Ville *
                        </label>
                        <input
                          type="text"
                          required={formData.type === 'PHYSICAL'}
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                          placeholder="Ex: Paris"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Adresse complète *
                        </label>
                        <input
                          type="text"
                          required={formData.type === 'PHYSICAL'}
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                          placeholder="123 Rue de la Beauté, 75001 Paris"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Message (optionnel)
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                    placeholder="Dites-nous ce qui vous intéresse..."
                  />
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setStep('config')}
                    className="px-10 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-bold text-lg shadow-md"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('slot')}
                    disabled={!formData.institutName || !formData.contactName || !formData.contactEmail}
                    className="flex-1 px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Suivant
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 3: Sélection du créneau */}
          {step === 'slot' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">3</div>
                  <h2 className="text-2xl font-bold text-purple-900">Choisir le créneau</h2>
                  {formData.duration && (
                    <div className="ml-auto px-5 py-3 bg-white border-2 border-purple-300 rounded-xl shadow-md">
                      <span className="text-sm font-bold text-purple-900">
                        ⏱️ Durée : {formData.duration} min
                      </span>
                    </div>
                  )}
                </div>

                {slotsToBlock.length > 1 && (
                  <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-300 rounded-xl shadow-sm">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-bold text-orange-900 mb-1 text-lg">
                          ⚠️ Plusieurs créneaux seront bloqués
                        </div>
                        <div className="text-sm text-orange-700">
                          Pour une démo de <strong>{formData.duration} minutes</strong>, {slotsToBlock.length} créneaux consécutifs seront réservés.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {filteredSlots.length === 0 && availableSlots.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl shadow-sm">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-bold text-red-900 mb-1 text-lg">
                          ❌ Aucun créneau disponible pour cette durée
                        </div>
                        <div className="text-sm text-red-700">
                          Il n'y a pas assez de créneaux consécutifs disponibles pour une démo de {formData.duration} minutes.
                          Veuillez réduire la durée ou nous contacter.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {availableSlots.length === 0 ? (
                  <div className="text-center py-16 text-purple-600">
                    <AlertCircle className="w-16 h-16 mx-auto mb-3" />
                    <p className="font-bold text-xl">Aucun créneau disponible</p>
                    <p className="text-sm mt-2 text-gray-600">Veuillez nous contacter directement</p>
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                    {Object.entries(groupedSlots).map(([date, slots]) => (
                      <div key={date}>
                        <h3 className="font-bold text-gray-800 mb-3 capitalize sticky top-0 bg-gradient-to-r from-purple-50 to-pink-50 py-3 text-lg">
                          📅 {date}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {slots.map((slot) => {
                            const willBeBlocked = slotsToBlock.includes(slot.id)
                            const isMainSlot = selectedSlot === slot.id
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => setSelectedSlot(slot.id)}
                                className={`p-4 border-2 rounded-xl transition relative text-center shadow-md hover:shadow-lg ${
                                  isMainSlot
                                    ? 'border-purple-600 bg-gradient-to-br from-purple-600 to-pink-600 text-white scale-105 shadow-xl'
                                    : willBeBlocked
                                    ? 'border-orange-400 bg-orange-50 text-orange-900'
                                    : 'border-purple-300 bg-white text-gray-900 hover:border-purple-500'
                                }`}
                              >
                                {willBeBlocked && !isMainSlot && (
                                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                                    🔒
                                  </div>
                                )}
                                <div className={`font-bold text-xl ${isMainSlot ? 'text-white' : ''}`}>
                                  {new Date(slot.date).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                {willBeBlocked && !isMainSlot && (
                                  <div className="text-xs mt-1 font-bold text-orange-700">
                                    Bloqué
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-4 pt-6 border-t-2 border-gray-200 mt-8">
                  <button
                    type="button"
                    onClick={() => setStep('info')}
                    className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-bold text-lg shadow-md"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !selectedSlot || filteredSlots.length === 0}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        Réservation...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-6 h-6" />
                        ✨ Confirmer la réservation
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
