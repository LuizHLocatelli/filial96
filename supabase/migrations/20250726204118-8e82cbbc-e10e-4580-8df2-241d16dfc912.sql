-- Fix all remaining database functions with search_path security issues

-- Fix register_orientacao_view function
CREATE OR REPLACE FUNCTION public.register_orientacao_view(p_orientacao_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_role TEXT;
  v_result JSON;
BEGIN
  -- Verificar se o usuário existe e obter seu cargo
  SELECT role INTO v_user_role
  FROM public.profiles 
  WHERE id = p_user_id;
  
  IF v_user_role IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;
  
  -- Inserir ou atualizar visualização
  INSERT INTO public.moveis_orientacoes_visualizacoes (
    orientacao_id,
    user_id,
    user_role,
    viewed_at
  )
  VALUES (
    p_orientacao_id,
    p_user_id,
    v_user_role,
    NOW()
  )
  ON CONFLICT (orientacao_id, user_id) 
  DO UPDATE SET
    viewed_at = NOW(),
    user_role = v_user_role;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Visualização registrada com sucesso'
  );
END;
$$;

-- Fix calculate_deposit_statistics function
CREATE OR REPLACE FUNCTION public.calculate_deposit_statistics(target_user_id uuid, target_month date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    month_start DATE;
    month_end DATE;
    working_days_count INTEGER;
    complete_days_count INTEGER;
    partial_days_count INTEGER;
    missed_days_count INTEGER;
    completion_rate_calc DECIMAL(5,2);
    punctuality_rate_calc DECIMAL(5,2);
    avg_hour INTEGER;
    before_10h_count INTEGER;
    after_12h_count INTEGER;
    current_streak_calc INTEGER;
    max_streak_calc INTEGER;
BEGIN
    -- Calcular início e fim do mês
    month_start := DATE_TRUNC('month', target_month);
    month_end := month_start + INTERVAL '1 month - 1 day';
    
    -- Calcular dias úteis (excluindo domingos - 0)
    WITH working_days AS (
        SELECT generate_series(month_start, month_end, '1 day'::interval) AS day
    ),
    filtered_days AS (
        SELECT day FROM working_days 
        WHERE EXTRACT(DOW FROM day) NOT IN (0) -- Excluir apenas domingo
    )
    SELECT COUNT(*) INTO working_days_count FROM filtered_days;
    
    -- Contar dias completos (com comprovante E já incluído)
    SELECT COUNT(DISTINCT d.data) INTO complete_days_count
    FROM public.crediario_depositos d
    WHERE d.created_by = target_user_id
      AND d.data >= month_start 
      AND d.data <= month_end
      AND d.comprovante IS NOT NULL 
      AND d.comprovante != ''
      AND d.ja_incluido = true;
    
    -- Contar dias parciais (com comprovante mas NÃO incluído)
    SELECT COUNT(DISTINCT d.data) INTO partial_days_count
    FROM public.crediario_depositos d
    WHERE d.created_by = target_user_id
      AND d.data >= month_start 
      AND d.data <= month_end
      AND d.comprovante IS NOT NULL 
      AND d.comprovante != ''
      AND d.ja_incluido = false;
    
    -- Calcular dias perdidos
    missed_days_count := working_days_count - complete_days_count - partial_days_count;
    
    -- Taxa de conclusão
    completion_rate_calc := CASE 
        WHEN working_days_count > 0 THEN (complete_days_count::DECIMAL / working_days_count::DECIMAL) * 100
        ELSE 0
    END;
    
    -- Depósitos antes das 10h (pontuais)
    SELECT COUNT(*) INTO before_10h_count
    FROM public.crediario_depositos d
    WHERE d.created_by = target_user_id
      AND d.data >= month_start 
      AND d.data <= month_end
      AND d.comprovante IS NOT NULL
      AND EXTRACT(HOUR FROM d.created_at) < 10;
    
    -- Taxa de pontualidade
    punctuality_rate_calc := CASE 
        WHEN complete_days_count > 0 THEN (before_10h_count::DECIMAL / complete_days_count::DECIMAL) * 100
        ELSE 0
    END;
    
    -- Depósitos após 12h (perdeu prazo)
    SELECT COUNT(*) INTO after_12h_count
    FROM public.crediario_depositos d
    WHERE d.created_by = target_user_id
      AND d.data >= month_start 
      AND d.data <= month_end
      AND d.comprovante IS NOT NULL
      AND EXTRACT(HOUR FROM d.created_at) >= 12;
    
    -- Hora média dos depósitos
    SELECT COALESCE(ROUND(AVG(EXTRACT(HOUR FROM d.created_at))), 0) INTO avg_hour
    FROM public.crediario_depositos d
    WHERE d.created_by = target_user_id
      AND d.data >= month_start 
      AND d.data <= month_end
      AND d.comprovante IS NOT NULL;
    
    -- Calcular streak atual (simplificado - apenas para o mês)
    current_streak_calc := complete_days_count;
    max_streak_calc := complete_days_count;
    
    -- Inserir ou atualizar estatísticas
    INSERT INTO public.crediario_depositos_statistics (
        user_id,
        month_year,
        working_days,
        complete_days,
        partial_days,
        missed_days,
        completion_rate,
        punctuality_rate,
        average_deposit_hour,
        deposits_before_10h,
        deposits_after_12h,
        current_streak,
        max_streak_month,
        last_calculated_at
    ) VALUES (
        target_user_id,
        month_start,
        working_days_count,
        complete_days_count,
        partial_days_count,
        missed_days_count,
        completion_rate_calc,
        punctuality_rate_calc,
        avg_hour,
        before_10h_count,
        after_12h_count,
        current_streak_calc,
        max_streak_calc,
        NOW()
    ) ON CONFLICT (user_id, month_year) DO UPDATE SET
        working_days = EXCLUDED.working_days,
        complete_days = EXCLUDED.complete_days,
        partial_days = EXCLUDED.partial_days,
        missed_days = EXCLUDED.missed_days,
        completion_rate = EXCLUDED.completion_rate,
        punctuality_rate = EXCLUDED.punctuality_rate,
        average_deposit_hour = EXCLUDED.average_deposit_hour,
        deposits_before_10h = EXCLUDED.deposits_before_10h,
        deposits_after_12h = EXCLUDED.deposits_after_12h,
        current_streak = EXCLUDED.current_streak,
        max_streak_month = EXCLUDED.max_streak_month,
        last_calculated_at = NOW(),
        updated_at = NOW();
        
END;
$$;

-- Fix trigger_update_deposit_statistics function
CREATE OR REPLACE FUNCTION public.trigger_update_deposit_statistics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    target_user_id UUID;
    target_month DATE;
BEGIN
    -- Determinar o usuário e mês baseado na operação
    IF TG_OP = 'DELETE' THEN
        target_user_id := OLD.created_by;
        target_month := OLD.data;
    ELSE
        target_user_id := NEW.created_by;
        target_month := NEW.data;
    END IF;
    
    -- Calcular estatísticas para o mês afetado
    PERFORM public.calculate_deposit_statistics(target_user_id, target_month);
    
    -- Se houve mudança de mês (UPDATE), recalcular o mês anterior também
    IF TG_OP = 'UPDATE' AND DATE_TRUNC('month', OLD.data) != DATE_TRUNC('month', NEW.data) THEN
        PERFORM public.calculate_deposit_statistics(OLD.created_by, OLD.data);
    END IF;
    
    -- Retornar o registro apropriado
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Fix remaining functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_depositos_statistics_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_moveis_produto_foco_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_moda_reserva_expiracao()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Se é cliente VIP, definir expiração para 1 ano no futuro
  IF NEW.cliente_vip = true THEN
    NEW.data_expiracao := NEW.data_reserva + INTERVAL '1 year';
  ELSE
    -- Para clientes normais, manter 72 horas
    NEW.data_expiracao := NEW.data_reserva + INTERVAL '72 hours';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_sensitive_operation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Log to system logs for audit purposes
    RAISE LOG 'Sensitive operation: % on table % by user %', TG_OP, TG_TABLE_NAME, auth.uid();
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;