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
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          reading_speed: number
          font_size: number
          theme: string
          reading_level: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          reading_speed?: number
          font_size?: number
          theme?: string
          reading_level?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          reading_speed?: number
          font_size?: number
          theme?: string
          reading_level?: string
        }
      }
      texts: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
          title: string
          content: string
          category: string | null
          difficulty: number
          is_custom: boolean
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id?: string | null
          title: string
          content: string
          category?: string | null
          difficulty?: number
          is_custom?: boolean
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string | null
          title?: string
          content?: string
          category?: string | null
          difficulty?: number
          is_custom?: boolean
          metadata?: Json | null
        }
      }
      reading_sessions: {
        Row: {
          id: string
          created_at: string
          user_id: string
          text_id: string
          start_time: string
          end_time: string | null
          words_read: number
          wpm: number
          comprehension_score: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          text_id: string
          start_time: string
          end_time?: string | null
          words_read: number
          wpm: number
          comprehension_score?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          text_id?: string
          start_time?: string
          end_time?: string | null
          words_read?: number
          wpm?: number
          comprehension_score?: number | null
        }
      }
      reading_stats: {
        Row: {
          id: string
          created_at: string
          user_id: string
          avg_wpm: number
          max_wpm: number
          total_words_read: number
          total_time_spent: number
          avg_comprehension: number | null
          sessions_completed: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          avg_wpm?: number
          max_wpm?: number
          total_words_read?: number
          total_time_spent?: number
          avg_comprehension?: number | null
          sessions_completed?: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          avg_wpm?: number
          max_wpm?: number
          total_words_read?: number
          total_time_spent?: number
          avg_comprehension?: number | null
          sessions_completed?: number
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          criteria: Json
          icon: string
          level: number
        }
        Insert: {
          id?: string
          name: string
          description: string
          criteria: Json
          icon: string
          level: number
        }
        Update: {
          id?: string
          name?: string
          description?: string
          criteria?: Json
          icon?: string
          level?: number
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
          progress: number
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at: string
          progress: number
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
          progress?: number
        }
      }
    }
  }
}