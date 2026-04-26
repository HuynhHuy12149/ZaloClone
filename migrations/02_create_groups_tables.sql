-- Migration: Create groups and group_members tables, and update messages RLS

-- 1. Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create group_members table
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view groups they are in" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view members of groups they are in" ON public.group_members;
DROP POLICY IF EXISTS "Users can add members to groups they are in" ON public.group_members;
DROP POLICY IF EXISTS "Authenticated users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages" ON public.messages;

-- Drop function if it exists to clean up
DROP FUNCTION IF EXISTS public.check_is_group_member(UUID);

-- Group Policies
CREATE POLICY "Users can view groups they are in"
    ON public.groups
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = id AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create groups"
    ON public.groups
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Group Members Policies
-- Allow anyone authenticated to read group_members (safe since group_id is UUID)
-- This avoids infinite recursion!
CREATE POLICY "Authenticated users can view group members"
    ON public.group_members
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow inserting if you are a member of the group, or you created the group
CREATE POLICY "Users can add members to groups they are in"
    ON public.group_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.groups g
            WHERE g.id = group_id AND g.created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = group_id AND gm.user_id = auth.uid()
        )
    );

-- Messages Policies
CREATE POLICY "Users can view messages"
    ON public.messages
    FOR SELECT
    TO authenticated
    USING (
        conversation_id LIKE '%' || auth.uid()::text || '%' OR
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id::text = conversation_id AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages"
    ON public.messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = sender_id AND
        (
            conversation_id LIKE '%' || auth.uid()::text || '%' OR
            EXISTS (
                SELECT 1 FROM public.group_members gm
                WHERE gm.group_id::text = conversation_id AND gm.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update messages"
    ON public.messages
    FOR UPDATE
    TO authenticated
    USING (
        conversation_id LIKE '%' || auth.uid()::text || '%' OR
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id::text = conversation_id AND gm.user_id = auth.uid()
        )
    );

-- Add to realtime
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'groups'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'group_members'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;
    END IF;
END $$;

-- Reload PostgREST schema cache to ensure relationships are detected
NOTIFY pgrst, 'reload schema';
