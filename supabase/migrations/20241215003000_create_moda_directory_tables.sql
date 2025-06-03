-- Criar tabelas do diretório da moda espelhadas nos móveis
-- Migração criada em: 2024-12-15

-- Tabela para categorias de arquivos da moda
CREATE TABLE IF NOT EXISTS moda_categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by uuid REFERENCES auth.users(id)
);

-- Tabela para arquivos do diretório da moda
CREATE TABLE IF NOT EXISTS moda_arquivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type VARCHAR NOT NULL,
  file_size INTEGER,
  category_id uuid REFERENCES moda_categorias(id),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by uuid REFERENCES auth.users(id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_moda_categorias_name ON moda_categorias(name);
CREATE INDEX IF NOT EXISTS idx_moda_categorias_created_at ON moda_categorias(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_moda_arquivos_category_id ON moda_arquivos(category_id);
CREATE INDEX IF NOT EXISTS idx_moda_arquivos_file_type ON moda_arquivos(file_type);
CREATE INDEX IF NOT EXISTS idx_moda_arquivos_is_featured ON moda_arquivos(is_featured);
CREATE INDEX IF NOT EXISTS idx_moda_arquivos_created_at ON moda_arquivos(created_at DESC);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_moda_categorias_updated_at 
    BEFORE UPDATE ON moda_categorias 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moda_arquivos_updated_at 
    BEFORE UPDATE ON moda_arquivos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE moda_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE moda_arquivos ENABLE ROW LEVEL SECURITY;

-- Policies para moda_categorias
CREATE POLICY "Permitir leitura para usuários autenticados" ON moda_categorias
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON moda_categorias
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON moda_categorias
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão para usuários autenticados" ON moda_categorias
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies para moda_arquivos
CREATE POLICY "Permitir leitura para usuários autenticados" ON moda_arquivos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON moda_arquivos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON moda_arquivos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão para usuários autenticados" ON moda_arquivos
    FOR DELETE USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE moda_categorias IS 'Tabela para categorias de arquivos do diretório da moda - estrutura idêntica aos móveis';
COMMENT ON TABLE moda_arquivos IS 'Tabela para arquivos do diretório da moda - estrutura idêntica aos móveis'; 