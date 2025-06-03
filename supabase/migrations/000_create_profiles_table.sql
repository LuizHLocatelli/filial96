-- Criação da tabela profiles se não existir
-- Execute este script no SQL Editor do Supabase ANTES dos outros

-- 1. Criar a tabela profiles se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'consultor_moveis',
  phone text DEFAULT '',
  email text GENERATED ALWAYS AS (
    COALESCE(
      (SELECT email FROM auth.users WHERE id = profiles.id),
      ''
    )
  ) STORED,
  avatar_url text,
  display_name text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_role CHECK (role IN ('gerente', 'crediarista', 'consultor_moveis', 'consultor_moda', 'jovem_aprendiz'))
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON public.profiles(name);

-- 3. Ativar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 5. Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Políticas RLS básicas (as específicas de gerente são criadas em outro arquivo)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
CREATE POLICY "Enable insert for authenticated users" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. Comentários de documentação
COMMENT ON TABLE public.profiles IS 'Perfis de usuários com informações adicionais';
COMMENT ON COLUMN public.profiles.id IS 'ID do usuário (referência ao auth.users)';
COMMENT ON COLUMN public.profiles.name IS 'Nome completo do usuário';
COMMENT ON COLUMN public.profiles.role IS 'Função/papel do usuário no sistema';
COMMENT ON COLUMN public.profiles.phone IS 'Número de telefone do usuário';
COMMENT ON COLUMN public.profiles.email IS 'Email do usuário (obtido automaticamente do auth.users)';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL da foto de perfil do usuário';
COMMENT ON COLUMN public.profiles.display_name IS 'Nome de exibição personalizado';

-- 8. Inserir perfil de exemplo para o primeiro gerente (opcional)
-- Descomente e ajuste conforme necessário:
/*
INSERT INTO public.profiles (id, name, role, phone)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', email, 'Gerente'),
  'gerente',
  COALESCE(raw_user_meta_data->>'phone', '')
FROM auth.users 
WHERE email = 'seu-email@exemplo.com' -- SUBSTITUA PELO EMAIL DO GERENTE
ON CONFLICT (id) DO UPDATE SET
  role = 'gerente',
  updated_at = now();
*/ 