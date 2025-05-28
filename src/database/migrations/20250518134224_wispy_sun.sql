/*
  # Initial Schema Setup

  1. New Tables
    - `profiles`: User profile information
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `reading_speed` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `reading_sessions`: Records of reading sessions
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `text_id` (uuid)
      - `words_read` (integer)
      - `time_spent` (integer)
      - `wpm` (integer)
      - `created_at` (timestamp)
    
    - `reading_stats`: Aggregated reading statistics
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `avg_wpm` (integer)
      - `max_wpm` (integer)
      - `total_words_read` (integer)
      - `total_time_spent` (integer)
      - `sessions_completed` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read and update their own profile
      - Read and create their own reading sessions
      - Read and update their own reading stats
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  reading_speed integer DEFAULT 250,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reading_sessions table
CREATE TABLE IF NOT EXISTS public.reading_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  text_id uuid NOT NULL,
  words_read integer NOT NULL DEFAULT 0,
  time_spent integer NOT NULL DEFAULT 0,
  wpm integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create reading_stats table
CREATE TABLE IF NOT EXISTS public.reading_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  avg_wpm integer DEFAULT 0,
  max_wpm integer DEFAULT 0,
  total_words_read integer DEFAULT 0,
  total_time_spent integer DEFAULT 0,
  sessions_completed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_stats ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Reading sessions policies
CREATE POLICY "Users can read own reading sessions"
  ON public.reading_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reading sessions"
  ON public.reading_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Reading stats policies
CREATE POLICY "Users can read own reading stats"
  ON public.reading_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own reading stats"
  ON public.reading_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  
  INSERT INTO public.reading_stats (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile and stats on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();