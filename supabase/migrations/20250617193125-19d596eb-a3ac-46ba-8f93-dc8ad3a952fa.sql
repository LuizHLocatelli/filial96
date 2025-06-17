
-- Remover as políticas RLS restritivas existentes da tabela moda_reservas
DROP POLICY IF EXISTS "Users can view their own reservas" ON public.moda_reservas;
DROP POLICY IF EXISTS "Users can create their own reservas" ON public.moda_reservas;
DROP POLICY IF EXISTS "Users can update their own reservas" ON public.moda_reservas;
DROP POLICY IF EXISTS "Users can delete their own reservas" ON public.moda_reservas;

-- Criar novas políticas que permitem acesso a todas as reservas para todos os usuários autenticados
CREATE POLICY "Authenticated users can view all reservas" 
  ON public.moda_reservas 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create reservas" 
  ON public.moda_reservas 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update all reservas" 
  ON public.moda_reservas 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete all reservas" 
  ON public.moda_reservas 
  FOR DELETE 
  TO authenticated
  USING (true);
