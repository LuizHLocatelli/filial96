-- Corrigir estrutura da tabela moda_folgas para ser idêntica aos móveis
-- Migração criada em: 2024-12-15

-- Remover tabela atual com estrutura incorreta
DROP TABLE IF EXISTS moda_folgas CASCADE;

-- Recriar tabela com estrutura idêntica aos móveis
CREATE TABLE IF NOT EXISTS moda_folgas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  consultor_id uuid NOT NULL,
  motivo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by uuid REFERENCES auth.users(id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_moda_folgas_data ON moda_folgas(data);
CREATE INDEX IF NOT EXISTS idx_moda_folgas_consultor_id ON moda_folgas(consultor_id);
CREATE INDEX IF NOT EXISTS idx_moda_folgas_created_at ON moda_folgas(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE moda_folgas ENABLE ROW LEVEL SECURITY;

-- Policies para permitir acesso autenticado
CREATE POLICY "Permitir leitura para usuários autenticados" ON moda_folgas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON moda_folgas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON moda_folgas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão para usuários autenticados" ON moda_folgas
    FOR DELETE USING (auth.role() = 'authenticated');

-- Comentário para documentação
COMMENT ON TABLE moda_folgas IS 'Tabela para controle de folgas dos consultores de moda - estrutura idêntica aos móveis'; 