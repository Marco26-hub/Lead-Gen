export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_flags: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      jobs: {
        Row: {
          attempts: number
          created_at: string
          id: string
          last_error: string | null
          lead_id: string | null
          payload: Json
          run_after: string
          status: Database["public"]["Enums"]["job_status"]
          type: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          lead_id?: string | null
          payload?: Json
          run_after?: string
          status?: Database["public"]["Enums"]["job_status"]
          type: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          lead_id?: string | null
          payload?: Json
          run_after?: string
          status?: Database["public"]["Enums"]["job_status"]
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          business_name: string
          category: string | null
          consent_basis: string | null
          created_at: string
          demo_url: string | null
          domain: string | null
          email: string | null
          email_eligible: boolean
          http_status: number | null
          id: string
          outreach_channel: Database["public"]["Enums"]["channel_t"] | null
          page_model: Json | null
          phone_e164: string | null
          place_id: string
          priority: Database["public"]["Enums"]["priority_t"] | null
          rating: number | null
          reachable: boolean | null
          review_count: number | null
          reviews: Json
          sent_at: string | null
          site_age_class: Database["public"]["Enums"]["site_age_class"] | null
          slug: string | null
          status: Database["public"]["Enums"]["lead_status"]
          tech_stack: Json
          unsubscribe_token: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          category?: string | null
          consent_basis?: string | null
          created_at?: string
          demo_url?: string | null
          domain?: string | null
          email?: string | null
          email_eligible?: boolean
          http_status?: number | null
          id?: string
          outreach_channel?: Database["public"]["Enums"]["channel_t"] | null
          page_model?: Json | null
          phone_e164?: string | null
          place_id: string
          priority?: Database["public"]["Enums"]["priority_t"] | null
          rating?: number | null
          reachable?: boolean | null
          review_count?: number | null
          reviews?: Json
          sent_at?: string | null
          site_age_class?: Database["public"]["Enums"]["site_age_class"] | null
          slug?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tech_stack?: Json
          unsubscribe_token?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          category?: string | null
          consent_basis?: string | null
          created_at?: string
          demo_url?: string | null
          domain?: string | null
          email?: string | null
          email_eligible?: boolean
          http_status?: number | null
          id?: string
          outreach_channel?: Database["public"]["Enums"]["channel_t"] | null
          page_model?: Json | null
          phone_e164?: string | null
          place_id?: string
          priority?: Database["public"]["Enums"]["priority_t"] | null
          rating?: number | null
          reachable?: boolean | null
          review_count?: number | null
          reviews?: Json
          sent_at?: string | null
          site_age_class?: Database["public"]["Enums"]["site_age_class"] | null
          slug?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tech_stack?: Json
          unsubscribe_token?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      outreach_events: {
        Row: {
          channel: Database["public"]["Enums"]["channel_t"]
          error: string | null
          id: string
          lead_id: string
          provider_message_id: string | null
          spam_complaint: boolean
          status: string | null
          template: string | null
          ts: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["channel_t"]
          error?: string | null
          id?: string
          lead_id: string
          provider_message_id?: string | null
          spam_complaint?: boolean
          status?: string | null
          template?: string | null
          ts?: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["channel_t"]
          error?: string | null
          id?: string
          lead_id?: string
          provider_message_id?: string | null
          spam_complaint?: boolean
          status?: string | null
          template?: string | null
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "outreach_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      unsubscribes: {
        Row: {
          email: string | null
          id: string
          phone: string | null
          source: string | null
          ts: string
        }
        Insert: {
          email?: string | null
          id?: string
          phone?: string | null
          source?: string | null
          ts?: string
        }
        Update: {
          email?: string | null
          id?: string
          phone?: string | null
          source?: string | null
          ts?: string
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
      channel_t: "email" | "whatsapp"
      job_status: "pending" | "claimed" | "done" | "error"
      lead_status:
        | "scraped"
        | "enriched"
        | "classified"
        | "generated"
        | "deployed"
        | "approved"
        | "queued_outreach"
        | "contacted"
        | "replied"
        | "unsubscribed"
        | "bounced"
        | "suppressed"
      priority_t: "high" | "medium" | "low"
      site_age_class: "none" | "old" | "modern"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
