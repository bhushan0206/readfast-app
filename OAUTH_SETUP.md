# OAuth Account Linking Setup

This update adds support for linking existing email/password accounts with Google OAuth when users sign in with Google using the same email address.

## Database Migration Required

Run the following SQL in your Supabase SQL Editor to add OAuth support:

```sql
-- Add oauth_provider column if it doesn't exist (to track which provider)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS oauth_provider TEXT;

-- Add email column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add reading level and speed if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS reading_level TEXT DEFAULT 'intermediate',
ADD COLUMN IF NOT EXISTS reading_speed INTEGER DEFAULT 250;

-- Add indexes for OAuth lookups
CREATE INDEX IF NOT EXISTS idx_profiles_oauth_provider ON profiles(oauth_provider);
CREATE INDEX IF NOT EXISTS idx_profiles_social_id ON profiles(social_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add constraint to ensure OAuth provider and social_id are paired when using OAuth
ALTER TABLE profiles 
ADD CONSTRAINT check_oauth_complete 
CHECK (
  (oauth_provider IS NULL) OR 
  (oauth_provider IS NOT NULL AND social_id IS NOT NULL)
);
```

## How It Works

1. **First-time Google Sign-in**: Creates a new profile with OAuth information
2. **Existing Email Match**: If a user with the same email exists:
   - Links the Google OAuth to the existing profile using `social_id`
   - Preserves all existing user data (reading stats, preferences, etc.)
   - Updates the profile with OAuth provider information
3. **Subsequent Sign-ins**: Uses the linked account seamlessly

## Database Schema

- **`social_id`**: Existing column used to store OAuth user ID
- **`oauth_provider`**: New column to track which OAuth provider (google, facebook, etc.)
- **Email matching**: Links accounts based on email address
- **Data preservation**: All existing profile data is maintained

## Features

- ✅ **Uses Existing Schema**: Leverages your existing `social_id` column
- ✅ **Account Linking**: Automatically links Google OAuth with existing email accounts
- ✅ **Data Preservation**: Keeps all existing user progress and settings
- ✅ **Seamless Experience**: Users can switch between email/password and Google sign-in
- ✅ **Profile Merging**: Combines OAuth profile data (avatar, name) with existing data
- ✅ **Error Handling**: Graceful fallback if linking fails

## User Experience

1. User creates account with email/password
2. User later tries to sign in with Google using same email
3. System automatically links the accounts
4. User sees success message: "Successfully signed in with Google"
5. All previous data (stats, preferences) is preserved
6. User can now use either sign-in method

## Security

- OAuth provider information is stored securely
- Email validation ensures proper account matching
- RLS policies updated to handle OAuth users
- Audit trail maintained with created_at/updated_at timestamps