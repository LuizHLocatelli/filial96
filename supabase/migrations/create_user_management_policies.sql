-- Políticas RLS para permitir gerenciamento de usuários por gerentes
-- Execute este script no SQL Editor do Supabase

-- 1. Política para permitir que gerentes vejam todos os perfis
CREATE POLICY "Gerentes podem ver todos os perfis" ON public.profiles
  FOR SELECT USING (
    -- Usuário pode ver seu próprio perfil
    auth.uid() = id OR
    -- Gerentes podem ver todos os perfis
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'gerente'
    )
  );

-- 2. Política para permitir que gerentes atualizem perfis de outros usuários
CREATE POLICY "Gerentes podem atualizar outros perfis" ON public.profiles
  FOR UPDATE USING (
    -- Usuário pode atualizar seu próprio perfil
    auth.uid() = id OR
    -- Gerentes podem atualizar outros perfis
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'gerente'
    )
  );

-- 3. Política para permitir que gerentes excluam perfis (exceto outros gerentes)
CREATE POLICY "Gerentes podem excluir perfis não-gerentes" ON public.profiles
  FOR DELETE USING (
    -- Apenas gerentes podem excluir
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'gerente'
    ) AND
    -- Não podem excluir outros gerentes
    role != 'gerente'
  );

-- 4. Função para verificar se o usuário atual é gerente
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'gerente'
  );
END;
$$;

-- 5. Função para obter estatísticas de usuários (apenas para gerentes)
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Verificar se o usuário é gerente
  IF NOT public.is_manager() THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes podem acessar estas estatísticas';
  END IF;

  SELECT json_build_object(
    'total_users', COUNT(*),
    'gerentes', COUNT(*) FILTER (WHERE role = 'gerente'),
    'crediaristas', COUNT(*) FILTER (WHERE role = 'crediarista'),
    'consultores_moveis', COUNT(*) FILTER (WHERE role = 'consultor_moveis'),
    'consultores_moda', COUNT(*) FILTER (WHERE role = 'consultor_moda'),
    'jovens_aprendizes', COUNT(*) FILTER (WHERE role = 'jovem_aprendiz'),
    'created_today', COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE),
    'created_this_week', COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '7 days'),
    'created_this_month', COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '30 days')
  ) INTO result
  FROM public.profiles;

  RETURN result;
END;
$$;

-- 6. Comentários de documentação
COMMENT ON POLICY "Gerentes podem ver todos os perfis" ON public.profiles IS 'Permite que gerentes vejam todos os perfis de usuários para gerenciamento';
COMMENT ON POLICY "Gerentes podem atualizar outros perfis" ON public.profiles IS 'Permite que gerentes atualizem informações de outros usuários';
COMMENT ON POLICY "Gerentes podem excluir perfis não-gerentes" ON public.profiles IS 'Permite que gerentes excluam usuários (exceto outros gerentes)';
COMMENT ON FUNCTION public.is_manager() IS 'Verifica se o usuário atual tem papel de gerente';
COMMENT ON FUNCTION public.get_user_stats() IS 'Retorna estatísticas de usuários para gerentes'; 