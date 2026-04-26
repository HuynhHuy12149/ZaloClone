-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view groups they are in" ON public.groups;

-- Group Policies
-- Fix the column shadowing bug by explicitly referencing groups.id
CREATE POLICY "Users can view groups they are in"
    ON public.groups
    FOR SELECT
    TO authenticated
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = groups.id AND gm.user_id = auth.uid()
        )
    );
