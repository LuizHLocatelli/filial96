-- Criar tabela para contagens de estoque
CREATE TABLE public.moda_estoque_contagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'finalizada')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar tabela para produtos das contagens
CREATE TABLE public.moda_estoque_produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contagem_id UUID NOT NULL REFERENCES public.moda_estoque_contagens(id) ON DELETE CASCADE,
  codigo_produto VARCHAR(9) NOT NULL,
  setor VARCHAR(20) NOT NULL CHECK (setor IN ('masculino', 'feminino', 'infantil')),
  quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(contagem_id, codigo_produto, setor)
);

-- Habilitar Row Level Security
ALTER TABLE public.moda_estoque_contagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moda_estoque_produtos ENABLE ROW LEVEL SECURITY;

-- Políticas para moda_estoque_contagens
CREATE POLICY "Usuários autenticados podem ver todas as contagens" 
ON public.moda_estoque_contagens 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar contagens" 
ON public.moda_estoque_contagens 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Usuários podem atualizar suas próprias contagens" 
ON public.moda_estoque_contagens 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Usuários podem deletar suas próprias contagens" 
ON public.moda_estoque_contagens 
FOR DELETE 
USING (auth.uid() = created_by);

-- Políticas para moda_estoque_produtos
CREATE POLICY "Usuários autenticados podem ver todos os produtos" 
ON public.moda_estoque_produtos 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar produtos" 
ON public.moda_estoque_produtos 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Usuários podem atualizar produtos de suas contagens" 
ON public.moda_estoque_produtos 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.moda_estoque_contagens 
  WHERE id = moda_estoque_produtos.contagem_id 
  AND created_by = auth.uid()
));

CREATE POLICY "Usuários podem deletar produtos de suas contagens" 
ON public.moda_estoque_produtos 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.moda_estoque_contagens 
  WHERE id = moda_estoque_produtos.contagem_id 
  AND created_by = auth.uid()
));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_moda_estoque_contagens_updated_at 
BEFORE UPDATE ON public.moda_estoque_contagens 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moda_estoque_produtos_updated_at 
BEFORE UPDATE ON public.moda_estoque_produtos 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para somar produtos duplicados
CREATE OR REPLACE FUNCTION public.upsert_moda_estoque_produto(
  p_contagem_id UUID,
  p_codigo_produto VARCHAR(9),
  p_setor VARCHAR(20),
  p_quantidade INTEGER,
  p_created_by UUID
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  product_id UUID;
BEGIN
  -- Tenta inserir, se já existe soma a quantidade
  INSERT INTO public.moda_estoque_produtos (
    contagem_id, codigo_produto, setor, quantidade, created_by
  ) VALUES (
    p_contagem_id, p_codigo_produto, p_setor, p_quantidade, p_created_by
  ) 
  ON CONFLICT (contagem_id, codigo_produto, setor) 
  DO UPDATE SET 
    quantidade = moda_estoque_produtos.quantidade + EXCLUDED.quantidade,
    updated_at = NOW()
  RETURNING id INTO product_id;
  
  RETURN product_id;
END;
$$;