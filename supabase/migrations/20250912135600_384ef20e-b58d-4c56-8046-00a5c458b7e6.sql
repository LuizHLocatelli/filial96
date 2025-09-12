-- Create fretes table
CREATE TABLE public.fretes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cpf_cliente TEXT,
  nome_cliente TEXT NOT NULL,
  telefone TEXT NOT NULL,
  endereco_entrega TEXT NOT NULL,
  valor_total_nota DECIMAL(10,2),
  valor_frete DECIMAL(10,2) NOT NULL,
  pago BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Pendente de Entrega',
  nota_fiscal_url TEXT,
  itens JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fretes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all fretes" 
ON public.fretes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create fretes" 
ON public.fretes 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own fretes" 
ON public.fretes 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own fretes" 
ON public.fretes 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create updated_at trigger
CREATE TRIGGER update_fretes_updated_at
BEFORE UPDATE ON public.fretes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for nota fiscal images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('fretes', 'fretes', true);

-- Create storage policies
CREATE POLICY "Users can upload nota fiscal images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'fretes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view nota fiscal images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'fretes');

CREATE POLICY "Users can update their own nota fiscal images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'fretes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own nota fiscal images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'fretes' AND auth.uid()::text = (storage.foldername(name))[1]);