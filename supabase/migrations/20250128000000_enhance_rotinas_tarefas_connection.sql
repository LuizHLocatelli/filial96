-- Migração para melhorar conexão entre Rotinas e Tarefas
-- Data: 2025-01-28

-- 1. Adicionar campos para geração automática de tarefas nas rotinas
ALTER TABLE moveis_rotinas 
ADD COLUMN IF NOT EXISTS gera_tarefa_automatica BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS template_tarefa JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tarefas_relacionadas TEXT[] DEFAULT '{}';

-- 2. Adicionar campos para conectar tarefas às rotinas
ALTER TABLE moveis_tarefas 
ADD COLUMN IF NOT EXISTS rotina_id UUID REFERENCES moveis_rotinas(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS origem TEXT DEFAULT 'manual' CHECK (origem IN ('manual', 'rotina', 'orientacao')),
ADD COLUMN IF NOT EXISTS dependencias TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente'));

-- 3. Adicionar campo para vincular tarefa gerada na conclusão da rotina
ALTER TABLE moveis_rotinas_conclusoes 
ADD COLUMN IF NOT EXISTS tarefa_gerada_id UUID REFERENCES moveis_tarefas(id) ON DELETE SET NULL;

-- 4. Criar índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_moveis_tarefas_rotina_id ON moveis_tarefas(rotina_id);
CREATE INDEX IF NOT EXISTS idx_moveis_tarefas_origem ON moveis_tarefas(origem);
CREATE INDEX IF NOT EXISTS idx_moveis_tarefas_prioridade ON moveis_tarefas(prioridade);
CREATE INDEX IF NOT EXISTS idx_moveis_rotinas_gera_tarefa ON moveis_rotinas(gera_tarefa_automatica);

-- 5. Atualizar RLS (Row Level Security) para os novos campos
-- As políticas existentes já cobrem os novos campos, mas vamos garantir

-- Comentários para documentação
COMMENT ON COLUMN moveis_rotinas.gera_tarefa_automatica IS 'Indica se a rotina deve gerar tarefas automaticamente';
COMMENT ON COLUMN moveis_rotinas.template_tarefa IS 'Template JSON para geração automática de tarefas';
COMMENT ON COLUMN moveis_rotinas.tarefas_relacionadas IS 'Array de IDs de tarefas relacionadas a esta rotina';

COMMENT ON COLUMN moveis_tarefas.rotina_id IS 'ID da rotina que gerou esta tarefa (se aplicável)';
COMMENT ON COLUMN moveis_tarefas.origem IS 'Como a tarefa foi criada: manual, rotina ou orientacao';
COMMENT ON COLUMN moveis_tarefas.dependencias IS 'Array de IDs de outras tarefas/rotinas que são dependências';
COMMENT ON COLUMN moveis_tarefas.prioridade IS 'Prioridade da tarefa: baixa, media, alta, urgente';

COMMENT ON COLUMN moveis_rotinas_conclusoes.tarefa_gerada_id IS 'ID da tarefa gerada quando esta rotina foi concluída';

-- 6. Função para buscar estatísticas de conexões (opcional, para relatórios)
CREATE OR REPLACE FUNCTION get_connection_stats()
RETURNS TABLE(
  total_rotinas BIGINT,
  rotinas_com_tarefas BIGINT,
  total_tarefas BIGINT,
  tarefas_de_rotinas BIGINT,
  score_conexoes NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      (SELECT COUNT(*) FROM moveis_rotinas WHERE ativo = true) as total_rot,
      (SELECT COUNT(DISTINCT rotina_id) FROM moveis_tarefas WHERE rotina_id IS NOT NULL) as rot_com_tar,
      (SELECT COUNT(*) FROM moveis_tarefas) as total_tar,
      (SELECT COUNT(*) FROM moveis_tarefas WHERE rotina_id IS NOT NULL) as tar_de_rot
  )
  SELECT 
    total_rot,
    rot_com_tar,
    total_tar,
    tar_de_rot,
    CASE 
      WHEN (total_rot + total_tar) > 0 
      THEN ROUND(((rot_com_tar + tar_de_rot)::NUMERIC / (total_rot + total_tar)) * 100, 2)
      ELSE 0
    END as score
  FROM stats;
END;
$$; 