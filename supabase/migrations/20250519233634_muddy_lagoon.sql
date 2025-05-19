/*
  # Add social authentication and theme preferences

  1. Updates
    - Add social auth fields to profiles table
    - Add theme preferences
    - Add trigger for profile creation on signup
*/

-- Add social auth fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS social_provider text,
ADD COLUMN IF NOT EXISTS social_id text,
ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'light';

-- Create or replace the profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
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
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
    new.raw_user_meta_data->>'provider',
    new.raw_user_meta_data->>'sub',
    'light',
    200,
    'beginner'
  );
  
  INSERT INTO public.reading_stats (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();