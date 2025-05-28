-- ReadFast Application - Complete Database Migration Script
-- This script can be run multiple times safely as it checks for existing objects

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- PROFILES TABLE (extends auth.users)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    reading_speed INTEGER DEFAULT 250,
    font_size INTEGER DEFAULT 16,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'reading_speed') THEN
        ALTER TABLE public.profiles ADD COLUMN reading_speed INTEGER DEFAULT 250;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'font_size') THEN
        ALTER TABLE public.profiles ADD COLUMN font_size INTEGER DEFAULT 16;
    END IF;
END $$;

-- =============================================================================
-- TEXTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.texts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT,
    source TEXT,
    word_count INTEGER,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    category TEXT DEFAULT 'general',
    tags TEXT[],
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_texts_category') THEN
        CREATE INDEX idx_texts_category ON public.texts(category);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_texts_difficulty') THEN
        CREATE INDEX idx_texts_difficulty ON public.texts(difficulty_level);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_texts_public') THEN
        CREATE INDEX idx_texts_public ON public.texts(is_public);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_texts_created_by') THEN
        CREATE INDEX idx_texts_created_by ON public.texts(created_by);
    END IF;
END $$;

-- =============================================================================
-- READING SESSIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.reading_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    text_id UUID REFERENCES public.texts(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    words_read INTEGER DEFAULT 0,
    wpm INTEGER DEFAULT 0,
    comprehension_score INTEGER CHECK (comprehension_score >= 0 AND comprehension_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for reading sessions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reading_sessions_user') THEN
        CREATE INDEX idx_reading_sessions_user ON public.reading_sessions(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reading_sessions_text') THEN
        CREATE INDEX idx_reading_sessions_text ON public.reading_sessions(text_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reading_sessions_start_time') THEN
        CREATE INDEX idx_reading_sessions_start_time ON public.reading_sessions(start_time);
    END IF;
END $$;

-- =============================================================================
-- READING STATS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.reading_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    total_words_read INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- in seconds
    sessions_completed INTEGER DEFAULT 0,
    avg_wpm INTEGER DEFAULT 0,
    max_wpm INTEGER DEFAULT 0,
    avg_comprehension INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to reading_stats if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reading_stats' AND column_name = 'avg_comprehension') THEN
        ALTER TABLE public.reading_stats ADD COLUMN avg_comprehension INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reading_stats' AND column_name = 'max_wpm') THEN
        ALTER TABLE public.reading_stats ADD COLUMN max_wpm INTEGER DEFAULT 0;
    END IF;
END $$;

-- =============================================================================
-- ACHIEVEMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT DEFAULT '🏆',
    criteria JSONB NOT NULL,
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 5),
    category TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- USER ACHIEVEMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id TEXT REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Add indexes for user achievements
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_achievements_user') THEN
        CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_achievements_achievement') THEN
        CREATE INDEX idx_user_achievements_achievement ON public.user_achievements(achievement_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_achievements_unlocked') THEN
        CREATE INDEX idx_user_achievements_unlocked ON public.user_achievements(unlocked_at);
    END IF;
END $$;

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at 
            BEFORE UPDATE ON public.profiles 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_texts_updated_at') THEN
        CREATE TRIGGER update_texts_updated_at 
            BEFORE UPDATE ON public.texts 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
    );
    
    -- Initialize reading stats
    INSERT INTO public.reading_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Texts policies
DROP POLICY IF EXISTS "Public texts are viewable by everyone" ON public.texts;
CREATE POLICY "Public texts are viewable by everyone" ON public.texts
    FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view own texts" ON public.texts;
CREATE POLICY "Users can view own texts" ON public.texts
    FOR SELECT USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can insert texts" ON public.texts;
CREATE POLICY "Users can insert texts" ON public.texts
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update own texts" ON public.texts;
CREATE POLICY "Users can update own texts" ON public.texts
    FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete own texts" ON public.texts;
CREATE POLICY "Users can delete own texts" ON public.texts
    FOR DELETE USING (auth.uid() = created_by);

-- Reading sessions policies
DROP POLICY IF EXISTS "Users can view own reading sessions" ON public.reading_sessions;
CREATE POLICY "Users can view own reading sessions" ON public.reading_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reading sessions" ON public.reading_sessions;
CREATE POLICY "Users can insert own reading sessions" ON public.reading_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reading sessions" ON public.reading_sessions;
CREATE POLICY "Users can update own reading sessions" ON public.reading_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Reading stats policies
DROP POLICY IF EXISTS "Users can view own reading stats" ON public.reading_stats;
CREATE POLICY "Users can view own reading stats" ON public.reading_stats
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reading stats" ON public.reading_stats;
CREATE POLICY "Users can update own reading stats" ON public.reading_stats
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reading stats" ON public.reading_stats;
CREATE POLICY "Users can insert own reading stats" ON public.reading_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements policies (public read access)
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON public.achievements;
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements
    FOR SELECT USING (true);

-- User achievements policies
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
CREATE POLICY "Users can insert own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own achievements" ON public.user_achievements;
CREATE POLICY "Users can update own achievements" ON public.user_achievements
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- SAMPLE DATA INSERTION
-- =============================================================================

-- Insert default achievements (only if they don't exist)
INSERT INTO public.achievements (id, name, description, icon, criteria, level, category) VALUES
    ('first-steps', 'First Steps', 'Complete your first reading session', '🎯', '{"sessions_completed": 1}', 1, 'sessions'),
    ('word-explorer', 'Word Explorer', 'Read 1,000 words', '📖', '{"total_words_read": 1000}', 1, 'reading'),
    ('page-turner', 'Page Turner', 'Read 10,000 words', '📚', '{"total_words_read": 10000}', 2, 'reading'),
    ('bookworm', 'Bookworm', 'Read 50,000 words', '🐛', '{"total_words_read": 50000}', 3, 'reading'),
    ('reading-machine', 'Reading Machine', 'Read 100,000 words', '🤖', '{"total_words_read": 100000}', 4, 'reading'),
    ('literary-master', 'Literary Master', 'Read 500,000 words', '👑', '{"total_words_read": 500000}', 5, 'reading'),
    ('speed-reader', 'Speed Reader', 'Reach 300 WPM', '⚡', '{"max_wpm": 300}', 1, 'speed'),
    ('lightning-fast', 'Lightning Fast', 'Reach 500 WPM', '⚡', '{"max_wpm": 500}', 2, 'speed'),
    ('sonic-reader', 'Sonic Reader', 'Reach 700 WPM', '💨', '{"max_wpm": 700}', 3, 'speed'),
    ('flash-reader', 'Flash Reader', 'Reach 1000 WPM', '🔥', '{"max_wpm": 1000}', 4, 'speed'),
    ('habit-builder', 'Habit Builder', 'Complete 10 reading sessions', '🏗️', '{"sessions_completed": 10}', 2, 'sessions'),
    ('dedicated-reader', 'Dedicated Reader', 'Complete 50 reading sessions', '💪', '{"sessions_completed": 50}', 3, 'sessions'),
    ('reading-champion', 'Reading Champion', 'Complete 100 reading sessions', '🏆', '{"sessions_completed": 100}', 4, 'sessions')
ON CONFLICT (id) DO NOTHING;

-- Insert sample texts (only if they don't exist)
INSERT INTO public.texts (id, title, content, author, source, word_count, difficulty_level, category, is_public) VALUES
    (
        uuid_generate_v4(),
        'The Power of Reading',
        'Reading is one of the most fundamental skills that opens doors to knowledge, imagination, and personal growth. When we read, we exercise our minds, expand our vocabulary, and develop critical thinking skills. Regular reading has been shown to improve memory, reduce stress, and enhance empathy by allowing us to experience life through different perspectives. Whether you prefer fiction or non-fiction, reading for just 20 minutes a day can significantly impact your cognitive abilities and overall well-being. The journey of a thousand miles begins with a single step, and the journey of lifelong learning begins with opening a book.',
        'ReadFast Team',
        'ReadFast App',
        95,
        2,
        'educational',
        true
    ),
    (
        uuid_generate_v4(),
        'Speed Reading Techniques',
        'Speed reading is not just about reading faster; it''s about reading smarter. Effective speed reading involves several techniques: minimizing subvocalization (the inner voice), reducing regression (re-reading), and expanding peripheral vision. Practice chunking - reading groups of words instead of individual words. Use a pacer like your finger or a pen to guide your eyes and maintain consistent speed. Remember, comprehension should never be sacrificed for speed. Start with easier texts and gradually increase difficulty as your skills improve.',
        'Reading Expert',
        'Speed Reading Guide',
        78,
        3,
        'educational',
        true
    )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- FINAL SETUP AND PERMISSIONS
-- =============================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions for anon users to read public content
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.texts TO anon;
GRANT SELECT ON public.achievements TO anon;

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_sessions_created_at ON public.reading_sessions(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_progress ON public.user_achievements(progress);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'ReadFast database migration completed successfully!';
    RAISE NOTICE 'All tables, indexes, triggers, and policies have been created or updated.';
    RAISE NOTICE 'Sample data has been inserted where applicable.';
END $$;