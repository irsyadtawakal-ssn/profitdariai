// Manual type definitions — replace with `pnpm supabase gen types typescript` after project setup

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'member' | 'admin'
          membership_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'member' | 'admin'
          membership_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'member' | 'admin'
          membership_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          category: string
          thumbnail_url: string | null
          is_published: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          category: string
          thumbnail_url?: string | null
          is_published?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          title?: string
          description?: string | null
          category?: string
          thumbnail_url?: string | null
          is_published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      course_modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          video_url: string
          duration_seconds: number | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          video_url: string
          duration_seconds?: number | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          course_id?: string
          title?: string
          description?: string | null
          video_url?: string
          duration_seconds?: number | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: 'course_modules_course_id_fkey'
            columns: ['course_id']
            referencedRelation: 'courses'
            referencedColumns: ['id']
          }
        ]
      }
      ebooks: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          category: string
          cover_url: string | null
          file_path: string
          page_count: number | null
          is_published: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          category: string
          cover_url?: string | null
          file_path: string
          page_count?: number | null
          is_published?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          title?: string
          description?: string | null
          category?: string
          cover_url?: string | null
          file_path?: string
          page_count?: number | null
          is_published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          tripay_reference: string
          merchant_ref: string
          amount: number
          payment_method: string
          status: 'UNPAID' | 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUND'
          paid_at: string | null
          expires_at: string
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tripay_reference: string
          merchant_ref: string
          amount: number
          payment_method: string
          status?: 'UNPAID' | 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUND'
          paid_at?: string | null
          expires_at: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'UNPAID' | 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUND'
          paid_at?: string | null
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
