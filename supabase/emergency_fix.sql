-- CORREÇÃO DE EMERGÊNCIA - Execute se o erro 500 persistir
-- Isso vai desabilitar o trigger temporariamente para identificar se ele é o problema

-- OPÇÃO 1: DESABILITAR TRIGGER TEMPORARIAMENTE
-- Execute isso se quiser testar sem o trigger

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remover todas as políticas RLS da tabela profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Ou se preferir manter RLS mas de forma mais permissiva:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- 
-- DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Enable insert for authenticated and service users" ON public.profiles;
-- 
-- CREATE POLICY "Allow all operations for authenticated users" ON public.profiles
--   FOR ALL USING (true) WITH CHECK (true);

-- TESTE: Tente fazer signup novamente
-- Se funcionar, o problema estava no trigger
-- Se não funcionar, o problema é outro

-- VERIFICAÇÃO: Ver se consegue inserir manualmente
-- Execute isso para testar se a tabela aceita inserções:

INSERT INTO public.profiles (
    id, 
    name, 
    role, 
    phone, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(),
    'Teste Manual',
    'consultor_moveis',
    '11999999999',
    NOW(),
    NOW()
);

-- Se a inserção acima funcionar, o problema estava no RLS/trigger
-- Se não funcionar, há um problema estrutural na tabela

-- DEPOIS DE IDENTIFICAR O PROBLEMA:
-- 1. Se o signup funcionar sem trigger, reative gradualmente
-- 2. Se não funcionar nem sem trigger, há problema mais fundamental
-- 3. Documente qual opção resolveu para aplicar a correção definitiva 