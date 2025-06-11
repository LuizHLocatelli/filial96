CREATE OR REPLACE FUNCTION get_painel_metas_data()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  first_day_of_month DATE;
BEGIN
  first_day_of_month := date_trunc('month', NOW())::date;

  WITH
  monthly_sales AS (
    SELECT
      goal_id,
      consultant_id,
      SUM(value) as total_vendido
    FROM sales_records
    WHERE created_at >= first_day_of_month
    GROUP BY goal_id, consultant_id
  ),
  weekly_sales AS (
    SELECT
      goal_id,
      consultant_id,
      SUM(value) as total_vendido
    FROM sales_records
    WHERE created_at >= date_trunc('week', NOW())::date
    GROUP BY goal_id, consultant_id
  ),
  daily_sales AS (
    SELECT
      goal_id,
      consultant_id,
      SUM(value) as total_vendido
    FROM sales_records
    WHERE created_at >= date_trunc('day', NOW())::date
    GROUP BY goal_id, consultant_id
  )
  SELECT jsonb_agg(setores) INTO result
  FROM (
    SELECT
      g.id,
      g.sector_name AS nome,
      jsonb_build_object(
        'valor', g.monthly_goal,
        'atingido', COALESCE(SUM(ms.total_vendido), 0)
      ) AS metaMensal,
      (
        SELECT jsonb_agg(consultores)
        FROM (
          SELECT
            p.id,
            p.name AS nome,
            p.avatar_url AS avatar,
            p.role,
            jsonb_build_object(
              'id', cg.id,
              'valor', cg.monthly_goal,
              'atingido', COALESCE(ms_ind.total_vendido, 0)
            ) AS metaMensal,
            jsonb_build_object(
              'valor', cg.monthly_goal / 4,
              'atingido', COALESCE(ws_ind.total_vendido, 0)
            ) AS metaSemanal,
            jsonb_agg(
              jsonb_build_object(
                'dia', TO_CHAR(days.d, 'Dy'),
                'meta', jsonb_build_object(
                  'valor', cg.monthly_goal / 22,
                  'atingido', COALESCE(ds_ind.total_vendido, 0)
                )
              )
            ) AS metasDiarias
          FROM profiles p
          LEFT JOIN consultant_goals cg ON p.id = cg.consultant_id AND cg.goal_id = g.id
          LEFT JOIN monthly_sales ms_ind ON p.id = ms_ind.consultant_id AND ms_ind.goal_id = g.id
          LEFT JOIN weekly_sales ws_ind ON p.id = ws_ind.consultant_id AND ws_ind.goal_id = g.id
          LEFT JOIN daily_sales ds_ind ON p.id = ds_ind.consultant_id AND ds_ind.goal_id = g.id
          CROSS JOIN (SELECT generate_series(date_trunc('week', now()), date_trunc('week', now()) + interval '5 days', '1 day')::date as d) as days
          WHERE p.role = CASE WHEN g.sector_name = 'Eletromóveis' THEN 'consultor_moveis' ELSE 'consultor_moda' END
          GROUP BY p.id, p.name, p.avatar_url, p.role, cg.id, cg.monthly_goal, ms_ind.total_vendido, ws_ind.total_vendido, ds_ind.total_vendido
        ) AS consultores
      ) AS consultores
    FROM goals g
    LEFT JOIN monthly_sales ms ON g.id = ms.goal_id
    WHERE g.month >= first_day_of_month
    GROUP BY g.id, g.sector_name
  ) AS setores;

  RETURN result;
END;
$$ LANGUAGE plpgsql; 