-- CRITICAL SECURITY FIXES - Phase 1: Database Function Security

-- Fix search_path for all security definer functions to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.is_user_manager(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    user_role text;
BEGIN
    -- Buscar role diretamente da tabela sem ativar RLS
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role = 'gerente', false);
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, '');
EXCEPTION
    WHEN OTHERS THEN
        RETURN '';
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result json;
  user_record record;
BEGIN
  -- Buscar dados do usuário
  SELECT * INTO user_record FROM auth.users WHERE id = user_id;
  
  IF NOT FOUND THEN
    result := json_build_object(
      'success', false,
      'error', 'Usuario nao encontrado'
    );
    RETURN result;
  END IF;
  
  -- Verificar se já tem perfil
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    result := json_build_object(
      'success', true,
      'message', 'Perfil ja existe',
      'profile_id', user_id
    );
    RETURN result;
  END IF;
  
  -- Tentar criar perfil
  BEGIN
    INSERT INTO public.profiles (
      id, 
      name, 
      role, 
      phone, 
      created_at, 
      updated_at
    ) VALUES (
      user_id,
      COALESCE(user_record.raw_user_meta_data->>'name', user_record.email, 'Usuário'),
      COALESCE(user_record.raw_user_meta_data->>'role', 'consultor_moveis'),
      COALESCE(user_record.raw_user_meta_data->>'phone', ''),
      NOW(),
      NOW()
    );
    
    result := json_build_object(
      'success', true,
      'message', 'Perfil criado com sucesso',
      'profile_id', user_id
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      result := json_build_object(
        'success', false,
        'error', SQLERRM,
        'state', SQLSTATE
      );
  END;
  
  RETURN result;
END;
$$;

-- Create secure role management functions
CREATE OR REPLACE FUNCTION public.can_user_modify_role(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    current_user_role text;
    target_user_role text;
BEGIN
    -- Get current user role
    SELECT role INTO current_user_role 
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- Get target user role
    SELECT role INTO target_user_role 
    FROM public.profiles 
    WHERE id = target_user_id;
    
    -- Only managers can modify roles
    IF current_user_role != 'gerente' THEN
        RETURN false;
    END IF;
    
    -- Managers cannot modify other managers or their own role
    IF target_user_role = 'gerente' OR target_user_id = auth.uid() THEN
        RETURN false;
    END IF;
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_role_change(
    target_user_id uuid,
    old_role text,
    new_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Log role changes for audit purposes
    RAISE LOG 'Role change: User % changed role from % to % by manager %', 
        target_user_id, old_role, new_role, auth.uid();
    
    -- You could also insert into an audit table here if needed
END;
$$;

-- Update profiles table RLS policies to prevent privilege escalation
DROP POLICY IF EXISTS "Enable read for own profile and managers" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users matching id" ON public.profiles;

-- Secure profile policies
CREATE POLICY "Users can view own profile and managers can view all"
ON public.profiles FOR SELECT
USING (
    auth.uid() = id OR 
    public.is_user_manager()
);

CREATE POLICY "Users can update own profile except role"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND
    (OLD.role = NEW.role OR public.can_user_modify_role(id))
);

CREATE POLICY "Managers can update any non-manager profile"
ON public.profiles FOR UPDATE
USING (public.can_user_modify_role(id))
WITH CHECK (public.can_user_modify_role(id));

CREATE POLICY "Service role and authenticated users can insert profiles"
ON public.profiles FOR INSERT
WITH CHECK (
    -- Service role for triggers
    auth.role() = 'service_role' OR
    -- Authenticated users can only create their own profile
    (auth.role() = 'authenticated' AND auth.uid() = id) OR
    -- Anonymous users during signup
    auth.role() = 'anon'
);

CREATE POLICY "Managers can delete non-manager profiles"
ON public.profiles FOR DELETE
USING (
    public.is_user_manager() AND
    public.can_user_modify_role(id)
);

-- Create function to safely change user role (manager only)
CREATE OR REPLACE FUNCTION public.change_user_role(
    target_user_id uuid,
    new_role text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    old_role text;
    result json;
BEGIN
    -- Check if current user can modify the target user's role
    IF NOT public.can_user_modify_role(target_user_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Unauthorized to change this user role'
        );
    END IF;
    
    -- Validate new role
    IF new_role NOT IN ('consultor_moveis', 'consultor_moda', 'crediarista', 'jovem_aprendiz') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid role specified'
        );
    END IF;
    
    -- Get current role for audit
    SELECT role INTO old_role FROM public.profiles WHERE id = target_user_id;
    
    -- Update role
    UPDATE public.profiles 
    SET role = new_role, updated_at = NOW()
    WHERE id = target_user_id;
    
    -- Audit the change
    PERFORM public.audit_role_change(target_user_id, old_role, new_role);
    
    RETURN json_build_object(
        'success', true,
        'message', 'Role updated successfully',
        'old_role', old_role,
        'new_role', new_role
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;