export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nom: string
          prenom: string
          telephone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          nom: string
          prenom: string
          telephone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nom?: string
          prenom?: string
          telephone?: string
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          user_id: string
          service: string
          date: string
          heure: string
          duree: number
          prix: number
          status: 'confirmee' | 'annulee' | 'terminee'
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service: string
          date: string
          heure: string
          duree: number
          prix: number
          status?: 'confirmee' | 'annulee' | 'terminee'
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service?: string
          date?: string
          heure?: string
          duree?: number
          prix?: number
          status?: 'confirmee' | 'annulee' | 'terminee'
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          nom: string
          description: string
          duree: number
          prix: number
          actif: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nom: string
          description: string
          duree: number
          prix: number
          actif?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nom?: string
          description?: string
          duree?: number
          prix?: number
          actif?: boolean
          created_at?: string
        }
      }
    }
  }
}