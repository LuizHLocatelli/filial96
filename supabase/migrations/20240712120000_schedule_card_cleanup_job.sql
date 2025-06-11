-- Ativar a extensão pg_cron se ainda não estiver ativa
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Permitir que o usuário `postgres` use pg_cron
GRANT USAGE ON SCHEMA cron TO postgres;

-- (Opcional) Remover agendamento antigo, se existir, para evitar duplicatas
SELECT cron.unschedule('daily-expired-card-cleanup');

-- Agendar a função para ser executada todos os dias à meia-noite (UTC)
SELECT
    cron.schedule(
        'daily-expired-card-cleanup', -- Nome do trabalho
        '0 0 * * *', -- Expressão Cron: "às 00:00 todos os dias"
        $$
        SELECT
            net.http_post(
                url := 'https://abpsafkioslfjqtgtvbi.supabase.co/functions/v1/delete-expired-cards',
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer ' || secrets.get('service_role_key')
                )
            )
        FROM
            pg_net.http_collect_response(
                net.http_post(
                    url := 'https://abpsafkioslfjqtgtvbi.supabase.co/functions/v1/delete-expired-cards',
                    headers := jsonb_build_object(
                        'Content-Type', 'application/json',
                        'Authorization', 'Bearer ' || secrets.get('service_role_key')
                    )
                ),
                async := false
            )
        $$
    ); 