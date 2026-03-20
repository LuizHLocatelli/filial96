-- Add temperature_level to ai_assistants
ALTER TABLE public.ai_assistants 
ADD COLUMN IF NOT EXISTS temperature_level TEXT NOT NULL DEFAULT 'medium' 
CHECK (temperature_level IN ('low', 'medium', 'high'));
