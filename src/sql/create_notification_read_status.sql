
-- Cria tabela para armazenar o status de leitura das notificações
CREATE TABLE IF NOT EXISTS notification_read_status (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  activity_id uuid NOT NULL,
  read boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, activity_id)
);

-- Adiciona política de segurança para leitura
CREATE POLICY "Usuários podem ver seu próprio status de leitura"
  ON notification_read_status
  FOR SELECT
  USING (auth.uid() = user_id);

-- Adiciona política de segurança para inserção
CREATE POLICY "Usuários podem marcar suas próprias notificações como lidas"
  ON notification_read_status
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Adiciona política de segurança para atualização
CREATE POLICY "Usuários podem atualizar seu próprio status de leitura"
  ON notification_read_status
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Ativa RLS na tabela
ALTER TABLE notification_read_status ENABLE ROW LEVEL SECURITY;
