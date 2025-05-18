-- Add new columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'light',
ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_notifications_enabled boolean DEFAULT false;

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to texts table
ALTER TABLE public.texts
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS reading_time integer,
ADD COLUMN IF NOT EXISTS summary text,
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en',
ADD COLUMN IF NOT EXISTS likes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares integer DEFAULT 0;

-- Enable RLS on push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for push_subscriptions
CREATE POLICY "Users can manage their own subscriptions"
  ON public.push_subscriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update text reading time
CREATE OR REPLACE FUNCTION calculate_reading_time() 
RETURNS TRIGGER AS $$
BEGIN
  -- Estimate reading time based on word count (assuming 200 words per minute)
  NEW.reading_time := CEIL(array_length(regexp_split_to_array(NEW.content, '\s+'), 1) / 200.0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for calculating reading time
CREATE TRIGGER update_reading_time
  BEFORE INSERT OR UPDATE OF content
  ON public.texts
  FOR EACH ROW
  EXECUTE FUNCTION calculate_reading_time();