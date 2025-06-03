-- VERSÃO CORRIGIDA - Políticas RLS sem recursão infinita
-- Execute este script para corrigir o problema de recursão

-- 1. Primeiro, remover todas as políticas problemáticas
DROP POLICY IF EXISTS "Gerentes podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Gerentes podem atualizar outros perfis" ON public.profiles;
DROP POLICY IF EXISTS "Gerentes podem excluir perfis não-gerentes" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;

-- 2. Criar função segura para verificar se usuário é gerente (sem RLS)
CREATE OR REPLACE FUNCTION public.is_user_manager(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 3. Criar função para obter role do usuário atual (sem RLS)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
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
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, '');
EXCEPTION
    WHEN OTHERS THEN
        RETURN '';
END;
$$;

-- 4. Políticas simplificadas para SELECT (visualização)
CREATE POLICY "Enable read for own profile and managers" ON public.profiles
    FOR SELECT USING (
        -- Usuário pode ver seu próprio perfil
        auth.uid() = id OR
        -- Gerentes podem ver todos (usando função segura)
        public.is_user_manager()
    );

-- 5. Política para UPDATE (edição)
CREATE POLICY "Enable update for own profile and managers" ON public.profiles
    FOR UPDATE USING (
        -- Usuário pode atualizar seu próprio perfil
        auth.uid() = id OR
        -- Gerentes podem atualizar outros perfis
        public.is_user_manager()
    );

-- 6. Política para DELETE (exclusão) - mais restritiva
CREATE POLICY "Enable delete for managers only" ON public.profiles
    FOR DELETE USING (
        -- Apenas gerentes podem excluir
        public.is_user_manager() AND
        -- Não podem excluir outros gerentes
        public.get_user_role(id) != 'gerente'
    );

-- 7. Política para INSERT (criação de perfis)
CREATE POLICY "Enable insert for authenticated users" ON public.profiles
    FOR INSERT WITH CHECK (
        -- Usuário pode criar seu próprio perfil
        auth.uid() = id OR
        -- Gerentes podem criar perfis para outros
        public.is_user_manager()
    );

-- 8. Garantir que RLS está ativo
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 9. Comentários das funções
COMMENT ON FUNCTION public.is_user_manager(uuid) IS 'Verifica se o usuário é gerente sem causar recursão RLS';
COMMENT ON FUNCTION public.get_user_role(uuid) IS 'Obtém o role do usuário sem causar recursão RLS';

-- 10. Testar as funções (descomente para verificar)
-- SELECT public.is_user_manager(); -- Deve retornar true se você for gerente
-- SELECT public.get_user_role(); -- Deve retornar seu role atual 