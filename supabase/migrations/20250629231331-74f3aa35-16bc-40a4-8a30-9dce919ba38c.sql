
-- Create cartaz_folders table
CREATE TABLE IF NOT EXISTS public.cartaz_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create cartazes table
CREATE TABLE IF NOT EXISTS public.cartazes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar NOT NULL,
  file_url text NOT NULL,
  file_type varchar NOT NULL CHECK (file_type IN ('pdf', 'image')),
  folder_id uuid REFERENCES public.cartaz_folders(id) ON DELETE SET NULL,
  position integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cartaz_folders_created_by ON public.cartaz_folders(created_by);
CREATE INDEX IF NOT EXISTS idx_cartaz_folders_name ON public.cartaz_folders(name);
CREATE INDEX IF NOT EXISTS idx_cartazes_created_by ON public.cartazes(created_by);
CREATE INDEX IF NOT EXISTS idx_cartazes_folder_id ON public.cartazes(folder_id);
CREATE INDEX IF NOT EXISTS idx_cartazes_created_at ON public.cartazes(created_at DESC);

-- Enable RLS
ALTER TABLE public.cartaz_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartazes ENABLE ROW LEVEL SECURITY;

-- RLS policies for cartaz_folders
CREATE POLICY "Users can view their own cartaz folders" ON public.cartaz_folders
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own cartaz folders" ON public.cartaz_folders
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own cartaz folders" ON public.cartaz_folders
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own cartaz folders" ON public.cartaz_folders
  FOR DELETE USING (auth.uid() = created_by);

-- RLS policies for cartazes
CREATE POLICY "Users can view their own cartazes" ON public.cartazes
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own cartazes" ON public.cartazes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own cartazes" ON public.cartazes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own cartazes" ON public.cartazes
  FOR DELETE USING (auth.uid() = created_by);

-- Create storage bucket for cartazes
INSERT INTO storage.buckets (id, name, public)
VALUES ('cartazes', 'cartazes', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload cartaz files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cartazes' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view cartaz files" ON storage.objects
  FOR SELECT USING (bucket_id = 'cartazes');

CREATE POLICY "Users can update their own cartaz files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'cartazes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own cartaz files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cartazes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cartaz_folders_updated_at 
    BEFORE UPDATE ON public.cartaz_folders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cartazes_updated_at 
    BEFORE UPDATE ON public.cartazes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
