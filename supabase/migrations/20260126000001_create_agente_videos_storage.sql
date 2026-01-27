-- Criar bucket para vídeos do agente multimodal
-- Este script deve ser executado no Dashboard do Supabase Storage ou via SQL

-- O bucket 'agente-videos' precisa ser criado manualmente no Supabase Dashboard:
-- 1. Acesse Storage → New Bucket
-- 2. Nome: agente-videos
-- 3. Marque "Public bucket"
-- 4. Clique em Create bucket

-- Após criar o bucket, execute as políticas RLS abaixo:

-- Allow authenticated users to upload videos
-- CREATE POLICY "Authenticated upload" ON storage.objects
--   FOR INSERT
--   WITH CHECK (
--     bucket_id = 'agente-videos' AND
--     auth.role() = 'authenticated'
--   );

-- Allow public read access to videos
-- CREATE POLICY "Public access" ON storage.objects
--   FOR SELECT
--   USING (
--     bucket_id = 'agente-videos'
--   );
