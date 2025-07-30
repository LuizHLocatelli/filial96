-- Corrigir política de UPDATE para permitir que qualquer usuário edite produtos nas contagens
DROP POLICY IF EXISTS "Usuários podem atualizar produtos em contagens que podem edita" ON public.moda_estoque_produtos;

-- Nova política mais permissiva - qualquer usuário autenticado pode editar produtos em contagens ativas
CREATE POLICY "Usuários podem atualizar produtos em contagens ativas" 
ON public.moda_estoque_produtos 
FOR UPDATE 
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 
    FROM moda_estoque_contagens 
    WHERE moda_estoque_contagens.id = moda_estoque_produtos.contagem_id
  )
);