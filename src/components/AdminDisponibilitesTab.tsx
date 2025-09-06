"use client";

import { useState } from "react";
import { Clock, Calendar, Plus, Trash2, Save, AlertCircle } from "lucide-react";

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
}

interface BlockedDate {
  id: string;
  date: string;
  reason: string;
}

export default function AdminDisponibilitesTab() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: '1', day: 'Lundi', startTime: '10:00', endTime: '19:00' },
    { id: '2', day: 'Mardi', startTime: '10:00', endTime: '19:00' },
    { id: '3', day: 'Mercredi', startTime: '10:00', endTime: '19:00' },
    { id: '4', day: 'Jeudi', startTime: '10:00', endTime: '19:00' },
    { id: '5', day: 'Vendredi', startTime: '10:00', endTime: '19:00' },
    { id: '6', day: 'Samedi', startTime: '09:00', endTime: '18:00' },
    { id: '7', day: 'Dimanche', startTime: 'Fermé', endTime: 'Fermé' },
    // Pauses déjeuner
    { id: '8', day: 'Lundi', startTime: '13:00', endTime: '14:00', isBreak: true },
    { id: '9', day: 'Mardi', startTime: '13:00', endTime: '14:00', isBreak: true },
    { id: '10', day: 'Mercredi', startTime: '13:00', endTime: '14:00', isBreak: true },
    { id: '11', day: 'Jeudi', startTime: '13:00', endTime: '14:00', isBreak: true },
    { id: '12', day: 'Vendredi', startTime: '13:00', endTime: '14:00', isBreak: true },
  ]);

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([
    { id: '1', date: '2025-09-25', reason: 'Congés annuels' },
    { id: '2', date: '2025-10-01', reason: 'Jour férié' },
  ]);

  const [newBlockedDate, setNewBlockedDate] = useState({ date: '', reason: '' });
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [slotDuration, setSlotDuration] = useState(30); // Durée des créneaux en minutes
  const [bufferTime, setBufferTime] = useState(15); // Temps entre les rendez-vous

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const handleTimeSlotUpdate = (id: string, field: 'startTime' | 'endTime', value: string) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const addBlockedDate = () => {
    if (newBlockedDate.date && newBlockedDate.reason) {
      setBlockedDates([
        ...blockedDates,
        {
          id: Date.now().toString(),
          date: newBlockedDate.date,
          reason: newBlockedDate.reason
        }
      ]);
      setNewBlockedDate({ date: '', reason: '' });
    }
  };

  const removeBlockedDate = (id: string) => {
    setBlockedDates(blockedDates.filter(d => d.id !== id));
  };

  const addBreakTime = (day: string) => {
    const newBreak: TimeSlot = {
      id: Date.now().toString(),
      day,
      startTime: '12:00',
      endTime: '13:00',
      isBreak: true
    };
    setTimeSlots([...timeSlots, newBreak]);
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  return (
    <div>
      <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-6">
        Gestion des Disponibilités
      </h2>

      {/* Paramètres généraux */}
      <div className="bg-[#fdfbf7] rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Paramètres des créneaux</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Durée des créneaux (minutes)
            </label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 heure</option>
              <option value={90}>1h30</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Temps de battement entre RDV (minutes)
            </label>
            <select
              value={bufferTime}
              onChange={(e) => setBufferTime(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={0}>Aucun</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Horaires d'ouverture */}
      <div className="bg-white rounded-xl border border-[#d4b5a0]/20 p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Horaires d'ouverture</h3>
        <div className="space-y-4">
          {daysOfWeek.map(day => {
            const daySlots = timeSlots.filter(slot => slot.day === day && !slot.isBreak);
            const dayBreaks = timeSlots.filter(slot => slot.day === day && slot.isBreak);
            const mainSlot = daySlots[0];

            return (
              <div key={day} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="w-24 font-medium text-[#2c3e50]">{day}</span>
                    
                    {mainSlot && mainSlot.startTime !== 'Fermé' ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#d4b5a0]" />
                          <input
                            type="time"
                            value={mainSlot.startTime}
                            onChange={(e) => handleTimeSlotUpdate(mainSlot.id, 'startTime', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded"
                          />
                          <span className="text-[#2c3e50]/60">à</span>
                          <input
                            type="time"
                            value={mainSlot.endTime}
                            onChange={(e) => handleTimeSlotUpdate(mainSlot.id, 'endTime', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded"
                          />
                        </div>

                        {/* Pauses */}
                        {dayBreaks.map(breakSlot => (
                          <div key={breakSlot.id} className="flex items-center gap-2 ml-4">
                            <span className="text-sm text-orange-600">Pause:</span>
                            <input
                              type="time"
                              value={breakSlot.startTime}
                              onChange={(e) => handleTimeSlotUpdate(breakSlot.id, 'startTime', e.target.value)}
                              className="px-2 py-1 border border-orange-300 rounded text-sm"
                            />
                            <span className="text-[#2c3e50]/60 text-sm">à</span>
                            <input
                              type="time"
                              value={breakSlot.endTime}
                              onChange={(e) => handleTimeSlotUpdate(breakSlot.id, 'endTime', e.target.value)}
                              className="px-2 py-1 border border-orange-300 rounded text-sm"
                            />
                            <button
                              onClick={() => removeTimeSlot(breakSlot.id)}
                              className="text-red-600 hover:bg-red-50 p-1 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </>
                    ) : (
                      <span className="text-[#2c3e50]/60">Fermé</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {mainSlot && mainSlot.startTime !== 'Fermé' && (
                      <button
                        onClick={() => addBreakTime(day)}
                        className="text-sm text-orange-600 hover:bg-orange-50 px-2 py-1 rounded"
                      >
                        + Pause
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (mainSlot && mainSlot.startTime !== 'Fermé') {
                          handleTimeSlotUpdate(mainSlot.id, 'startTime', 'Fermé');
                          handleTimeSlotUpdate(mainSlot.id, 'endTime', 'Fermé');
                        } else if (mainSlot) {
                          handleTimeSlotUpdate(mainSlot.id, 'startTime', '10:00');
                          handleTimeSlotUpdate(mainSlot.id, 'endTime', '19:00');
                        }
                      }}
                      className="text-sm text-[#d4b5a0] hover:bg-[#d4b5a0]/10 px-2 py-1 rounded"
                    >
                      {mainSlot && mainSlot.startTime !== 'Fermé' ? 'Fermer' : 'Ouvrir'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dates bloquées */}
      <div className="bg-white rounded-xl border border-[#d4b5a0]/20 p-6">
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Dates bloquées / Congés</h3>
        
        <div className="flex gap-2 mb-4">
          <input
            type="date"
            value={newBlockedDate.date}
            onChange={(e) => setNewBlockedDate({ ...newBlockedDate, date: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
            min={new Date().toISOString().split('T')[0]}
          />
          <input
            type="text"
            value={newBlockedDate.reason}
            onChange={(e) => setNewBlockedDate({ ...newBlockedDate, reason: e.target.value })}
            placeholder="Raison (ex: Congés, Formation...)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={addBlockedDate}
            className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {blockedDates.length === 0 ? (
            <p className="text-[#2c3e50]/60 text-center py-4">Aucune date bloquée</p>
          ) : (
            blockedDates.map(blocked => (
              <div key={blocked.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-[#2c3e50]">
                    {new Date(blocked.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="text-[#2c3e50]/60">- {blocked.reason}</span>
                </div>
                <button
                  onClick={() => removeBlockedDate(blocked.id)}
                  className="text-red-600 hover:bg-red-100 p-2 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="mt-8 flex justify-end">
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl hover:shadow-xl transition-all">
          <Save className="w-5 h-5" />
          Enregistrer les modifications
        </button>
      </div>
    </div>
  );
}