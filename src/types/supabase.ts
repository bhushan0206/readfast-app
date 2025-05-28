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
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          reading_level: string | null
          reading_speed: number | null
          social_id: string | null
          oauth_provider: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          reading_level?: string | null
          reading_speed?: number | null
          social_id?: string | null
          oauth_provider?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          reading_level?: string | null
          reading_speed?: number | null
          social_id?: string | null
          oauth_provider?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      texts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          is_custom: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reading_stats: {
        Row: {
          id: string
          user_id: string
          total_words_read: number
          total_time_reading: number
          average_wpm: number
          sessions_completed: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_words_read?: number
          total_time_reading?: number
          average_wpm?: number
          sessions_completed?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_words_read?: number
          total_time_reading?: number
          average_wpm?: number
          sessions_completed?: number
          created_at?: string
          updated_at?: string
        }
      }
      reading_sessions: {
        Row: {
          id: string
          user_id: string
          text_id: string
          wpm: number
          accuracy: number
          duration: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          text_id: string
          wpm: number
          accuracy: number
          duration: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          text_id?: string
          wpm?: number
          accuracy?: number
          duration?: number
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          requirement: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          requirement: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          requirement?: number
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
      }
    }
  }
}