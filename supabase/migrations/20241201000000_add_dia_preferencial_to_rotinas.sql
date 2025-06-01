-- Adiciona campo dia_preferencial à tabela moveis_rotinas
ALTER TABLE moveis_rotinas 
ADD COLUMN IF NOT EXISTS dia_preferencial TEXT NOT NULL DEFAULT 'segunda';

-- Comentário explicativo sobre o campo
COMMENT ON COLUMN moveis_rotinas.dia_preferencial IS 'Dia da semana preferencial para execução da rotina (segunda, terca, quarta, quinta, sexta, sabado, domingo)'; 