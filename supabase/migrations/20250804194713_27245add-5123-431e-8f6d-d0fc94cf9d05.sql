-- Atualizar política de DELETE para produtos do estoque de moda
-- Permitir que usuários autenticados deletem produtos de contagens ativas

DROP POLICY IF EXISTS "Usuários podem deletar produtos de suas contagens" ON public.moda_estoque_produtos;

CREATE POLICY "Usuários autenticados podem deletar produtos de contagens ativas" 
ON public.moda_estoque_produtos 
FOR DELETE 
USING (
  auth.role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 
    FROM moda_estoque_contagens 
    WHERE moda_estoque_contagens.id = moda_estoque_produtos.contagem_id
  )
);