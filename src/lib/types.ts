export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number // en minutes
  category: 'soin' | 'therapie' | 'special'
}

export interface Appointment {
  id: string
  client_id: string
  client_name: string
  client_email: string
  client_phone: string
  service_id: string
  service_name: string
  date: string
  time: string
  status: 'confirme' | 'annule' | 'en-attente'
  created_at: string
  notes?: string
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: 'client' | 'admin'
  created_at: string
  points_fidelite?: number
}

export interface Availability {
  id: string
  date: string
  time_slots: string[]
  is_available: boolean
}