-- Create messages table for meeting chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read messages from their meetings
CREATE POLICY "Users can view messages in meetings they're in"
ON public.messages
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert messages
CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create screen sharing sessions table
CREATE TABLE public.screen_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_key TEXT NOT NULL UNIQUE,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  host_email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS
ALTER TABLE public.screen_shares ENABLE ROW LEVEL SECURITY;

-- Allow users to view active screen shares
CREATE POLICY "Users can view active screen shares"
ON public.screen_shares
FOR SELECT
TO authenticated
USING (is_active = true);

-- Allow users to create their own screen shares
CREATE POLICY "Users can create screen shares"
ON public.screen_shares
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = host_id);

-- Allow users to update their own screen shares
CREATE POLICY "Users can update their screen shares"
ON public.screen_shares
FOR UPDATE
TO authenticated
USING (auth.uid() = host_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create index for faster queries
CREATE INDEX idx_messages_meeting_id ON public.messages(meeting_id, created_at DESC);
CREATE INDEX idx_screen_shares_key ON public.screen_shares(share_key) WHERE is_active = true;