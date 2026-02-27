-- Update AI Assistants policies to allow 'gerente' full access

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can update their own assistants" ON public.ai_assistants;
DROP POLICY IF EXISTS "Users can delete their own assistants" ON public.ai_assistants;

-- Create new policy for UPDATE allowing owner OR gerente
CREATE POLICY "Users can update their own assistants or gerentes can update any" 
ON public.ai_assistants 
FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'gerente'
  )
);

-- Create new policy for DELETE allowing owner OR gerente
CREATE POLICY "Users can delete their own assistants or gerentes can delete any" 
ON public.ai_assistants 
FOR DELETE 
TO authenticated 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'gerente'
  )
);