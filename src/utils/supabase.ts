import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle() // Use maybeSingle() instead of single()

    if (error) throw error

    return {
      data,
      error: data ? null : new Error('Profile not found')
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return {
      data: null,
      error
    }
  }
}
