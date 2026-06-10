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
          is_vip: boolean
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
          is_vip?: boolean
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
          is_vip?: boolean
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
          is_bump_product: boolean | null
          bump_price: number | null
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
          is_bump_product?: boolean | null
          bump_price?: number | null
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
          is_bump_product?: boolean | null
          bump_price?: number | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_ebooks: {
        Row: {
          id: string
          user_id: string
          ebook_id: string
          source: string
          purchased_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ebook_id: string
          source?: string
          purchased_at?: string
        }
        Update: {
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_ebooks_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_ebooks_ebook_id_fkey'
            columns: ['ebook_id']
            referencedRelation: 'ebooks'
            referencedColumns: ['id']
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string | null
          customer_email: string | null
          customer_name: string | null
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
          user_id?: string | null
          customer_email?: string | null
          customer_name?: string | null
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
          user_id?: string | null
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
      marketplace_products: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          category: string
          price: number
          original_price: number | null
          cover_url: string | null
          product_url: string
          ebook_id: string | null
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
          price?: number
          original_price?: number | null
          cover_url?: string | null
          product_url: string
          ebook_id?: string | null
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
          price?: number
          original_price?: number | null
          cover_url?: string | null
          product_url?: string
          ebook_id?: string | null
          is_published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      pixel_events: {
        Row: {
          id: string
          event_type: string
          user_email: string | null
          user_id: string | null
          session_id: string | null
          event_data: Json | null
          created_at: string
          page_url: string | null
        }
        Insert: {
          id?: string
          event_type: string
          user_email?: string | null
          user_id?: string | null
          session_id?: string | null
          event_data?: Json | null
          created_at?: string
          page_url?: string | null
        }
        Update: {
          event_type?: string
          user_email?: string | null
          user_id?: string | null
          session_id?: string | null
          event_data?: Json | null
          page_url?: string | null
        }
        Relationships: []
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
