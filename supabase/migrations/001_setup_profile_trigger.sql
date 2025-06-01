-- Configuração de triggers para criação automática de perfis
-- Este arquivo deve ser executado no dashboard do Supabase

-- 1. Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    name, 
    role, 
    phone, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'consultor_moveis'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(NEW.raw_user_meta_data->>'name', profiles.name),
    role = COALESCE(NEW.raw_user_meta_data->>'role', profiles.role),
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', profiles.phone),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- 2. Aplicar trigger na tabela auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Configurar políticas RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam seu próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para permitir que usuários atualizem seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para inserção apenas via trigger (service_role) ou função específica
DROP POLICY IF EXISTS "Enable insert for service_role and triggers" ON public.profiles;
CREATE POLICY "Enable insert for service_role and triggers" ON public.profiles
  FOR INSERT WITH CHECK (
    -- Permite inserção via service_role (triggers)
    auth.role() = 'service_role' OR
    -- Permite inserção se o ID corresponde ao usuário autenticado
    auth.uid() = id
  );

-- 4. Criar função para verificar e corrigir perfis
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record record;
  profile_exists boolean;
BEGIN
  -- Verificar se o usuário existe
  SELECT * INTO user_record
  FROM auth.users
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Verificar se o perfil já existe
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO profile_exists;
  
  IF NOT profile_exists THEN
    -- Criar perfil se não existir
    INSERT INTO public.profiles (
      id, 
      name, 
      role, 
      phone, 
      created_at, 
      updated_at
    )
    VALUES (
      user_id,
      COALESCE(user_record.raw_user_meta_data->>'name', user_record.email, 'Usuário'),
      COALESCE(user_record.raw_user_meta_data->>'role', 'consultor_moveis'),
      COALESCE(user_record.raw_user_meta_data->>'phone', ''),
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN true;
END;
$$;

-- 5. Comentários de documentação
COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function to automatically create user profile when a new user signs up';
COMMENT ON FUNCTION public.ensure_user_profile(uuid) IS 'Ensures a user has a profile, creating one if necessary';

-- 6. Executar correção para usuários existentes sem perfil (se necessário)
-- SELECT public.ensure_user_profile(id) FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles); 