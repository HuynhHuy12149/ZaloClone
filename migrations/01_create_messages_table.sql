-- Migration: Create messages table for Chat feature

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add index on conversation_id for faster lookups since we query by this field
CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON public.messages(conversation_id);

-- Enable Row Level Security (RLS) for privacy
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read messages in their conversations
-- Since we structured conversation_id as "uuid1-uuid2", we check if the user's ID is in the conversation_id string
CREATE POLICY "Users can view messages in their conversations"
    ON public.messages
    FOR SELECT
    USING (
        conversation_id LIKE '%' || auth.uid()::text || '%'
    );

-- Create policy to allow users to insert messages
CREATE POLICY "Users can insert messages"
    ON public.messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND conversation_id LIKE '%' || auth.uid()::text || '%'
    );

-- Create policy to allow users to update messages (like marking as read)
CREATE POLICY "Users can update messages in their conversations"
    ON public.messages
    FOR UPDATE
    USING (
        conversation_id LIKE '%' || auth.uid()::text || '%'
    );

-- Add messages table to Supabase Realtime to allow listening to new messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
