-- Remover completamente o sistema de atividades do Supabase
-- Esta migração remove todas as tabelas, políticas e referências relacionadas a atividades

-- 1. Remover políticas RLS da tabela activities
DROP POLICY IF EXISTS "Users can view their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can create activities" ON public.activities;

-- 2. Remover triggers de auditoria se existirem
DROP TRIGGER IF EXISTS audit_activities_changes ON public.activities;

-- 3. Remover políticas RLS da tabela notification_read_status
DROP POLICY IF EXISTS "Usuários podem ver seu próprio status de leitura" ON public.notification_read_status;
DROP POLICY IF EXISTS "Usuários podem marcar suas próprias notificações como lidas" ON public.notification_read_status;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio status de leitura" ON public.notification_read_status;
DROP POLICY IF EXISTS "Users can view their own notification status" ON public.notification_read_status;
DROP POLICY IF EXISTS "Users can update their own notification status" ON public.notification_read_status;

-- 4. Remover a tabela notification_read_status (que depende de activities)
DROP TABLE IF EXISTS public.notification_read_status CASCADE;

-- 5. Remover a tabela activities
DROP TABLE IF EXISTS public.activities CASCADE;

-- 6. Remover outras estruturas relacionadas se existirem
DROP TABLE IF EXISTS public.central_atividades CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.activity_attachments CASCADE;

-- 7. Remover funções relacionadas a atividades se existirem
DROP FUNCTION IF EXISTS public.create_activity(text, text, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_activity_status(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_activities(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.mark_notification_as_read(uuid, uuid) CASCADE;

-- 8. Remover views relacionadas se existirem
DROP VIEW IF EXISTS public.activities_with_status CASCADE;
DROP VIEW IF EXISTS public.user_notification_summary CASCADE;

-- 9. Remover tipos customizados relacionados a atividades se existirem
DROP TYPE IF EXISTS public.activity_status CASCADE;
DROP TYPE IF EXISTS public.activity_priority CASCADE;

-- Comentários de documentação
COMMENT ON SCHEMA public IS 'Sistema de atividades foi completamente removido conforme solicitado - todas as tabelas, políticas e estruturas relacionadas foram excluídas'; 