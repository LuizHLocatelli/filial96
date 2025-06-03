-- Atualizar tabela de monitoramento da moda para ser mais robusta
-- Migração criada em: 2024-12-15

-- Adicionar novos campos à tabela existente
ALTER TABLE moda_monitoramento 
ADD COLUMN IF NOT EXISTS acao VARCHAR,
ADD COLUMN IF NOT EXISTS detalhes JSONB,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Criar tabela para eventos detalhados
CREATE TABLE IF NOT EXISTS moda_eventos_detalhados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  evento_tipo VARCHAR NOT NULL,
  secao VARCHAR NOT NULL,
  dados JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para sessões de usuário
CREATE TABLE IF NOT EXISTS moda_sessoes_usuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR NOT NULL,
  inicio_sessao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fim_sessao TIMESTAMP WITH TIME ZONE,
  duracao_total_segundos INTEGER,
  paginas_visitadas JSONB DEFAULT '[]',
  acoes_realizadas INTEGER DEFAULT 0,
  dispositivo VARCHAR,
  navegador VARCHAR,
  ip_address INET
);

-- Criar tabela para métricas diárias
CREATE TABLE IF NOT EXISTS moda_metricas_diarias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  total_usuarios_unicos INTEGER DEFAULT 0,
  total_sessoes INTEGER DEFAULT 0,
  tempo_medio_sessao INTEGER DEFAULT 0,
  secao_mais_acessada VARCHAR,
  total_acoes INTEGER DEFAULT 0,
  arquivos_mais_baixados JSONB DEFAULT '[]',
  produtos_mais_visualizados JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(data)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_moda_eventos_detalhados_user_id ON moda_eventos_detalhados(user_id);
CREATE INDEX IF NOT EXISTS idx_moda_eventos_detalhados_evento_tipo ON moda_eventos_detalhados(evento_tipo);
CREATE INDEX IF NOT EXISTS idx_moda_eventos_detalhados_secao ON moda_eventos_detalhados(secao);
CREATE INDEX IF NOT EXISTS idx_moda_eventos_detalhados_created_at ON moda_eventos_detalhados(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_moda_sessoes_user_id ON moda_sessoes_usuario(user_id);
CREATE INDEX IF NOT EXISTS idx_moda_sessoes_session_id ON moda_sessoes_usuario(session_id);
CREATE INDEX IF NOT EXISTS idx_moda_sessoes_inicio ON moda_sessoes_usuario(inicio_sessao DESC);

CREATE INDEX IF NOT EXISTS idx_moda_metricas_data ON moda_metricas_diarias(data DESC);

-- Índices JSONB para queries específicas
CREATE INDEX IF NOT EXISTS idx_moda_monitoramento_detalhes ON moda_monitoramento USING GIN (detalhes);
CREATE INDEX IF NOT EXISTS idx_moda_monitoramento_metadata ON moda_monitoramento USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_moda_eventos_dados ON moda_eventos_detalhados USING GIN (dados);

-- RLS (Row Level Security)
ALTER TABLE moda_eventos_detalhados ENABLE ROW LEVEL SECURITY;
ALTER TABLE moda_sessoes_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE moda_metricas_diarias ENABLE ROW LEVEL SECURITY;

-- Policies para permitir acesso autenticado
CREATE POLICY "Permitir leitura para usuários autenticados" ON moda_eventos_detalhados
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON moda_eventos_detalhados
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura para usuários autenticados" ON moda_sessoes_usuario
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON moda_sessoes_usuario
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON moda_sessoes_usuario
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura para usuários autenticados" ON moda_metricas_diarias
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados" ON moda_metricas_diarias
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Função para atualizar métricas diárias automaticamente
CREATE OR REPLACE FUNCTION update_moda_daily_metrics()
RETURNS void AS $$
BEGIN
  INSERT INTO moda_metricas_diarias (
    data,
    total_usuarios_unicos,
    total_sessoes,
    tempo_medio_sessao,
    secao_mais_acessada,
    total_acoes
  )
  SELECT 
    CURRENT_DATE,
    COUNT(DISTINCT user_id) as total_usuarios_unicos,
    COUNT(DISTINCT session_id) as total_sessoes,
    ROUND(AVG(COALESCE(duracao_segundos, 180))) as tempo_medio_sessao,
    (
      SELECT secao 
      FROM moda_monitoramento 
      WHERE DATE(timestamp) = CURRENT_DATE 
      GROUP BY secao 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ) as secao_mais_acessada,
    COUNT(*) as total_acoes
  FROM moda_monitoramento
  WHERE DATE(timestamp) = CURRENT_DATE
  ON CONFLICT (data) DO UPDATE SET
    total_usuarios_unicos = EXCLUDED.total_usuarios_unicos,
    total_sessoes = EXCLUDED.total_sessoes,
    tempo_medio_sessao = EXCLUDED.tempo_medio_sessao,
    secao_mais_acessada = EXCLUDED.secao_mais_acessada,
    total_acoes = EXCLUDED.total_acoes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter relatório completo de monitoramento
CREATE OR REPLACE FUNCTION get_moda_monitoring_report(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
  metric_name TEXT,
  metric_value NUMERIC,
  metric_details JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'usuarios_unicos'::TEXT as metric_name,
    COUNT(DISTINCT user_id)::NUMERIC as metric_value,
    jsonb_build_object('period_days', days_back) as metric_details
  FROM moda_monitoramento 
  WHERE timestamp >= CURRENT_DATE - INTERVAL '1 day' * days_back
  
  UNION ALL
  
  SELECT 
    'total_acoes'::TEXT as metric_name,
    COUNT(*)::NUMERIC as metric_value,
    jsonb_build_object('period_days', days_back) as metric_details
  FROM moda_monitoramento 
  WHERE timestamp >= CURRENT_DATE - INTERVAL '1 day' * days_back
  
  UNION ALL
  
  SELECT 
    'secoes_mais_usadas'::TEXT as metric_name,
    0::NUMERIC as metric_value,
    jsonb_agg(
      jsonb_build_object(
        'secao', secao,
        'total_acessos', total_acessos,
        'usuarios_unicos', usuarios_unicos
      )
    ) as metric_details
  FROM (
    SELECT 
      secao,
      COUNT(*) as total_acessos,
      COUNT(DISTINCT user_id) as usuarios_unicos
    FROM moda_monitoramento 
    WHERE timestamp >= CURRENT_DATE - INTERVAL '1 day' * days_back
    GROUP BY secao
    ORDER BY total_acessos DESC
    LIMIT 10
  ) secoes_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON TABLE moda_eventos_detalhados IS 'Tabela para eventos detalhados com dados estruturados em JSONB';
COMMENT ON TABLE moda_sessoes_usuario IS 'Tabela para rastrear sessões completas dos usuários na seção Moda';
COMMENT ON TABLE moda_metricas_diarias IS 'Tabela para métricas agregadas diárias da seção Moda';

COMMENT ON COLUMN moda_monitoramento.acao IS 'Tipo de ação realizada pelo usuário';
COMMENT ON COLUMN moda_monitoramento.detalhes IS 'Detalhes estruturados da ação em formato JSONB';
COMMENT ON COLUMN moda_monitoramento.metadata IS 'Metadados adicionais da ação em formato JSONB'; 