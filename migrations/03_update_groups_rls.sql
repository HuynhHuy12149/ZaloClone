-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view groups they are in" ON public.groups;

-- Group Policies
-- We add `created_by = auth.uid()` so that the user who creates the group 
-- can immediately SELECT it back when using .insert().select() in Supabase.
CREATE POLICY "Users can view groups they are in"
    ON public.groups
    FOR SELECT
    TO authenticated
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = id AND gm.user_id = auth.uid()
        )
    );
