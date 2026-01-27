-- Remoção de tabelas e funções de monitoramento da Moda
-- Criado em: 2026-01-25

-- Remover funções relacionadas ao monitoramento
DROP FUNCTION IF EXISTS update_moda_daily_metrics();
DROP FUNCTION IF EXISTS get_moda_monitoring_report(INTEGER);

-- Remover tabelas de monitoramento (ordem importante por causa das foreign keys)
DROP TABLE IF EXISTS moda_metricas_diarias CASCADE;
DROP TABLE IF EXISTS moda_sessoes_usuario CASCADE;
DROP TABLE IF EXISTS moda_eventos_detalhados CASCADE;

-- Remover colunas adicionais da tabela moda_monitoramento (se existirem)
ALTER TABLE moda_monitoramento DROP COLUMN IF EXISTS acao;
ALTER TABLE moda_monitoramento DROP COLUMN IF EXISTS detalhes;
ALTER TABLE moda_monitoramento DROP COLUMN IF EXISTS metadata;
