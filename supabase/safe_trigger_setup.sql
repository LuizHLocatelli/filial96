-- SETUP SEGURO DO TRIGGER - Execute no SQL Editor do Supabase
-- Esta versão tem melhor tratamento de erros

-- PASSO 1: Remover trigger atual (se existir) para evitar conflitos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- PASSO 2: Remover função atual (se existir)
DROP FUNCTION IF EXISTS public.handle_new_user();

-- PASSO 3: Criar função com tratamento de erro robusto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name text;
  user_role text;
  user_phone text;
BEGIN
  -- Log de debug (aparece nos logs do Supabase)
  RAISE LOG 'Trigger handle_new_user executado para usuário: %', NEW.id;
  
  -- Extrair dados com valores padrão seguros
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'Usuário');
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'consultor_moveis');
  user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  
  -- Verificar se o perfil já existe antes de tentar inserir
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RAISE LOG 'Perfil já existe para usuário: %', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Tentar inserir o perfil
  BEGIN
    INSERT INTO public.profiles (
      id, 
      name, 
      role, 
      phone, 
      created_at, 
      updated_at
    ) VALUES (
      NEW.id,
      user_name,
      user_role,
      user_phone,
      NOW(),
      NOW()
    );
    
    RAISE LOG 'Perfil criado com sucesso para usuário: %', NEW.id;
    
  EXCEPTION
    WHEN unique_violation THEN
      RAISE LOG 'Perfil já existe (unique_violation) para usuário: %', NEW.id;
      -- Não falha o processo, apenas loga
    WHEN OTHERS THEN
      RAISE LOG 'Erro ao criar perfil para usuário %: % %', NEW.id, SQLSTATE, SQLERRM;
      -- IMPORTANTE: Não relança o erro para não quebrar o signup
  END;
  
  RETURN NEW;
END;
$$;

-- PASSO 4: Aplicar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- PASSO 5: Configurar políticas RLS de forma mais permissiva
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for service_role and triggers" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;

-- Política para SELECT (ver próprio perfil)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para UPDATE (atualizar próprio perfil)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para INSERT mais permissiva
CREATE POLICY "Enable insert for authenticated and service users" ON public.profiles
  FOR INSERT WITH CHECK (
    -- Permite inserção via service_role (triggers)
    auth.role() = 'service_role' OR
    -- Permite inserção via authenticated role se o ID corresponde
    (auth.role() = 'authenticated' AND auth.uid() = id) OR
    -- Permite inserção via anon (para casos especiais)
    auth.role() = 'anon'
  );

-- PASSO 6: Função de verificação manual (para debug)
CREATE OR REPLACE FUNCTION public.debug_create_profile(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
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
      'message', 'Perfil criado com sucesso'
    );
    
  EXCEPTION
    WHEN unique_violation THEN
      result := json_build_object(
        'success', true,
        'message', 'Perfil ja existe'
      );
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

-- PASSO 7: Comentários
COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function with robust error handling for user profile creation';
COMMENT ON FUNCTION public.debug_create_profile(uuid) IS 'Debug function to manually test profile creation';

-- PASSO 8: Verificação final
SELECT 
  'Trigger criado' as status,
  trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'

UNION ALL

SELECT 
  'Função criada' as status,
  routine_name 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'

UNION ALL

SELECT 
  'RLS ativo' as status,
  CASE WHEN rowsecurity THEN 'Sim' ELSE 'Não' END
FROM pg_tables 
WHERE tablename = 'profiles';

-- INSTRUÇÕES:
-- 1. Execute este script completo no SQL Editor do Supabase
-- 2. Aguarde a confirmação de que tudo foi criado
-- 3. Teste o signup novamente
-- 4. Se ainda der erro, execute as queries de diagnóstico 