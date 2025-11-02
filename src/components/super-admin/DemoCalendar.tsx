'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, Clock, User, MapPin, Mail, Phone, MessageSquare, Check, X, AlertCircle, Video, ExternalLink, ArrowRight } from 'lucide-react'

interface DemoSlot {
  id: string
  date: string
  duration: number
  isAvailable: boolean
  isRecurring: boolean
  dayOfWeek: number | null
  user: {
    id: string
    name: string
    email: string
  } | null
  bookings: DemoBooking[]
}

interface DemoBooking {
  id: string
  institutName: string
  contactName: string
  contactEmail: string
  contactPhone: string | null
  message: string | null
  type: string
  location: string | null
  status: string
  meetingUrl: string | null
  createdAt: string
  lead: {
    id: string
    institutName: string
    status: string
  } | null
}

export default function DemoCalendar() {
  const [slots, setSlots] = useState<DemoSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddSlot, setShowAddSlot] = useState(false)
  const [showCreateDemo, setShowCreateDemo] = useState(false)
  const [preselectedSlot, setPreselectedSlot] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<{ slot: DemoSlot; booking: DemoBooking } | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<DemoSlot | null>(null)
  const [showFollowUpModal, setShowFollowUpModal] = useState<DemoBooking | null>(null)

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const response = await fetch('/api/super-admin/demo-slots')
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Créneaux reçus de l\'API:', data.slots)
        console.log('📊 Nombre de créneaux:', data.slots?.length)

        // Log des créneaux avec bookings
        const slotsWithBookings = data.slots?.filter((s: any) => s.bookings && s.bookings.length > 0)
        console.log('📅 Créneaux avec réservations:', slotsWithBookings?.length)
        console.log('📅 Détails des réservations:', slotsWithBookings)

        setSlots(data.slots)
      } else {
        console.error('❌ Erreur HTTP:', response.status)
      }
    } catch (error) {
      console.error('Erreur chargement créneaux:', error)
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const groupSlotsByDate = () => {
    const grouped: { [key: string]: DemoSlot[] } = {}

    console.log('🗓️ Groupement des créneaux, nombre total:', slots.length)

    slots.forEach(slot => {
      const date = new Date(slot.date)
      const dateKey = date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })

      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(slot)
    })

    console.log('🗓️ Créneaux groupés par date:', Object.keys(grouped).length, 'jours')
    console.log('🗓️ Détail:', grouped)

    return grouped
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmé'
      case 'COMPLETED':
        return 'Réalisé'
      case 'CANCELLED':
        return 'Annulé'
      case 'NO_SHOW':
        return 'Absent'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement du calendrier...</div>
      </div>
    )
  }

  const groupedSlots = groupSlotsByDate()
  const upcomingBookings = slots
    .filter(slot => slot.bookings.length > 0 && new Date(slot.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📅 Calendrier des démos</h2>
          <p className="text-gray-600 mt-1">
            Gérez vos disponibilités et visualisez les réservations
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateDemo(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold shadow-md hover:shadow-lg"
          >
            + Créer une démo
          </button>
          <button
            onClick={() => setShowAddSlot(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            + Ajouter des créneaux
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{slots.length}</div>
              <div className="text-sm text-gray-600">Créneaux total</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {slots.filter(s => s.bookings.length > 0).length}
              </div>
              <div className="text-sm text-gray-600">Réservés</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {slots.filter(s => s.isAvailable && s.bookings.length === 0).length}
              </div>
              <div className="text-sm text-gray-600">Disponibles</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{upcomingBookings.length}</div>
              <div className="text-sm text-gray-600">À venir</div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendrier mensuel visuel */}
      <CalendarView
        slots={slots}
        onDateClick={(date) => {
          // Scroll vers la section de cette date
          const dateStr = date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
          const element = document.getElementById(`date-${dateStr}`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }}
        onSlotClick={(slotId) => {
          setPreselectedSlot(slotId)
          setShowCreateDemo(true)
        }}
      />

      {/* Prochaines réservations */}
      {upcomingBookings.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-purple-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Prochaines démos réservées
          </h3>
          <div className="space-y-3">
            {upcomingBookings.slice(0, 5).map(slot => {
              const booking = slot.bookings[0]
              return (
                <div
                  key={slot.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition cursor-pointer"
                  onClick={() => setSelectedBooking({ slot, booking })}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">{booking.institutName}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(slot.date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {booking.contactName}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {booking.contactEmail}
                        </div>
                        {booking.contactPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {booking.contactPhone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Vue calendrier */}
      <div className="bg-white rounded-lg shadow border border-purple-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Vue calendrier
          </h3>
          <div className="text-sm text-gray-600">
            {slots.length} créneau{slots.length > 1 ? 'x' : ''} au total
          </div>
        </div>

        {slots.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold mb-2">Aucun créneau créé</p>
            <p className="text-sm">Commencez par ajouter des créneaux de disponibilité</p>
          </div>
        ) : Object.keys(groupedSlots).length === 0 ? (
          <div className="text-center py-12 text-orange-500">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-300" />
            <p className="text-lg font-semibold mb-2">Problème de groupement</p>
            <p className="text-sm">{slots.length} créneaux existent mais ne sont pas affichés</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSlots).map(([date, daySlots]) => (
              <div key={date} id={`date-${date}`} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-3 capitalize flex items-center gap-2 bg-gray-50 -m-4 p-4 rounded-t-lg">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  {date}
                  <span className="ml-auto text-sm font-normal text-gray-600">
                    {daySlots.length} créneau{daySlots.length > 1 ? 'x' : ''}
                  </span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                  {daySlots.map((slot) => {
                    const isBooked = slot.bookings && slot.bookings.length > 0
                    const booking = isBooked ? slot.bookings[0] : null

                    return (
                      <div
                        key={slot.id}
                        className={`p-3 border-2 rounded-lg transition cursor-pointer ${
                          isBooked
                            ? 'border-red-400 bg-gradient-to-br from-red-50 to-rose-50'
                            : 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-md'
                        }`}
                        onClick={() => {
                          if (isBooked && booking) {
                            setSelectedBooking({ slot, booking })
                          } else if (slot.isAvailable) {
                            // Créneau disponible : proposer de créer une démo
                            setPreselectedSlot(slot.id)
                            setShowCreateDemo(true)
                          } else {
                            // Créneau indisponible : gérer le créneau
                            setSelectedSlot(slot)
                          }
                        }}
                      >

                        <div className="flex items-center justify-between mb-2">
                          <div className={`text-lg font-bold ${isBooked ? 'text-red-700' : 'text-green-700'}`}>
                            {formatTime(slot.date)}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${isBooked ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                            {booking?.customDuration || slot.duration} min
                          </div>
                        </div>

                        {isBooked && booking ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                              <div className="text-xs font-semibold text-red-700">RÉSERVÉ</div>
                            </div>
                            <div className="font-semibold text-gray-900 text-sm truncate" title={booking?.institutName || ''}>
                              {booking?.institutName || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-600 truncate" title={booking?.contactName || ''}>
                              {booking?.contactName || 'N/A'}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                              <div className="text-xs font-semibold text-green-700">
                                {slot.isAvailable ? 'DISPONIBLE' : 'INDISPONIBLE'}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              En attente de réservation
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals et reste du composant */}
      {showCreateDemo && (
        <CreateDemoModal
          onClose={() => {
            setShowCreateDemo(false)
            setPreselectedSlot(null)
          }}
          onSuccess={async () => {
            setShowCreateDemo(false)
            setPreselectedSlot(null)
            // Attendre un peu puis recharger les créneaux
            await new Promise(resolve => setTimeout(resolve, 500))
            await fetchSlots()
          }}
          availableSlots={slots.filter(s => s.isAvailable && s.bookings.length === 0)}
          preselectedSlotId={preselectedSlot}
        />
      )}

      {showAddSlot && (
        <AddSlotModal
          onClose={() => setShowAddSlot(false)}
          onSuccess={() => {
            setShowAddSlot(false)
            fetchSlots()
          }}
        />
      )}

      {selectedBooking && (
        <BookingDetailModal
          slot={selectedBooking.slot}
          booking={selectedBooking.booking}
          onClose={() => setSelectedBooking(null)}
          onSuccess={() => {
            setSelectedBooking(null)
            fetchSlots()
          }}
          onScheduleFollowUp={setShowFollowUpModal}
        />
      )}

      {selectedSlot && (
        <SlotManageModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onSuccess={() => {
            setSelectedSlot(null)
            fetchSlots()
          }}
        />
      )}

      {showFollowUpModal && (
        <FollowUpModal
          booking={showFollowUpModal}
          onClose={() => setShowFollowUpModal(null)}
          onSuccess={() => {
            setShowFollowUpModal(null)
            fetchSlots()
          }}
        />
      )}
    </div>
  )
}

// Modal création de démo manuelle
function CreateDemoModal({
  onClose,
  onSuccess,
  availableSlots,
  preselectedSlotId
}: {
  onClose: () => void
  onSuccess: () => void
  availableSlots: DemoSlot[]
  preselectedSlotId?: string | null
}) {
  const [step, setStep] = useState<'config' | 'info' | 'slot'>('config')
  const [formData, setFormData] = useState({
    institutName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    message: '',
    type: 'ONLINE' as 'ONLINE' | 'PHYSICAL',
    location: '',
    duration: 30
  })
  const [selectedSlot, setSelectedSlot] = useState<string | null>(preselectedSlotId || null)
  const [booking, setBooking] = useState(false)

  // Fonction pour vérifier si un créneau a assez de créneaux consécutifs disponibles
  const hasEnoughConsecutiveSlots = (slot: DemoSlot, durationNeeded: number): boolean => {
    const slotDuration = slot.duration
    if (durationNeeded <= slotDuration) return true

    // Trier tous les créneaux par date
    const sortedSlots = [...availableSlots].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const slotIndex = sortedSlots.findIndex(s => s.id === slot.id)
    if (slotIndex === -1) return false

    let totalDuration = slotDuration
    let currentTime = new Date(slot.date).getTime() + (slotDuration * 60000)

    // Vérifier les créneaux suivants
    for (let i = slotIndex + 1; i < sortedSlots.length; i++) {
      const nextSlot = sortedSlots[i]
      const nextSlotTime = new Date(nextSlot.date).getTime()

      // Le créneau suivant doit être exactement après le précédent (pas de trou)
      if (nextSlotTime !== currentTime) break

      // Vérifier que le créneau suivant n'est pas déjà réservé
      if (nextSlot.bookings && nextSlot.bookings.length > 0) break

      totalDuration += nextSlot.duration
      currentTime = nextSlotTime + (nextSlot.duration * 60000)

      if (totalDuration >= durationNeeded) return true
    }

    return totalDuration >= durationNeeded
  }

  // Fonction pour obtenir les IDs des créneaux qui seront bloqués
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
      if (nextSlot.bookings && nextSlot.bookings.length > 0) break

      slotsToBlock.push(nextSlot.id)
      totalDuration += nextSlot.duration
      currentTime = nextSlotTime + (nextSlot.duration * 60000)
    }

    return slotsToBlock
  }

  // Filtrer les créneaux disponibles selon la durée choisie
  const filteredSlots = availableSlots.filter(slot =>
    hasEnoughConsecutiveSlots(slot, formData.duration)
  )

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

  // Obtenir les créneaux qui seront bloqués pour le créneau sélectionné
  const selectedSlotData = availableSlots.find(s => s.id === selectedSlot)
  const slotsToBlock = selectedSlotData ? getSlotsToBlock(selectedSlotData, formData.duration) : []

  // Réinitialiser la sélection si la durée change et que le créneau sélectionné n'est plus valide
  useEffect(() => {
    if (selectedSlot && selectedSlotData && !hasEnoughConsecutiveSlots(selectedSlotData, formData.duration)) {
      setSelectedSlot(null)
    }
  }, [formData.duration])

  // Scroller vers le créneau pré-sélectionné
  useEffect(() => {
    if (preselectedSlotId) {
      setTimeout(() => {
        const element = document.getElementById(`slot-${preselectedSlotId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }, [preselectedSlotId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedSlot) {
      alert('Veuillez sélectionner un créneau')
      return
    }

    if (!formData.institutName || !formData.contactName || !formData.contactEmail) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    setBooking(true)
    try {
      const response = await fetch('/api/super-admin/demo-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot,
          institutName: formData.institutName,
          contactName: formData.contactName,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone || null,
          message: formData.message || null,
          type: formData.type,
          location: formData.type === 'PHYSICAL' ? formData.location : null,
          customDuration: formData.duration,
          slotsToBlock: slotsToBlock // Envoyer tous les créneaux à bloquer
        })
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la réservation')
      }
    } catch (error) {
      console.error('Error booking demo:', error)
      alert('Erreur réseau')
    } finally {
      setBooking(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white z-10 rounded-t-2xl">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <Calendar className="w-7 h-7" />
            Nouvelle Réservation de Démo
          </h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-3xl leading-none">×</button>
        </div>

        <div className="p-6">
          {/* Indicateur d'étapes */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${step === 'config' ? 'opacity-100' : step === 'info' || step === 'slot' ? 'opacity-50' : 'opacity-30'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'config' ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
                <span className="font-semibold text-gray-700">Configuration</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center gap-2 ${step === 'info' ? 'opacity-100' : step === 'slot' ? 'opacity-50' : 'opacity-30'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'info' ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
                <span className="font-semibold text-gray-700">Informations</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center gap-2 ${step === 'slot' ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'slot' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>3</div>
                <span className="font-semibold text-gray-700">Créneau</span>
              </div>
            </div>
          </div>

          {/* ÉTAPE 1: Durée et Type */}
          {step === 'config' && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
              <h4 className="text-xl font-bold text-purple-900">Configuration de la démo</h4>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Durée */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Durée de la démo *
                </label>
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 45, 60].map((duration) => (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => setFormData({ ...formData, duration })}
                        className={`py-3 px-2 border-2 rounded-lg transition font-bold text-sm ${
                          formData.duration === duration
                            ? 'border-blue-600 bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-purple-400'
                        }`}
                      >
                        {duration}min
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg p-3 border-2 border-gray-300">
                    <input
                      type="number"
                      min="5"
                      max="240"
                      step="5"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-bold text-center"
                    />
                    <span className="text-gray-700 font-semibold whitespace-nowrap">minutes (personnalisé)</span>
                  </div>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  Type de rendez-vous *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'ONLINE' })}
                    className={`p-4 border-2 rounded-lg transition ${
                      formData.type === 'ONLINE'
                        ? 'border-blue-600 bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-purple-400'
                    }`}
                  >
                    <Video className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-bold text-sm">Visio</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'PHYSICAL' })}
                    className={`p-4 border-2 rounded-lg transition ${
                      formData.type === 'PHYSICAL'
                        ? 'border-blue-600 bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-purple-400'
                    }`}
                  >
                    <MapPin className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-bold text-sm">Présentiel</div>
                  </button>
                </div>
                {formData.type === 'PHYSICAL' && (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-3 w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Adresse du rendez-vous"
                  />
                )}
              </div>
            </div>

            {/* Bouton suivant */}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setStep('info')}
                className="px-8 py-3 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl hover:bg-blue-700 transition font-bold flex items-center gap-2"
              >
                Suivant
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          )}

          {/* ÉTAPE 2: Informations du prospect */}
          {step === 'info' && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
              <h4 className="text-xl font-bold text-purple-900">Informations du prospect</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom de l'institut *
                </label>
                <input
                  type="text"
                  required
                  value={formData.institutName}
                  onChange={(e) => setFormData({ ...formData, institutName: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Ex: Beauty Spa Paris"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom du contact *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Ex: Marie Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes / Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Notes internes ou message pour le prospect..."
              />
            </div>

            {/* Boutons navigation */}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setStep('config')}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-bold"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={() => setStep('slot')}
                disabled={!formData.institutName || !formData.contactName || !formData.contactEmail}
                className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          )}

          {/* ÉTAPE 3: Sélection du créneau */}
          {step === 'slot' && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
              <h4 className="text-xl font-bold text-purple-900">Choisir le créneau</h4>
              {formData.duration && (
                <div className="ml-auto px-4 py-2 bg-purple-100 border border-purple-300 rounded-lg">
                  <span className="text-sm font-semibold text-purple-900">
                    Durée : {formData.duration} min
                  </span>
                </div>
              )}
            </div>

            {preselectedSlotId && selectedSlot && (
              <div className="mb-4 p-3 bg-green-600 text-white rounded-lg flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Créneau sélectionné depuis le calendrier</span>
              </div>
            )}

            {slotsToBlock.length > 1 && (
              <div className="mb-4 p-3 bg-orange-50 border-2 border-orange-300 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-orange-900 mb-1">
                      ⚠️ Attention : Plusieurs créneaux seront bloqués
                    </div>
                    <div className="text-sm text-orange-700">
                      Pour une démo de <strong>{formData.duration} minutes</strong>, {slotsToBlock.length} créneaux consécutifs seront réservés.
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
                    <div className="font-semibold text-red-900 mb-1">
                      Aucun créneau disponible pour cette durée
                    </div>
                    <div className="text-sm text-red-700">
                      Il n'y a pas assez de créneaux consécutifs disponibles pour une démo de {formData.duration} minutes.
                      Réduisez la durée ou créez plus de créneaux.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {availableSlots.length === 0 ? (
              <div className="text-center py-8 text-orange-600">
                <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                <p className="font-semibold">Aucun créneau disponible</p>
                <p className="text-sm mt-1">Veuillez d'abord créer des créneaux</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(groupedSlots).map(([date, slots]) => (
                  <div key={date}>
                    <h5 className="font-semibold text-gray-700 mb-2 capitalize sticky top-0 bg-purple-50 py-2">
                      📅 {date}
                    </h5>
                    <div className="grid grid-cols-6 gap-2">
                      {slots.map((slot) => {
                        const willBeBlocked = slotsToBlock.includes(slot.id)
                        const isMainSlot = selectedSlot === slot.id
                        return (
                          <button
                            key={slot.id}
                            id={`slot-${slot.id}`}
                            type="button"
                            onClick={() => setSelectedSlot(slot.id)}
                            className={`p-3 border-2 rounded-xl transition relative text-center ${
                              isMainSlot
                                ? 'border-green-600 bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-xl scale-105'
                                : willBeBlocked
                                ? 'border-orange-400 bg-orange-50 text-orange-900'
                                : 'border-purple-300 bg-white text-gray-900 hover:border-purple-500 hover:shadow-md'
                            }`}
                          >
                            {willBeBlocked && !isMainSlot && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                                🔒
                              </div>
                            )}
                            <div className={`font-bold text-lg ${isMainSlot ? 'text-white' : ''}`}>
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

            {/* Boutons de confirmation */}
            <div className="flex gap-4 pt-4 border-t-2 border-gray-200 mt-6">
              <button
                type="button"
                onClick={() => setStep('info')}
                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-bold text-lg"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={booking || !selectedSlot || filteredSlots.length === 0}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Réservation...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Confirmer la réservation
                  </span>
                )}
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Modal ajout de créneaux
function AddSlotModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create')
  const [formData, setFormData] = useState({
    dateStart: '',
    dateEnd: '',
    timeStart: '09:00',
    timeEnd: '17:00',
    duration: 30,
    repeatWeeks: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingSlots, setExistingSlots] = useState<any[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Charger les créneaux existants pour l'onglet "Gérer"
  useEffect(() => {
    if (activeTab === 'manage') {
      fetchExistingSlots()
    }
  }, [activeTab])

  const fetchExistingSlots = async () => {
    setLoadingSlots(true)
    try {
      const response = await fetch('/api/super-admin/demo-slots')
      if (response.ok) {
        const data = await response.json()
        setExistingSlots(data.slots || [])
      }
    } catch (error) {
      console.error('Erreur chargement créneaux:', error)
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce créneau ?')) return

    try {
      const response = await fetch(`/api/super-admin/demo-slots/${slotId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await fetchExistingSlots()
        onSuccess()
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  const handleDeletePlage = async (date: string, timeStart: string, timeEnd: string, duration: number) => {
    if (!confirm(`Supprimer tous les créneaux de ${timeStart} à ${timeEnd} le ${new Date(date).toLocaleDateString('fr-FR')} ?`)) return

    const daySlots = existingSlots.filter(slot => {
      const slotDate = new Date(slot.date).toDateString()
      const targetDate = new Date(date).toDateString()
      return slotDate === targetDate
    })

    try {
      const promises = daySlots.map(slot =>
        fetch(`/api/super-admin/demo-slots/${slot.id}`, { method: 'DELETE' })
      )
      await Promise.all(promises)
      await fetchExistingSlots()
      onSuccess()
      alert('Plage supprimée avec succès')
    } catch (error) {
      console.error('Erreur suppression plage:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const generateTimeSlots = () => {
    if (!formData.timeStart || !formData.timeEnd) return []

    const start = parseInt(formData.timeStart.split(':')[0]) * 60 + parseInt(formData.timeStart.split(':')[1])
    const end = parseInt(formData.timeEnd.split(':')[0]) * 60 + parseInt(formData.timeEnd.split(':')[1])
    const slots = []

    for (let time = start; time < end; time += formData.duration) {
      const hours = Math.floor(time / 60)
      const minutes = time % 60
      slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
    }

    return slots
  }

  const getDays = () => {
    if (!formData.dateStart) return []
    if (!formData.dateEnd) return [new Date(formData.dateStart)]

    const days = []
    const start = new Date(formData.dateStart)
    const end = new Date(formData.dateEnd)
    const current = new Date(start)

    while (current <= end) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const timeSlots = generateTimeSlots()
      const days = getDays()
      const promises = []

      // Pour chaque semaine (0 = cette semaine uniquement)
      for (let week = 0; week <= formData.repeatWeeks; week++) {
        for (const day of days) {
          for (const time of timeSlots) {
            const slotDate = new Date(`${day.toISOString().split('T')[0]}T${time}`)

            // Ajouter les semaines
            if (week > 0) {
              slotDate.setDate(slotDate.getDate() + (week * 7))
            }

            promises.push(
              fetch('/api/super-admin/demo-slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  date: slotDate.toISOString(),
                  duration: formData.duration
                })
              })
            )
          }
        }
      }

      const results = await Promise.all(promises)
      const allSuccess = results.every(r => r.ok)

      if (allSuccess) {
        onSuccess()
      } else {
        setError('Erreur lors de la création de certains créneaux')
      }
    } catch (err) {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const totalSlots = generateTimeSlots().length * getDays().length * (formData.repeatWeeks + 1)

  // Grouper les créneaux par jour et plage horaire
  const groupedPlages = existingSlots.reduce((acc: any, slot) => {
    const date = new Date(slot.date).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(slot)
    return acc
  }, {})

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4 border-b z-10">
          <h3 className="text-xl font-bold text-gray-900">Gérer les créneaux</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">×</button>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'create'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            ➕ Créer des créneaux
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'manage'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            ⚙️ Gérer les plages ({existingSlots.length})
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Contenu de l'onglet Créer */}
        {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Dates */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Période
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Du</label>
                <input
                  type="date"
                  required
                  value={formData.dateStart}
                  onChange={(e) => setFormData({ ...formData, dateStart: e.target.value })}
                  className="w-full px-3 py-2.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Au (optionnel)</label>
                <input
                  type="date"
                  value={formData.dateEnd}
                  onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
                  min={formData.dateStart}
                  className="w-full px-3 py-2.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
            {formData.dateEnd && getDays().length > 1 && (
              <div className="mt-2 text-sm text-purple-600 font-medium">
                → {getDays().length} jours sélectionnés
              </div>
            )}
          </div>

          {/* Horaires */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Horaires
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Début</label>
                <input
                  type="time"
                  required
                  value={formData.timeStart}
                  onChange={(e) => setFormData({ ...formData, timeStart: e.target.value })}
                  className="w-full px-3 py-2.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Fin</label>
                <input
                  type="time"
                  required
                  value={formData.timeEnd}
                  onChange={(e) => setFormData({ ...formData, timeEnd: e.target.value })}
                  className="w-full px-3 py-2.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Durée */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Durée de chaque créneau
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map(duration => (
                <button
                  key={duration}
                  type="button"
                  onClick={() => setFormData({ ...formData, duration })}
                  className={`px-3 py-3 rounded-lg border-2 transition font-bold text-base ${
                    formData.duration === duration
                      ? 'border-purple-600 bg-purple-600 text-white shadow-lg'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-purple-400'
                  }`}
                >
                  {duration}min
                </button>
              ))}
            </div>
          </div>

          {/* Répétition */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <label className="block text-base font-semibold text-gray-900 mb-3">
              🔄 Répéter chaque semaine
            </label>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="range"
                min="0"
                max="52"
                value={formData.repeatWeeks}
                onChange={(e) => setFormData({ ...formData, repeatWeeks: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="min-w-[120px] text-right">
                <div className="text-2xl font-bold text-purple-900">
                  {formData.repeatWeeks === 0 ? '0' : formData.repeatWeeks}
                </div>
                <div className="text-xs text-blue-700">
                  {formData.repeatWeeks === 0 ? 'Aucune répétition' : `${formData.repeatWeeks} semaine${formData.repeatWeeks > 1 ? 's' : ''}`}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, repeatWeeks: 4 })}
                className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded text-sm hover:bg-blue-100 transition"
              >
                1 mois
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, repeatWeeks: 12 })}
                className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded text-sm hover:bg-blue-100 transition"
              >
                3 mois
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, repeatWeeks: 26 })}
                className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded text-sm hover:bg-blue-100 transition"
              >
                6 mois
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, repeatWeeks: 52 })}
                className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded text-sm hover:bg-blue-100 transition"
              >
                1 an
              </button>
            </div>
            {formData.repeatWeeks > 0 && (
              <div className="mt-2 text-sm text-blue-700 bg-blue-100 rounded p-2">
                💡 Les créneaux seront créés pour {formData.repeatWeeks + 1} semaine{formData.repeatWeeks > 0 ? 's' : ''} au total
              </div>
            )}
          </div>

          {/* Aperçu */}
          {formData.dateStart && formData.timeStart && formData.timeEnd && totalSlots > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm text-green-700 mb-1">Créneaux créés</div>
                  <div className="text-2xl font-bold text-purple-900">{totalSlots}</div>
                </div>
                <div className="text-4xl">📅</div>
              </div>
              <div className="text-xs text-green-700 space-y-1">
                <div>• {generateTimeSlots().length} créneaux par jour</div>
                {getDays().length > 1 && (
                  <div>• Sur {getDays().length} jours</div>
                )}
                {formData.repeatWeeks > 0 && (
                  <div>• Répété sur {formData.repeatWeeks + 1} semaines</div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-green-200 text-xs text-green-700 flex flex-wrap gap-1">
                {generateTimeSlots().slice(0, 8).map((time, i) => (
                  <span key={i} className="px-2 py-1 bg-white rounded">{time}</span>
                ))}
                {generateTimeSlots().length > 8 && (
                  <span className="px-2 py-1 font-semibold">+{generateTimeSlots().length - 8}</span>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || totalSlots === 0}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? '⏳ Création...' : `✨ Créer ${totalSlots} créneau${totalSlots > 1 ? 'x' : ''}`}
          </button>
        </form>
        )}

        {/* Contenu de l'onglet Gérer */}
        {activeTab === 'manage' && (
          <div className="space-y-4">
            {loadingSlots ? (
              <div className="text-center py-12 text-gray-500">
                Chargement des créneaux...
              </div>
            ) : existingSlots.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold mb-2">Aucun créneau créé</p>
                <p className="text-sm">Passez à l'onglet "Créer" pour ajouter des créneaux</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">
                    {existingSlots.length} créneau{existingSlots.length > 1 ? 'x' : ''} créé{existingSlots.length > 1 ? 's' : ''}
                  </h4>
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer TOUS les ${existingSlots.length} créneaux ?`)) {
                        Promise.all(existingSlots.map(slot =>
                          fetch(`/api/super-admin/demo-slots/${slot.id}`, { method: 'DELETE' })
                        )).then(() => {
                          fetchExistingSlots()
                          onSuccess()
                        })
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                  >
                    🗑️ Tout supprimer
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {Object.entries(groupedPlages).map(([date, daySlots]: [string, any]) => {
                    const availableSlots = daySlots.filter((s: any) => s.bookings?.length === 0)
                    const bookedSlots = daySlots.filter((s: any) => s.bookings?.length > 0)

                    return (
                      <div key={date} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-bold text-gray-800 capitalize">
                            {new Date(date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </h5>
                          <div className="text-sm text-gray-600">
                            {daySlots.length} créneaux
                            {bookedSlots.length > 0 && (
                              <span className="ml-2 text-red-600 font-semibold">
                                ({bookedSlots.length} réservé{bookedSlots.length > 1 ? 's' : ''})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {daySlots.map((slot: any) => {
                            const isBooked = slot.bookings && slot.bookings.length > 0
                            return (
                              <div
                                key={slot.id}
                                className={`p-2 border-2 rounded flex items-center justify-between ${
                                  isBooked
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-green-300 bg-green-50'
                                }`}
                              >
                                <div className="flex-1">
                                  <div className={`text-sm font-bold ${isBooked ? 'text-red-700' : 'text-green-700'}`}>
                                    {new Date(slot.date).toLocaleTimeString('fr-FR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                  <div className="text-xs text-gray-600">{slot.duration}min</div>
                                </div>
                                {!isBooked && (
                                  <button
                                    onClick={() => handleDeleteSlot(slot.id)}
                                    className="ml-2 text-red-600 hover:text-red-800 transition"
                                    title="Supprimer"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {availableSlots.length > 0 && (
                          <button
                            onClick={() => {
                              const firstSlot = availableSlots[0]
                              const lastSlot = availableSlots[availableSlots.length - 1]
                              const timeStart = new Date(firstSlot.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                              const timeEnd = new Date(new Date(lastSlot.date).getTime() + lastSlot.duration * 60000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                              handleDeletePlage(date, timeStart, timeEnd, firstSlot.duration)
                            }}
                            className="mt-3 w-full px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded border border-red-300 transition text-sm font-semibold"
                          >
                            🗑️ Supprimer tous les créneaux disponibles de ce jour
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Modal gestion créneau (modifier/supprimer)
function SlotManageModal({
  slot,
  onClose,
  onSuccess
}: {
  slot: DemoSlot
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date(slot.date).toISOString().slice(0, 16),
    duration: slot.duration,
    isAvailable: slot.isAvailable
  })

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/super-admin/demo-slots/${slot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date(formData.date).toISOString(),
          duration: formData.duration,
          isAvailable: formData.isAvailable
        })
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Erreur modification:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment supprimer ce créneau ?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/super-admin/demo-slots/${slot.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b z-10">
          <h3 className="text-xl font-bold text-gray-900">Gérer le créneau</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl">×</button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date et heure</label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Durée</label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map(duration => (
                <button
                  key={duration}
                  type="button"
                  onClick={() => setFormData({ ...formData, duration })}
                  className={`px-3 py-2 rounded-lg border-2 transition font-semibold ${
                    formData.duration === duration
                      ? 'border-purple-600 bg-purple-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-purple-400'
                  }`}
                >
                  {duration}min
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="isAvailable" className="text-sm font-semibold text-gray-700">
              Créneau disponible
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Modification...' : 'Modifier'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal détails réservation
function BookingDetailModal({
  slot,
  booking,
  onClose,
  onSuccess,
  onScheduleFollowUp
}: {
  slot: DemoSlot
  booking: DemoBooking
  onClose: () => void
  onSuccess: () => void
  onScheduleFollowUp: (booking: DemoBooking) => void
}) {
  const [updating, setUpdating] = useState(false)

  const updateStatus = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/super-admin/demo-bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b z-10">
          <h3 className="text-2xl font-bold text-gray-900">Détails de la réservation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl">×</button>
        </div>

        <div className="space-y-6">
          {/* Info créneau */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-900">
                {new Intl.DateTimeFormat('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }).format(new Date(slot.date))}
              </span>
            </div>
            <div className="text-sm text-purple-700">
              Durée : {booking.customDuration || slot.duration} minutes
              {booking.customDuration && booking.customDuration !== slot.duration && (
                <span className="ml-2 text-xs text-orange-600">(personnalisée)</span>
              )}
            </div>
          </div>

          {/* Info prospect */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Institut</label>
              <div className="text-lg font-semibold text-gray-900">{booking.institutName}</div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Contact</label>
              <div className="text-lg font-semibold text-gray-900">{booking.contactName}</div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Email</label>
              <div className="text-gray-900">{booking.contactEmail}</div>
            </div>
            {booking.contactPhone && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Téléphone</label>
                <div className="text-gray-900">{booking.contactPhone}</div>
              </div>
            )}
          </div>

          {booking.message && (
            <div>
              <label className="text-sm font-semibold text-gray-600">Message</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
                {booking.message}
              </div>
            </div>
          )}

          {/* Type de rendez-vous et détails */}
          {booking.type === 'ONLINE' && booking.meetingUrl ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-purple-900">🌐 Rendez-vous en visioconférence</div>
                    <div className="text-xs text-green-700 mt-1">Jitsi Meet - Aucun compte requis</div>
                  </div>
                </div>
                <a
                  href={booking.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Video className="w-5 h-5" />
                  Rejoindre la démo
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="text-xs text-green-700 break-all">{booking.meetingUrl}</div>
              </div>
            </div>
          ) : booking.type === 'PHYSICAL' ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-purple-900">📍 Rendez-vous physique</div>
                  <div className="text-sm text-blue-700 mt-2">
                    {booking.location || 'Adresse à confirmer'}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {booking.lead && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-purple-900">Lead CRM associé</div>
                  <div className="text-sm text-blue-700">Statut : {booking.lead.status}</div>
                </div>
                <a
                  href={`/super-admin/crm?lead=${booking.lead.id}`}
                  className="px-4 py-2 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  Voir dans CRM
                </a>
              </div>
            </div>
          )}

          {/* Planifier RDV de suivi */}
          {booking.status === 'COMPLETED' && (
            <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-orange-900">📅 Planifier un rendez-vous de suivi</div>
                  <div className="text-xs text-orange-700 mt-1">Créer un nouveau créneau pour ce prospect</div>
                </div>
                <button
                  onClick={() => {
                    onScheduleFollowUp(booking)
                    onClose()
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
                >
                  Planifier RDV
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t pt-4">
            <label className="text-sm font-semibold text-gray-600 block mb-3">Actions</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateStatus('COMPLETED')}
                disabled={updating}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Marquer comme réalisé
              </button>
              <button
                onClick={() => updateStatus('NO_SHOW')}
                disabled={updating}
                className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Absent
              </button>
              <button
                onClick={() => updateStatus('CANCELLED')}
                disabled={updating}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
              <button
                onClick={() => updateStatus('CONFIRMED')}
                disabled={updating}
                className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                Restaurer confirmation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal planifier RDV de suivi
function FollowUpModal({
  booking,
  onClose,
  onSuccess
}: {
  booking: DemoBooking
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    date: '',
    time: '14:00',
    duration: 30,
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const slotDate = new Date(`${formData.date}T${formData.time}`)

      // Créer le créneau
      const slotResponse = await fetch('/api/super-admin/demo-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: slotDate.toISOString(),
          duration: formData.duration
        })
      })

      if (!slotResponse.ok) {
        throw new Error('Erreur création créneau')
      }

      const { id: slotId } = await slotResponse.json()

      // Créer la réservation avec le lien Jitsi
      const bookingResponse = await fetch('/api/super-admin/demo-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId,
          institutName: booking.institutName,
          contactName: booking.contactName,
          contactEmail: booking.contactEmail,
          contactPhone: booking.contactPhone,
          message: formData.notes,
          leadId: booking.lead?.id,
          type: 'ONLINE'
        })
      })

      if (!bookingResponse.ok) {
        throw new Error('Erreur création réservation')
      }

      onSuccess()
    } catch (err) {
      setError('Erreur lors de la planification')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b z-10">
          <h3 className="text-xl font-bold text-gray-900">📅 Planifier un RDV de suivi</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl">×</button>
        </div>

        {/* Info prospect */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="text-sm font-semibold text-purple-900 mb-1">Prospect</div>
          <div className="text-lg font-bold text-purple-700">{booking.institutName}</div>
          <div className="text-sm text-purple-600">{booking.contactName} - {booking.contactEmail}</div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Heure</label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Durée</label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map(duration => (
                <button
                  key={duration}
                  type="button"
                  onClick={() => setFormData({ ...formData, duration })}
                  className={`px-3 py-2 rounded-lg border-2 transition font-semibold ${
                    formData.duration === duration
                      ? 'border-purple-600 bg-purple-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-purple-400'
                  }`}
                >
                  {duration}min
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optionnel)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Ex: Suite de la démo, présentation des tarifs..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-xl transition disabled:opacity-50"
          >
            {loading ? 'Planification...' : '✨ Créer le rendez-vous'}
          </button>
        </form>
      </div>
    </div>
  )
}


// Composant Calendrier mensuel visuel
function CalendarView({
  slots,
  onDateClick,
  onSlotClick
}: {
  slots: DemoSlot[]
  onDateClick: (date: Date) => void
  onSlotClick?: (slotId: string) => void
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

    return { firstDay, lastDay, daysInMonth, startingDayOfWeek }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)

  const getSlotsForDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return slots.filter(slot => {
      const slotDate = new Date(slot.date)
      return slotDate.toDateString() === date.toDateString()
    })
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-lg shadow border border-purple-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 capitalize flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          {monthName}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-semibold transition"
          >
            ←
          </button>
          <button
            onClick={nextMonth}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-semibold transition"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={'empty-' + i} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const daySlots = getSlotsForDate(day)
          const hasSlots = daySlots.length > 0
          const bookedSlots = daySlots.filter(s => s.bookings && s.bookings.length > 0).length
          const availableSlots = daySlots.filter(s => s.isAvailable && s.bookings.length === 0)
          const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString()

          const handleDayClick = () => {
            if (!hasSlots) return

            // Si des créneaux disponibles, ouvrir le modal de création
            if (availableSlots.length > 0 && onSlotClick) {
              // Toujours pré-sélectionner le premier créneau disponible
              onSlotClick(availableSlots[0].id)
            }
            // Sinon scroller vers la section détaillée (jours avec seulement des créneaux réservés)
            else {
              onDateClick(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
            }
          }

          return (
            <div
              key={day}
              onClick={handleDayClick}
              className={'aspect-square border-2 rounded-lg p-2 transition cursor-pointer ' + (
                isToday
                  ? 'border-purple-600 bg-purple-50'
                  : hasSlots
                  ? bookedSlots > 0
                    ? 'border-red-300 bg-red-50 hover:bg-red-100'
                    : 'border-green-300 bg-green-50 hover:bg-green-100'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              )}
            >
              <div className={'text-sm font-semibold ' + (isToday ? 'text-purple-700' : 'text-gray-900')}>
                {day}
              </div>
              {hasSlots && (
                <div className="mt-1">
                  <div className="text-xs text-gray-700 font-semibold">{daySlots.length} créneaux</div>
                  {bookedSlots > 0 && (
                    <div className="text-xs text-red-600 font-semibold">{bookedSlots} réservé{bookedSlots > 1 ? 's' : ''}</div>
                  )}
                  {availableSlots.length > 0 && (
                    <div className="text-xs text-green-600 font-semibold">{availableSlots.length} ouvert{availableSlots.length > 1 ? 's' : ''}</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-purple-600 bg-purple-50 rounded"></div>
          <span className="text-gray-600">Aujourd'hui</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-green-400 bg-green-50 rounded"></div>
          <span className="text-gray-600">Créneaux ouverts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-red-400 bg-red-50 rounded"></div>
          <span className="text-gray-600">Créneaux réservés</span>
        </div>
      </div>
    </div>
  )
}
