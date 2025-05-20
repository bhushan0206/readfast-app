/*
  # Fix authentication and profile creation issues
  
  1. Updates
    - Add proper RLS policies for profiles table
    - Fix handle_new_user trigger function
    - Add proper error handling
    
  2. Security
    - Enable RLS on profiles table
    - Add policies for authenticated users
*/

-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "New users can create their profile" ON public.profiles;

-- Create policies for profile access
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

CREATE POLICY "New users can create their profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add social auth fields to profiles if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'social_provider') THEN
    ALTER TABLE public.profiles ADD COLUMN social_provider text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'social_id') THEN
    ALTER TABLE public.profiles ADD COLUMN social_id text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'theme_preference') THEN
    ALTER TABLE public.profiles ADD COLUMN theme_preference text DEFAULT 'light';
  END IF;
END $$;

-- Create or replace the profile creation trigger with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into profiles with proper error handling
  BEGIN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      social_provider,
      social_id,
      theme_preference,
      reading_speed,
      reading_level
    )
    VALUES (
      new.id,
      new.email,
      COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        'User ' || substr(new.id::text, 1, 8)
      ),
      COALESCE(new.raw_user_meta_data->>'provider', 'email'),
      new.raw_user_meta_data->>'sub',
      'light',
      200,
      'beginner'
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
  END;
  
  -- Insert into reading_stats with error handling
  BEGIN
    INSERT INTO public.reading_stats (user_id)
    VALUES (new.id);
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating reading stats for user %: %', new.id, SQLERRM;
    -- Don't return here, continue with the function
  END;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();