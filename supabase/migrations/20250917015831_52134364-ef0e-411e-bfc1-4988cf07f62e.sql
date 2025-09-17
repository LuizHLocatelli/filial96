-- SECURITY FIX: Remove public read access to crediario_clientes table
-- This table contains sensitive customer personal and financial information

-- Remove the overly permissive policy that allows anyone to view all clients
DROP POLICY IF EXISTS "Usuários podem visualizar todos os clientes" ON public.crediario_clientes;

-- The existing "Crediario clients: users and managers only" policy already provides 
-- the correct access control:
-- - Users can only see clients they created (auth.uid() = created_by)
-- - Managers can see all clients (is_user_manager())
-- This policy covers SELECT, INSERT, UPDATE, and DELETE operations securely

-- Verify the remaining policies are properly restrictive
-- Policy "Usuários autenticados podem criar clientes" - SECURE (only allows INSERT if auth.uid() = created_by)
-- Policy "Usuários podem atualizar seus próprios clientes" - SECURE (only UPDATE if auth.uid() = created_by) 
-- Policy "Usuários podem excluir seus próprios clientes" - SECURE (only DELETE if auth.uid() = created_by)
-- Policy "Crediario clients: users and managers only" - SECURE (comprehensive access control)

-- Add a comment to document the security fix
COMMENT ON TABLE public.crediario_clientes IS 'Customer data table with RLS policies restricting access to record creators and managers only. Contains sensitive personal and financial information.';