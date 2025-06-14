
-- Phase 1: Critical RLS Policy Cleanup & Foundational Policies
-- This script consolidates `profiles` policies and adds foundational RLS to critical tables.

-- 1. Drop old, potentially conflicting helper functions
DROP FUNCTION IF EXISTS public.is_manager();

-- 2. Create robust, secure helper functions to check user roles without RLS recursion
CREATE OR REPLACE FUNCTION public.is_user_manager(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
    -- Search for the role directly in the table, bypassing RLS.
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = p_user_id;
    
    RETURN COALESCE(user_role = 'gerente', false);
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;
COMMENT ON FUNCTION public.is_user_manager(uuid) IS 'Checks if a user is a manager without causing RLS recursion. Runs with definer privileges.';


CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = p_user_id;
    
    RETURN COALESCE(user_role, '');
EXCEPTION
    WHEN OTHERS THEN
        RETURN '';
END;
$$;
COMMENT ON FUNCTION public.get_user_role(uuid) IS 'Gets a user role without causing RLS recursion. Runs with definer privileges.';

-- 3. Consolidate and fix RLS policies for the `profiles` table
-- First, remove all existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Enable read for own profile and managers" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for own profile and managers" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for managers only" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Gerentes podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Gerentes podem atualizar outros perfis" ON public.profiles;
DROP POLICY IF EXISTS "Gerentes podem excluir perfis não-gerentes" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for service_role and triggers" ON public.profiles;

-- Now, create the definitive set of policies for `profiles`
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles: Enable read for self and managers" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR
        public.is_user_manager()
    );

CREATE POLICY "Profiles: Enable update for self and managers" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR
        public.is_user_manager()
    ) WITH CHECK (
        auth.uid() = id OR
        public.is_user_manager()
    );

CREATE POLICY "Profiles: Enable delete for managers on non-managers" ON public.profiles
    FOR DELETE USING (
        public.is_user_manager() AND
        public.get_user_role(id) != 'gerente'
    );

CREATE POLICY "Profiles: Enable insert for self and managers" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id OR
        public.is_user_manager()
    );

COMMENT ON TABLE public.profiles IS 'User profiles now have consolidated and secure RLS policies. Only users can manage their own profile, and managers can manage all non-manager profiles.';

-- 4. Add foundational RLS policies to other critical tables

-- Table: tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tasks: Allow full access for owners and managers" ON public.tasks;
CREATE POLICY "Tasks: Allow full access for owners and managers" ON public.tasks
    FOR ALL
    USING (auth.uid() = created_by OR public.is_user_manager())
    WITH CHECK (auth.uid() = created_by OR public.is_user_manager());
COMMENT ON TABLE public.tasks IS 'RLS Enabled: Users can manage their own tasks. Managers can manage all tasks.';

-- Table: crediario_clientes
ALTER TABLE public.crediario_clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Crediario Clientes: Allow full access for owners and managers" ON public.crediario_clientes;
CREATE POLICY "Crediario Clientes: Allow full access for owners and managers" ON public.crediario_clientes
    FOR ALL
    USING (auth.uid() = created_by OR public.is_user_manager())
    WITH CHECK (auth.uid() = created_by OR public.is_user_manager());
COMMENT ON TABLE public.crediario_clientes IS 'RLS Enabled: Users can manage their own clients. Managers can manage all clients.';


-- Table: moveis_orientacoes
-- Note: ownership column is `criado_por`
ALTER TABLE public.moveis_orientacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Moveis Orientacoes: Allow full access for owners and managers" ON public.moveis_orientacoes;
CREATE POLICY "Moveis Orientacoes: Allow full access for owners and managers" ON public.moveis_orientacoes
    FOR ALL
    USING (auth.uid() = criado_por OR public.is_user_manager())
    WITH CHECK (auth.uid() = criado_por OR public.is_user_manager());
COMMENT ON TABLE public.moveis_orientacoes IS 'RLS Enabled: Users can manage their own "orientações". Managers can manage all.';


-- Table: moda_reservas
ALTER TABLE public.moda_reservas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Moda Reservas: Allow full access for owners and managers" ON public.moda_reservas;
CREATE POLICY "Moda Reservas: Allow full access for owners and managers" ON public.moda_reservas
    FOR ALL
    USING (auth.uid() = created_by OR public.is_user_manager())
    WITH CHECK (auth.uid() = created_by OR public.is_user_manager());
COMMENT ON TABLE public.moda_reservas IS 'RLS Enabled: Users can manage their own reservations. Managers can manage all reservations.';

