-- Corrigir política RLS para permitir que consultores atualizem produtos na mesma contagem
-- independente de quem contou o produto originalmente

-- Remover política antiga de UPDATE
DROP POLICY IF EXISTS "Usuários podem atualizar produtos de suas contagens" ON public.moda_estoque_produtos;

-- Criar nova política que permite UPDATE se o usuário pode editar a contagem
-- ou se ele criou o produto originalmente
CREATE POLICY "Usuários podem atualizar produtos em contagens que podem editar" 
ON public.moda_estoque_produtos 
FOR UPDATE 
USING (
  -- Usuário criou o produto originalmente
  (auth.uid() = created_by) 
  OR 
  -- Usuário criou a contagem (pode editar todos os produtos da contagem)
  (EXISTS ( 
    SELECT 1 
    FROM moda_estoque_contagens 
    WHERE moda_estoque_contagens.id = moda_estoque_produtos.contagem_id 
    AND moda_estoque_contagens.created_by = auth.uid()
  ))
  OR
  -- Usuário é gerente (pode editar qualquer contagem)
  is_user_manager()
);