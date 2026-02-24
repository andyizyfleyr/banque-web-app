-- Migration: Add messages table and is_admin flag
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL means message to/from System/Admin if not specified
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can see messages they sent or received
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
CREATE POLICY "Users can view their own messages" ON messages 
FOR SELECT USING (
  auth.uid() = sender_id 
  OR auth.uid() = receiver_id 
  OR (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);

-- Users can insert messages where they are the sender
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages 
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update is_read status of messages they received
DROP POLICY IF EXISTS "Users can mark messages as read" ON messages;
CREATE POLICY "Users can mark messages as read" ON messages 
FOR UPDATE USING (
  auth.uid() = receiver_id 
  OR (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);
