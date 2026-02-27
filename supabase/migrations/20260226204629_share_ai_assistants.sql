-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can manage their own assistants" ON public.ai_assistants;

-- Create new policies to share assistants while protecting edits/deletes
CREATE POLICY "Authenticated users can view all assistants" 
ON public.ai_assistants 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can create assistants" 
ON public.ai_assistants 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assistants" 
ON public.ai_assistants 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assistants" 
ON public.ai_assistants 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);