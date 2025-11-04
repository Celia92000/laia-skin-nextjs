'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Video, ArrowRight, Check, AlertCircle } from 'lucide-react'

interface DemoSlot {
  id: string
  date: string
  duration: number
  isBooked?: boolean
}

export default function DemoBooking() {
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
    duration: 60
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
        alert('✅ Réservation confirmée ! Vous recevrez un email de confirmation.')
        window.location.reload()
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
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-purple-600 text-xl font-semibold">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
      {/* Header avec vidéo Celia */}
      <div className="relative h-32 bg-gradient-to-br from-purple-600 via-purple-500 to-violet-700">
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
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
      </div>

      <div className="pt-16 pb-6 px-8">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent mb-2">
          Réserver une démo avec Celia
        </h2>
        <p className="text-center text-gray-600 font-medium">
          Découvrez LAIA Connect en direct
        </p>
      </div>

      {/* Indicateur d'étapes */}
      <div className="flex items-center justify-center px-8 pb-6">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 transition ${step === 'config' ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-md transition ${step === 'config' ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
            <span className="font-semibold text-gray-800 text-sm hidden md:inline">Configuration</span>
          </div>
          <div className="w-12 h-1 bg-gray-300 rounded"></div>
          <div className={`flex items-center gap-2 transition ${step === 'info' ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-md transition ${step === 'info' ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
            <span className="font-semibold text-gray-800 text-sm hidden md:inline">Informations</span>
          </div>
          <div className="w-12 h-1 bg-gray-300 rounded"></div>
          <div className={`flex items-center gap-2 transition ${step === 'slot' ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-md transition ${step === 'slot' ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' : 'bg-gray-300 text-gray-600'}`}>3</div>
            <span className="font-semibold text-gray-800 text-sm hidden md:inline">Créneau</span>
          </div>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {/* ÉTAPE 1: Configuration */}
        {step === 'config' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">1</div>
                <h3 className="text-xl font-bold text-purple-900">Configuration de la démo</h3>
              </div>

              {/* Applications mobiles */}
              <div className="mb-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl p-5 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">📱</span>
                      <h4 className="font-bold text-lg">Téléchargez l'application</h4>
                    </div>
                    <p className="text-sm text-purple-200">Disponible sur iOS et Android</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="#download-ios"
                    className="bg-white text-gray-900 rounded-lg p-3 hover:bg-gray-100 transition shadow-lg hover:scale-105 transform"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🍎</span>
                      <div className="text-left">
                        <div className="text-xs text-gray-600">Télécharger sur</div>
                        <div className="font-bold text-sm">App Store</div>
                      </div>
                    </div>
                  </a>

                  <a
                    href="#download-android"
                    className="bg-white text-gray-900 rounded-lg p-3 hover:bg-gray-100 transition shadow-lg hover:scale-105 transform"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🤖</span>
                      <div className="text-left">
                        <div className="text-xs text-gray-600">Disponible sur</div>
                        <div className="font-bold text-sm">Google Play</div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Info durée fixe */}
              <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-purple-600" />
                  <div className="font-bold text-purple-900">Durée de la démo - 60 minutes</div>
                </div>
              </div>

              <div>
                {/* Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    Type de rendez-vous *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'ONLINE' })}
                      className={`p-4 border-2 rounded-lg transition shadow-sm hover:shadow-md ${
                        formData.type === 'ONLINE'
                          ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                          : 'border-gray-300 bg-white hover:border-purple-400'
                      }`}
                    >
                      <Video className={`w-6 h-6 mx-auto mb-2 ${formData.type === 'ONLINE' ? 'text-purple-600' : 'text-gray-600'}`} />
                      <div className="font-bold text-sm">Visio</div>
                      <div className="text-xs text-gray-600 mt-1">Jitsi Meet</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'PHYSICAL' })}
                      className={`p-4 border-2 rounded-lg transition shadow-sm hover:shadow-md ${
                        formData.type === 'PHYSICAL'
                          ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                          : 'border-gray-300 bg-white hover:border-purple-400'
                      }`}
                    >
                      <MapPin className={`w-6 h-6 mx-auto mb-2 ${formData.type === 'PHYSICAL' ? 'text-purple-600' : 'text-gray-600'}`} />
                      <div className="font-bold text-sm">Présentiel</div>
                      <div className="text-xs text-gray-600 mt-1">Sur place</div>
                    </button>
                  </div>
                  {formData.type === 'PHYSICAL' && (
                    <div className="mt-3 space-y-3">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-blue-800">
                            <span className="font-semibold">Zone :</span> Paris et banlieue proche uniquement
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Ville *
                        </label>
                        <input
                          type="text"
                          required={formData.type === 'PHYSICAL'}
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
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
                          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                          placeholder="123 Rue de la Beauté, 75001 Paris"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition font-bold shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Suivant
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2: Informations */}
        {step === 'info' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">2</div>
                <h3 className="text-xl font-bold text-purple-900">Vos informations</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Nom de l'institut *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.institutName}
                    onChange={(e) => setFormData({ ...formData, institutName: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
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
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
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
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
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
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
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
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
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
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                        placeholder="123 Rue de la Beauté, 75001 Paris"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                  placeholder="Questions ou besoins spécifiques..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep('config')}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-bold shadow-md"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={() => setStep('slot')}
                  disabled={!formData.institutName || !formData.contactName || !formData.contactEmail}
                  className="flex-1 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Suivant
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 3: Sélection du créneau */}
        {step === 'slot' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">3</div>
                <h3 className="text-xl font-bold text-purple-900">Choisir le créneau</h3>
                {formData.duration && (
                  <div className="ml-auto px-4 py-2 bg-white border-2 border-purple-300 rounded-lg shadow-sm">
                    <span className="text-sm font-bold text-purple-900">
                      ⏱️ {formData.duration} min
                    </span>
                  </div>
                )}
              </div>

              {slotsToBlock.length > 1 && (
                <div className="mb-4 p-3 bg-orange-50 border-2 border-orange-300 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold text-orange-900 text-sm mb-1">
                        ⚠️ Plusieurs créneaux seront bloqués
                      </div>
                      <div className="text-xs text-orange-700">
                        Pour {formData.duration} min, {slotsToBlock.length} créneaux seront réservés.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {filteredSlots.length === 0 && availableSlots.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold text-red-900 text-sm mb-1">
                        ❌ Aucun créneau disponible
                      </div>
                      <div className="text-xs text-red-700">
                        Pas assez de créneaux consécutifs pour {formData.duration} min. Réduisez la durée.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {availableSlots.length === 0 ? (
                <div className="text-center py-12 text-purple-600">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-bold">Aucun créneau disponible</p>
                  <p className="text-sm mt-1 text-gray-600">Contactez-nous directement</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  {Object.entries(groupedSlots).map(([date, slots]) => (
                    <div key={date}>
                      <h4 className="font-bold text-gray-800 mb-2 capitalize sticky top-0 bg-gradient-to-r from-purple-50 to-pink-50 py-2 text-sm">
                        📅 {date}
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {slots.map((slot) => {
                          const willBeBlocked = slotsToBlock.includes(slot.id)
                          const isMainSlot = selectedSlot === slot.id
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedSlot(slot.id)}
                              className={`p-3 border-2 rounded-lg transition relative text-center shadow-sm hover:shadow-md ${
                                isMainSlot
                                  ? 'border-purple-600 bg-gradient-to-br from-purple-600 to-pink-600 text-white scale-105 shadow-lg'
                                  : willBeBlocked
                                  ? 'border-orange-400 bg-orange-50 text-orange-900'
                                  : 'border-purple-300 bg-white text-gray-900 hover:border-purple-500'
                              }`}
                            >
                              {willBeBlocked && !isMainSlot && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  🔒
                                </div>
                              )}
                              <div className={`font-bold text-base ${isMainSlot ? 'text-white' : ''}`}>
                                {new Date(slot.date).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              {willBeBlocked && !isMainSlot && (
                                <div className="text-xs mt-1 font-semibold text-orange-700">
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

              <div className="flex gap-3 pt-4 border-t-2 border-gray-200 mt-4">
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-bold shadow-md"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !selectedSlot || filteredSlots.length === 0}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Réservation...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" />
                      Confirmer
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
