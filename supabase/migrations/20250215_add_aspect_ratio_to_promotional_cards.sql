-- Migration: Adicionar campo aspect_ratio à tabela promotional_cards
-- Data: 2025-02-15

-- Adiciona coluna aspect_ratio com valor padrão 4:5
ALTER TABLE promotional_cards 
ADD COLUMN IF NOT EXISTS aspect_ratio VARCHAR(10) DEFAULT '4:5';

-- Comentário explicativo
COMMENT ON COLUMN promotional_cards.aspect_ratio IS 'Formato do card: 1:1 (quadrado), 3:4 (retrato) ou 4:5 (retrato - padrão)';

-- Cria índice para consultas por aspect_ratio
CREATE INDEX IF NOT EXISTS idx_promotional_cards_aspect_ratio 
ON promotional_cards(aspect_ratio);

-- Valida os valores permitidos
ALTER TABLE promotional_cards 
ADD CONSTRAINT chk_aspect_ratio 
CHECK (aspect_ratio IN ('1:1', '3:4', '4:5'));
