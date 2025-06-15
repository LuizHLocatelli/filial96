
-- Criar tabela para produtos descontinuados de móveis
CREATE TABLE public.moveis_descontinuados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  codigo TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('Linha Branca', 'Som e Imagem', 'Telefonia', 'Linha Móveis', 'Eletroportáteis', 'Tecnologia', 'Automotivo')),
  preco DECIMAL(10,2) NOT NULL,
  descricao TEXT,
  percentual_desconto INTEGER,
  quantidade_estoque INTEGER,
  imagem_url TEXT,
  imagem_nome TEXT,
  imagem_tipo TEXT,
  imagem_tamanho INTEGER,
  favorito BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users NOT NULL
);

-- Criar índices para performance
CREATE INDEX idx_moveis_descontinuados_categoria ON public.moveis_descontinuados(categoria);
CREATE INDEX idx_moveis_descontinuados_preco ON public.moveis_descontinuados(preco);
CREATE INDEX idx_moveis_descontinuados_created_at ON public.moveis_descontinuados(created_at);

-- Adicionar RLS
ALTER TABLE public.moveis_descontinuados ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Todos podem visualizar produtos descontinuados" 
  ON public.moveis_descontinuados 
  FOR SELECT 
  USING (true);

CREATE POLICY "Usuários autenticados podem criar produtos descontinuados" 
  ON public.moveis_descontinuados 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Criadores podem atualizar seus produtos descontinuados" 
  ON public.moveis_descontinuados 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Criadores podem deletar seus produtos descontinuados" 
  ON public.moveis_descontinuados 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Criar bucket de storage para imagens dos produtos descontinuados
INSERT INTO storage.buckets (id, name, public) 
VALUES ('moveis-descontinuados', 'moveis-descontinuados', true);

-- Políticas de storage
CREATE POLICY "Todos podem visualizar imagens de produtos descontinuados"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'moveis-descontinuados');

CREATE POLICY "Usuários autenticados podem fazer upload de imagens"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'moveis-descontinuados' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários podem atualizar suas próprias imagens"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'moveis-descontinuados' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem deletar suas próprias imagens"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'moveis-descontinuados' AND auth.uid()::text = (storage.foldername(name))[1]);
