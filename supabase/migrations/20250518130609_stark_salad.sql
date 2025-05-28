/*
  # Database schema for ReadFast application

  1. New Tables
    - `profiles` - User profile information including reading preferences
    - `texts` - Reading texts content, both system-provided and custom
    - `reading_sessions` - Records of user reading sessions
    - `reading_stats` - Aggregated reading statistics per user
    - `achievements` - Achievement types and criteria
    - `user_achievements` - User's unlocked achievements and progress
  
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  reading_speed int DEFAULT 200,
  font_size int DEFAULT 18,
  theme text DEFAULT 'light',
  reading_level text DEFAULT 'beginner'
);

-- Create texts table
CREATE TABLE IF NOT EXISTS texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text,
  difficulty int DEFAULT 3,
  is_custom boolean DEFAULT false,
  metadata jsonb
);

-- Create reading sessions table
CREATE TABLE IF NOT EXISTS reading_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  text_id uuid NOT NULL REFERENCES texts ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  words_read int NOT NULL,
  wpm int NOT NULL,
  comprehension_score int
);

-- Create reading stats table
CREATE TABLE IF NOT EXISTS reading_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  avg_wpm int DEFAULT 0,
  max_wpm int DEFAULT 0,
  total_words_read int DEFAULT 0,
  total_time_spent int DEFAULT 0,
  avg_comprehension int,
  sessions_completed int DEFAULT 0
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  criteria jsonb NOT NULL,
  icon text NOT NULL,
  level int NOT NULL
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements ON DELETE CASCADE,
  unlocked_at timestamptz,
  progress int DEFAULT 0,
  UNIQUE (user_id, achievement_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Texts policies
CREATE POLICY "Anyone can view texts"
  ON texts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own custom texts"
  ON texts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_custom = true);

CREATE POLICY "Users can update their own custom texts"
  ON texts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_custom = true);

CREATE POLICY "Users can delete their own custom texts"
  ON texts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND is_custom = true);

-- Reading sessions policies
CREATE POLICY "Users can view their own reading sessions"
  ON reading_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading sessions"
  ON reading_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Reading stats policies
CREATE POLICY "Users can view their own reading stats"
  ON reading_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading stats"
  ON reading_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading stats"
  ON reading_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Anyone can view achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON user_achievements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create default achievements
INSERT INTO achievements (name, description, criteria, icon, level) VALUES
('Word Explorer', 'Read your first 5,000 words', '{"total_words_read": 5000}', '📚', 1),
('Book Worm', 'Read 25,000 words', '{"total_words_read": 25000}', '📚', 2),
('Bookish Soul', 'Read 100,000 words', '{"total_words_read": 100000}', '📚', 3),
('Speed Reader', 'Reach a reading speed of 300 WPM', '{"max_wpm": 300}', '⚡', 1),
('Speed Demon', 'Reach a reading speed of 500 WPM', '{"max_wpm": 500}', '⚡', 2),
('Reading Machine', 'Reach a reading speed of 700 WPM', '{"max_wpm": 700}', '⚡', 3),
('Beginner Reader', 'Complete 5 reading sessions', '{"sessions_completed": 5}', '🏆', 1),
('Dedicated Reader', 'Complete 20 reading sessions', '{"sessions_completed": 20}', '🏆', 2),
('Master Reader', '', '{"sessions_completed": 50}', '🏆', 3);

-- Create sample texts
INSERT INTO texts (title, content, category, difficulty, is_custom) VALUES
('The Benefits of Reading', 'Reading is one of the most rewarding activities that humans can engage in. Not only does it provide entertainment and an escape from reality, but it also offers numerous cognitive benefits. Regular reading has been shown to improve vocabulary, enhance empathy, reduce stress, and even potentially stave off age-related cognitive decline. When we read, we are forced to concentrate and focus, which helps improve our attention span in an age of constant digital distractions. Additionally, reading exposes us to new ideas, perspectives, and knowledge, expanding our understanding of the world. Whether it''s fiction that transports us to imaginary worlds or non-fiction that teaches us about real-world topics, reading enriches our minds and lives in countless ways. So, the next time you have some free time, consider picking up a book instead of scrolling through social media - your brain will thank you!', 'Education', 2, false),

('The Art of Speed Reading', 'Speed reading is a collection of techniques used to increase reading speed without significantly compromising comprehension. With practice, most people can double or even triple their reading speed while maintaining good retention of the material. The average adult reads at about 250 words per minute, but speed readers can achieve 700 words per minute or more. Some key techniques include minimizing subvocalization (the habit of pronouncing words in your head as you read), reducing regression (going back to re-read text), and expanding your peripheral vision to take in more words at once. Another important aspect is previewing the material before reading in depth, which provides context and helps your brain process information more efficiently. Many successful speed readers also use their finger or a pointer to guide their eyes down the page, which helps maintain focus and rhythm. While speed reading isn''t appropriate for all types of reading (poetry and technical materials often require slower, more deliberate reading), it can be an invaluable skill for processing large volumes of information in our increasingly text-heavy world.', 'Education', 3, false),

('The History of Books', 'The history of books spans thousands of years, evolving from ancient clay tablets to modern digital e-readers. The first known books were the clay tablets of Mesopotamia and the papyrus rolls of Egypt, created as early as 3000 BCE. The ancient Egyptians developed papyrus scrolls, while the Romans popularized the codex—bound pages similar to modern books. After the fall of Rome, book production became centered in monasteries, where monks meticulously copied texts by hand, often embellishing them with beautiful illustrations known as illuminations. This changed dramatically with Johannes Gutenberg''s invention of the printing press with movable type around 1450 CE, which revolutionized book production and dramatically increased literacy rates across Europe. The Industrial Revolution brought mechanized printing processes, further reducing the cost of books and making them accessible to the masses. The 20th century saw paperbacks become popular, making books even more affordable and portable. Now, in the digital age, e-books and audiobooks offer new ways to consume written content, though physical books remain enduringly popular. Throughout this evolution, books have remained one of humanity''s most important tools for preserving and transmitting knowledge, stories, and ideas across generations.', 'History', 3, false);

-- Create function to update profiles updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to update reading stats when a new session is added
CREATE OR REPLACE FUNCTION update_reading_stats_after_session()
RETURNS TRIGGER AS $$
DECLARE
  existing_stats record;
  avg_wpm_value int;
  max_wpm_value int;
BEGIN
  -- Get existing stats or initialize new record
  SELECT * INTO existing_stats FROM reading_stats WHERE user_id = NEW.user_id;
  
  IF NOT FOUND THEN
    -- Insert new stats record if none exists
    INSERT INTO reading_stats (
      user_id,
      avg_wpm,
      max_wpm,
      total_words_read,
      total_time_spent,
      sessions_completed
    ) VALUES (
      NEW.user_id,
      NEW.wpm,
      NEW.wpm,
      NEW.words_read,
      EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)),
      1
    );
  ELSE
    -- Calculate new values
    avg_wpm_value := ((existing_stats.avg_wpm * existing_stats.sessions_completed) + NEW.wpm) / (existing_stats.sessions_completed + 1);
    max_wpm_value := GREATEST(existing_stats.max_wpm, NEW.wpm);
    
    -- Update existing stats
    UPDATE reading_stats
    SET 
      avg_wpm = avg_wpm_value,
      max_wpm = max_wpm_value,
      total_words_read = existing_stats.total_words_read + NEW.words_read,
      total_time_spent = existing_stats.total_time_spent + EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)),
      avg_comprehension = CASE
        WHEN NEW.comprehension_score IS NULL THEN existing_stats.avg_comprehension
        WHEN existing_stats.avg_comprehension IS NULL THEN NEW.comprehension_score
        ELSE ((existing_stats.avg_comprehension * existing_stats.sessions_completed) + NEW.comprehension_score) / (existing_stats.sessions_completed + 1)
      END,
      sessions_completed = existing_stats.sessions_completed + 1
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_after_session
AFTER INSERT ON reading_sessions
FOR EACH ROW
EXECUTE FUNCTION update_reading_stats_after_session();