-- Criar tabelas para a seção de Moda
-- Migração criada em: 2024-12-15

-- 1. Tabela para arquivos do diretório de moda
CREATE TABLE IF NOT EXISTS moda_arquivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL,
  tipo VARCHAR NOT NULL,
  tamanho BIGINT,
  url TEXT,
  categoria VARCHAR DEFAULT 'outros',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por uuid REFERENCES auth.users(id),
  ativo BOOLEAN DEFAULT true
);

-- 2. Tabela para produtos em foco da moda
CREATE TABLE IF NOT EXISTS moda_produto_foco (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto VARCHAR NOT NULL,
  meta_vendas INTEGER NOT NULL DEFAULT 0,
  vendas_atual INTEGER DEFAULT 0,
  prioridade INTEGER DEFAULT 3 CHECK (prioridade IN (1, 2, 3)),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela para folgas do setor de moda
CREATE TABLE IF NOT EXISTS moda_folgas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario VARCHAR NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  tipo VARCHAR NOT NULL DEFAULT 'folga' CHECK (tipo IN ('folga', 'ferias', 'atestado', 'licenca', 'falta')),
  status VARCHAR DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada')),
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  aprovado_por uuid REFERENCES auth.users(id),
  aprovado_em TIMESTAMP WITH TIME ZONE
);

-- 4. Tabela para monitoramento de acesso à seção Moda
CREATE TABLE IF NOT EXISTS moda_monitoramento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  secao VARCHAR NOT NULL CHECK (secao IN ('overview', 'diretorio', 'produto-foco', 'folgas', 'monitoramento')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id VARCHAR NOT NULL,
  duracao_segundos INTEGER,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT
);

-- Índices para melhor performance
-- Índices para moda_arquivos
CREATE INDEX IF NOT EXISTS idx_moda_arquivos_categoria ON moda_arquivos(categoria);
CREATE INDEX IF NOT EXISTS idx_moda_arquivos_criado_em ON moda_arquivos(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_moda_arquivos_ativo ON moda_arquivos(ativo);

-- Índices para moda_produto_foco
CREATE INDEX IF NOT EXISTS idx_moda_produto_foco_prioridade ON moda_produto_foco(prioridade);
CREATE INDEX IF NOT EXISTS idx_moda_produto_foco_ativo ON moda_produto_foco(ativo);

-- Índices para moda_folgas
CREATE INDEX IF NOT EXISTS idx_moda_folgas_data_inicio ON moda_folgas(data_inicio);
CREATE INDEX IF NOT EXISTS idx_moda_folgas_status ON moda_folgas(status);
CREATE INDEX IF NOT EXISTS idx_moda_folgas_funcionario ON moda_folgas(funcionario);

-- Índices para moda_monitoramento
CREATE INDEX IF NOT EXISTS idx_moda_monitoramento_user_id ON moda_monitoramento(user_id);
CREATE INDEX IF NOT EXISTS idx_moda_monitoramento_secao ON moda_monitoramento(secao);
CREATE INDEX IF NOT EXISTS idx_moda_monitoramento_timestamp ON moda_monitoramento(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_moda_monitoramento_session_id ON moda_monitoramento(session_id);

-- Triggers para atualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para moda_produto_foco
CREATE TRIGGER update_moda_produto_foco_updated_at 
    BEFORE UPDATE ON moda_produto_foco 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE moda_arquivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE moda_produto_foco ENABLE ROW LEVEL SECURITY;
ALTER TABLE moda_folgas ENABLE ROW LEVEL SECURITY;
ALTER TABLE moda_monitoramento ENABLE ROW LEVEL SECURITY;

-- Policies para permitir acesso autenticado
CREATE POLICY "Permitir leitura para usuários autenticados" ON moda_arquivos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON moda_arquivos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON moda_arquivos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura para usuários autenticados" ON moda_produto_foco
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON moda_produto_foco
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON moda_produto_foco
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura para usuários autenticados" ON moda_folgas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON moda_folgas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON moda_folgas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura para usuários autenticados" ON moda_monitoramento
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON moda_monitoramento
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE moda_arquivos IS 'Tabela para armazenar arquivos e documentos do setor de moda';
COMMENT ON TABLE moda_produto_foco IS 'Tabela para produtos em foco do setor de moda com metas de vendas';
COMMENT ON TABLE moda_folgas IS 'Tabela para controle de folgas, férias e ausências do setor de moda';
COMMENT ON TABLE moda_monitoramento IS 'Tabela para monitoramento de uso e analytics da seção Moda';

COMMENT ON COLUMN moda_produto_foco.prioridade IS '1=Alta, 2=Média, 3=Baixa';
COMMENT ON COLUMN moda_folgas.tipo IS 'Tipos: folga, ferias, atestado, licenca, falta';
COMMENT ON COLUMN moda_folgas.status IS 'Status: pendente, aprovada, rejeitada';
COMMENT ON COLUMN moda_monitoramento.secao IS 'Seções: overview, diretorio, produto-foco, folgas, monitoramento'; 