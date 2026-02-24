-- Fix remaining database functions with search_path security issues

-- Fix ensure_user_profile function
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result json;
  user_record record;
BEGIN
  -- Buscar dados do usuário
  SELECT * INTO user_record FROM auth.users WHERE id = user_id;
  
  IF NOT FOUND THEN
    result := json_build_object(
      'success', false,
      'error', 'Usuario nao encontrado'
    );
    RETURN result;
  END IF;
  
  -- Verificar se já tem perfil
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    result := json_build_object(
      'success', true,
      'message', 'Perfil ja existe',
      'profile_id', user_id
    );
    RETURN result;
  END IF;
  
  -- Tentar criar perfil
  BEGIN
    INSERT INTO public.profiles (
      id, 
      name, 
      role, 
      phone, 
      created_at, 
      updated_at
    ) VALUES (
      user_id,
      COALESCE(user_record.raw_user_meta_data->>'name', user_record.email, 'Usuário'),
      COALESCE(user_record.raw_user_meta_data->>'role', 'consultor_moveis'),
      COALESCE(user_record.raw_user_meta_data->>'phone', ''),
      NOW(),
      NOW()
    );
    
    result := json_build_object(
      'success', true,
      'message', 'Perfil criado com sucesso',
      'profile_id', user_id
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      result := json_build_object(
        'success', false,
        'error', SQLERRM,
        'state', SQLSTATE
      );
  END;
  
  RETURN result;
END;
$$;

-- Fix handle_new_user function (trigger function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    user_name text;
    user_phone text;
    user_role text;
    profile_exists boolean;
BEGIN
    -- Extract user data from metadata
    user_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'Usuário');
    user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'consultor_moveis');
    
    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = NEW.id) INTO profile_exists;
    
    IF NOT profile_exists THEN
        BEGIN
            INSERT INTO public.profiles (id, name, phone, role, created_at, updated_at)
            VALUES (NEW.id, user_name, user_phone, user_role, NOW(), NOW());
            
            RAISE LOG 'Profile created for user %', NEW.id;
        EXCEPTION
            WHEN unique_violation THEN
                RAISE LOG 'Profile already exists for user %', NEW.id;
            WHEN OTHERS THEN
                RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        END;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Fix other critical functions with search_path
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'gerente'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_id UUID;
  deletion_count INTEGER := 0;
  result JSONB;
BEGIN
  -- Obter o ID do usuário atual
  current_user_id := auth.uid();
  
  -- Verificar se o usuário existe
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User not authenticated';
  END IF;
  
  -- Log do início da operação
  RAISE LOG 'Iniciando exclusão de dados para usuário: %', current_user_id;
  
  -- Excluir logs OCR
  DELETE FROM public.ocr_logs WHERE user_id = current_user_id;
  GET DIAGNOSTICS deletion_count = ROW_COUNT;
  RAISE LOG 'Logs OCR excluídos: %', deletion_count;
  
  -- Excluir rotinas e conclusões
  DELETE FROM public.moveis_rotinas_conclusoes WHERE created_by = current_user_id;
  GET DIAGNOSTICS deletion_count = ROW_COUNT;
  RAISE LOG 'Conclusões de rotinas excluídas: %', deletion_count;
  
  DELETE FROM public.moveis_rotinas WHERE created_by = current_user_id;
  GET DIAGNOSTICS deletion_count = ROW_COUNT;
  RAISE LOG 'Rotinas excluídas: %', deletion_count;
  
  -- Excluir produtos foco e relacionados
  DELETE FROM public.moveis_produto_foco_vendas WHERE created_by = current_user_id;
  DELETE FROM public.moveis_produto_foco_imagens WHERE created_by = current_user_id;
  DELETE FROM public.moveis_produto_foco WHERE created_by = current_user_id;
  
  -- Excluir móveis arquivos e categorias
  DELETE FROM public.moveis_arquivos WHERE created_by = current_user_id;
  DELETE FROM public.moveis_categorias WHERE created_by = current_user_id;
  
  -- Excluir tarefas e orientações de móveis
  DELETE FROM public.moveis_tarefas WHERE criado_por = current_user_id;
  DELETE FROM public.moveis_orientacoes WHERE criado_por = current_user_id;
  
  -- Excluir vendas e anexos
  DELETE FROM public.venda_o_attachments WHERE created_by = current_user_id;
  DELETE FROM public.venda_o_sales WHERE created_by = current_user_id;
  
  -- Excluir arquivos e categorias do crediário
  DELETE FROM public.crediario_directory_files WHERE created_by = current_user_id;
  DELETE FROM public.crediario_directory_categories WHERE created_by = current_user_id;
  
  -- Excluir notas e pastas
  DELETE FROM public.crediario_sticky_notes WHERE created_by = current_user_id;
  DELETE FROM public.note_folders WHERE created_by = current_user_id;
  
  -- Excluir dados do crediário
  DELETE FROM public.crediario_depositos WHERE created_by = current_user_id;
  DELETE FROM public.crediario_listagens WHERE created_by = current_user_id;
  
  -- Excluir cards promocionais e pastas
  DELETE FROM public.promotional_cards WHERE created_by = current_user_id;
  DELETE FROM public.card_folders WHERE created_by = current_user_id;
  
  -- Atualizar tarefas onde o usuário está atribuído (set NULL instead of delete)
  UPDATE public.tasks SET assigned_to = NULL WHERE assigned_to = current_user_id;
  GET DIAGNOSTICS deletion_count = ROW_COUNT;
  RAISE LOG 'Tarefas desatribuídas: %', deletion_count;
  
  -- Excluir tarefas criadas pelo usuário
  DELETE FROM public.tasks WHERE created_by = current_user_id;
  GET DIAGNOSTICS deletion_count = ROW_COUNT;
  RAISE LOG 'Tarefas excluídas: %', deletion_count;
  
  -- Excluir perfil do usuário (deve ser por último devido à foreign key)
  DELETE FROM public.profiles WHERE id = current_user_id;
  GET DIAGNOSTICS deletion_count = ROW_COUNT;
  RAISE LOG 'Perfil excluído: %', deletion_count;
  
  -- Construir resultado
  result := jsonb_build_object(
    'success', true,
    'message', 'Dados do usuário excluídos com sucesso',
    'user_id', current_user_id,
    'timestamp', NOW()
  );
  
  RAISE LOG 'Exclusão de dados concluída para usuário: %', current_user_id;
  
  RETURN result;
  
EXCEPTION 
  WHEN OTHERS THEN
    RAISE LOG 'Erro ao excluir dados do usuário %: % %', current_user_id, SQLSTATE, SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'sqlstate', SQLSTATE,
      'user_id', current_user_id
    );
END;
$$;