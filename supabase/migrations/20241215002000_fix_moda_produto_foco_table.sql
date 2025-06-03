-- Corrigir estrutura da tabela moda_produto_foco para ser idêntica aos móveis
-- Migração criada em: 2024-12-15

-- Remover tabela atual com estrutura incorreta
DROP TABLE IF EXISTS moda_produto_foco CASCADE;

-- Recriar tabela com estrutura idêntica aos móveis
CREATE TABLE IF NOT EXISTS moda_produto_foco (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_produto VARCHAR NOT NULL,
  codigo_produto VARCHAR NOT NULL,
  categoria VARCHAR NOT NULL,
  preco_de DECIMAL(10,2) NOT NULL,
  preco_por DECIMAL(10,2) NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  informacoes_adicionais TEXT,
  motivo_foco TEXT,
  meta_vendas INTEGER,
  argumentos_venda TEXT[],
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Tabela para imagens dos produtos foco
CREATE TABLE IF NOT EXISTS moda_produto_foco_imagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_foco_id uuid REFERENCES moda_produto_foco(id) ON DELETE CASCADE,
  imagem_url TEXT NOT NULL,
  imagem_nome VARCHAR NOT NULL,
  imagem_tipo VARCHAR NOT NULL,
  imagem_tamanho BIGINT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Tabela para vendas dos produtos foco
CREATE TABLE IF NOT EXISTS moda_produto_foco_vendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_foco_id uuid REFERENCES moda_produto_foco(id) ON DELETE CASCADE,
  produto_nome VARCHAR NOT NULL,
  produto_codigo VARCHAR NOT NULL,
  cliente_nome VARCHAR NOT NULL,
  cliente_telefone VARCHAR,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_total DECIMAL(10,2) NOT NULL,
  data_venda DATE NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_moda_produto_foco_ativo ON moda_produto_foco(ativo);
CREATE INDEX IF NOT EXISTS idx_moda_produto_foco_periodo ON moda_produto_foco(periodo_inicio, periodo_fim);
CREATE INDEX IF NOT EXISTS idx_moda_produto_foco_categoria ON moda_produto_foco(categoria);
CREATE INDEX IF NOT EXISTS idx_moda_produto_foco_created_at ON moda_produto_foco(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_moda_produto_foco_imagens_produto_id ON moda_produto_foco_imagens(produto_foco_id);
CREATE INDEX IF NOT EXISTS idx_moda_produto_foco_imagens_ordem ON moda_produto_foco_imagens(ordem);

CREATE INDEX IF NOT EXISTS idx_moda_produto_foco_vendas_produto_id ON moda_produto_foco_vendas(produto_foco_id);
CREATE INDEX IF NOT EXISTS idx_moda_produto_foco_vendas_data ON moda_produto_foco_vendas(data_venda DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_moda_produto_foco_updated_at 
    BEFORE UPDATE ON moda_produto_foco 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE moda_produto_foco ENABLE ROW LEVEL SECURITY;
ALTER TABLE moda_produto_foco_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE moda_produto_foco_vendas ENABLE ROW LEVEL SECURITY;

-- Policies para moda_produto_foco
CREATE POLICY "Permitir leitura para usuários autenticados" ON moda_produto_foco
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON moda_produto_foco
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON moda_produto_foco
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão para usuários autenticados" ON moda_produto_foco
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies para moda_produto_foco_imagens
CREATE POLICY "Permitir leitura para usuários autenticados" ON moda_produto_foco_imagens
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON moda_produto_foco_imagens
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON moda_produto_foco_imagens
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão para usuários autenticados" ON moda_produto_foco_imagens
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies para moda_produto_foco_vendas
CREATE POLICY "Permitir leitura para usuários autenticados" ON moda_produto_foco_vendas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON moda_produto_foco_vendas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON moda_produto_foco_vendas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão para usuários autenticados" ON moda_produto_foco_vendas
    FOR DELETE USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE moda_produto_foco IS 'Tabela para produtos em foco do setor de moda - estrutura idêntica aos móveis';
COMMENT ON TABLE moda_produto_foco_imagens IS 'Tabela para imagens dos produtos em foco do setor de moda';
COMMENT ON TABLE moda_produto_foco_vendas IS 'Tabela para vendas dos produtos em foco do setor de moda'; 