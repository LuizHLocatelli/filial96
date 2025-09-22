-- Create table for AI chatbot assistants
CREATE TABLE public.assistentes_chatbots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assistentes_chatbots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "All authenticated users can view active chatbots"
ON public.assistentes_chatbots
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Managers can manage all chatbots"
ON public.assistentes_chatbots
FOR ALL
TO authenticated
USING (is_user_manager())
WITH CHECK (is_user_manager());

-- Create table for chat conversations
CREATE TABLE public.assistentes_conversas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.assistentes_chatbots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for conversations
ALTER TABLE public.assistentes_conversas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for conversations
CREATE POLICY "Users can view their own conversations"
ON public.assistentes_conversas
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own conversations"
ON public.assistentes_conversas
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own conversations"
ON public.assistentes_conversas
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Managers can view all conversations"
ON public.assistentes_conversas
FOR SELECT
TO authenticated
USING (is_user_manager());

-- Create update trigger for assistentes_chatbots
CREATE TRIGGER update_assistentes_chatbots_updated_at
BEFORE UPDATE ON public.assistentes_chatbots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create update trigger for assistentes_conversas
CREATE TRIGGER update_assistentes_conversas_updated_at
BEFORE UPDATE ON public.assistentes_conversas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();