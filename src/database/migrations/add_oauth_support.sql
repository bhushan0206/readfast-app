-- Update OAuth support using existing social_id column
-- This migration uses the existing social_id field for OAuth integration

-- Add oauth_provider column if it doesn't exist (to track which provider)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS oauth_provider TEXT;

-- Add indexes for OAuth lookups
CREATE INDEX IF NOT EXISTS idx_profiles_oauth_provider ON profiles(oauth_provider);
CREATE INDEX IF NOT EXISTS idx_profiles_social_id ON profiles(social_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add constraint to ensure OAuth provider and social_id are paired when using OAuth
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_oauth_complete'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT check_oauth_complete 
        CHECK (
          (oauth_provider IS NULL) OR 
          (oauth_provider IS NOT NULL AND social_id IS NOT NULL)
        );
    END IF;
END $$;