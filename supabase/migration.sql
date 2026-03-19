-- ============================================================
-- CRE8OR INFLUENCER MARKETPLACE - SUPABASE MIGRATION
-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE (Influencers)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Personal info
  name TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  instagram_username TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  age INTEGER,
  city TEXT DEFAULT '',
  country TEXT DEFAULT '',
  niche TEXT DEFAULT '',
  
  -- Stats
  followers INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0,
  
  -- Audience age distribution (percentages)
  audience_age_13_17 INTEGER DEFAULT 0,
  audience_age_18_24 INTEGER DEFAULT 0,
  audience_age_25_34 INTEGER DEFAULT 0,
  audience_age_35_44 INTEGER DEFAULT 0,
  audience_age_45_plus INTEGER DEFAULT 0,
  
  -- Audience gender distribution (percentages)
  audience_female INTEGER DEFAULT 50,
  audience_male INTEGER DEFAULT 50,
  
  -- Top 3 geographic markets (stored as JSONB array)
  top_markets JSONB DEFAULT '[{"city":"","country":""},{"city":"","country":""},{"city":"","country":""}]'::jsonb,
  
  -- Profile visibility
  is_verified BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- 2. COMPANIES TABLE (Businesses)
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  company_name TEXT NOT NULL DEFAULT '',
  industry TEXT DEFAULT '',
  description TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  website TEXT DEFAULT '',
  contact_email TEXT DEFAULT ''
);

-- ============================================================
-- 3. USER_TYPES TABLE (Track whether user is influencer or business)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_types (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('influencer', 'business')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. CONVERSATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Participants
  participant_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Last message preview
  last_message TEXT DEFAULT '',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(participant_1, participant_2)
);

-- ============================================================
-- 5. MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_niche ON profiles(niche);
CREATE INDEX IF NOT EXISTS idx_profiles_followers ON profiles(followers);
CREATE INDEX IF NOT EXISTS idx_profiles_engagement ON profiles(engagement_rate);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON conversations(participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(last_message_at DESC);

-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- PROFILES: Anyone can view public profiles, owners can edit
CREATE POLICY "Public profiles viewable by everyone"
  ON profiles FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- COMPANIES: Anyone can view, owners can edit
CREATE POLICY "Companies viewable by everyone"
  ON companies FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can update own company"
  ON companies FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own company"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = id);

-- USER_TYPES: Users can read their own, insert their own
CREATE POLICY "Users can read own type"
  ON user_types FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Anyone can read user types"
  ON user_types FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can insert own type"
  ON user_types FOR INSERT
  WITH CHECK (auth.uid() = id);

-- CONVERSATIONS: Participants can view their conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Participants can update conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- MESSAGES: Conversation participants can view/send messages
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can update read status"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

-- ============================================================
-- 8. FUNCTIONS
-- ============================================================

-- Function to update "updated_at" timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to get or create a conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(user1 UUID, user2 UUID)
RETURNS UUID AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Check if conversation exists (in either direction)
  SELECT id INTO conv_id FROM conversations
  WHERE (participant_1 = user1 AND participant_2 = user2)
     OR (participant_1 = user2 AND participant_2 = user1)
  LIMIT 1;
  
  -- If not, create it
  IF conv_id IS NULL THEN
    INSERT INTO conversations (participant_1, participant_2)
    VALUES (user1, user2)
    RETURNING id INTO conv_id;
  END IF;
  
  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count unread messages for a user
CREATE OR REPLACE FUNCTION get_unread_count(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count FROM messages m
  JOIN conversations c ON m.conversation_id = c.id
  WHERE (c.participant_1 = user_id OR c.participant_2 = user_id)
    AND m.sender_id != user_id
    AND m.is_read = FALSE;
  RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 9. STORAGE BUCKET FOR AVATARS & LOGOS
-- ============================================================
-- Run these separately if they fail (bucket might already exist):

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- 10. ENABLE REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- ============================================================
-- DONE! Your database is ready.
-- ============================================================
