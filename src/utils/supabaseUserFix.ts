import { supabase } from '@/integrations/supabase/client';
import { supabaseLogger } from './supabaseLogger';

interface UserFixResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Verifica se o usuário atual tem perfil
 */
export async function checkCurrentUserProfile(): Promise<UserFixResult> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return {
        success: false,
        message: 'Erro ao verificar sessão',
        details: sessionError
      };
    }

    if (!session?.user) {
      return {
        success: false,
        message: 'Usuário não está logado'
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, role, phone')
      .eq('id', session.user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      return {
        success: false,
        message: 'Perfil não encontrado',
        details: { userId: session.user.id, userEmail: session.user.email }
      };
    }

    if (profileError) {
      return {
        success: false,
        message: 'Erro ao verificar perfil',
        details: profileError
      };
    }

    return {
      success: true,
      message: 'Perfil encontrado',
      details: profile
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro inesperado ao verificar perfil',
      details: error
    };
  }
}

/**
 * Cria perfil para o usuário atual se não existir
 */
export async function createProfileForCurrentUser(): Promise<UserFixResult> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return {
        success: false,
        message: 'Usuário não está logado'
      };
    }

    const user = session.user;
    
    // Extrair dados dos metadados do usuário
    const userData = user.user_metadata || {};
    const name = userData.name || user.email?.split('@')[0] || 'Usuário';
    const role = userData.role || 'consultor_moveis';
    const phone = userData.phone || '';

    supabaseLogger.info('PROFILE.CREATE', 'Tentando criar perfil para usuário atual', {
      userId: user.id,
      email: user.email,
      name,
      role
    });

    const { data: profile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name,
        role,
        phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      supabaseLogger.error('PROFILE.CREATE', 'Erro ao criar perfil', createError);
      
      // Verificar se o erro é porque o perfil já existe
      if (createError.code === '23505') { // unique_violation
        return {
          success: true,
          message: 'Perfil já existe',
          details: { userId: user.id }
        };
      }

      return {
        success: false,
        message: 'Erro ao criar perfil',
        details: createError
      };
    }

    supabaseLogger.info('PROFILE.CREATE', 'Perfil criado com sucesso', profile);

    return {
      success: true,
      message: 'Perfil criado com sucesso',
      details: profile
    };
  } catch (error) {
    supabaseLogger.error('PROFILE.CREATE', 'Erro inesperado', error);
    return {
      success: false,
      message: 'Erro inesperado ao criar perfil',
      details: error
    };
  }
}

/**
 * Diagnóstica e corrige automaticamente problemas de perfil
 */
export async function autoFixUserProfile(): Promise<UserFixResult> {
  try {
    supabaseLogger.info('PROFILE.AUTOFIX', 'Iniciando verificação automática de perfil');

    // Primeiro, verificar se existe perfil
    const checkResult = await checkCurrentUserProfile();
    
    if (checkResult.success) {
      supabaseLogger.info('PROFILE.AUTOFIX', 'Perfil já existe, nenhuma ação necessária');
      return {
        success: true,
        message: 'Perfil já existe e está configurado corretamente',
        details: checkResult.details
      };
    }

    // Se não existe perfil, tentar criar
    if (checkResult.message === 'Perfil não encontrado') {
      supabaseLogger.info('PROFILE.AUTOFIX', 'Perfil não encontrado, tentando criar');
      const createResult = await createProfileForCurrentUser();
      
      if (createResult.success) {
        supabaseLogger.info('PROFILE.AUTOFIX', 'Perfil criado automaticamente');
        return {
          success: true,
          message: 'Perfil criado automaticamente com sucesso',
          details: createResult.details
        };
      } else {
        supabaseLogger.error('PROFILE.AUTOFIX', 'Falha ao criar perfil automaticamente', createResult);
        return createResult;
      }
    }

    // Outro tipo de erro
    supabaseLogger.warn('PROFILE.AUTOFIX', 'Erro não tratado na verificação', checkResult);
    return checkResult;

  } catch (error) {
    supabaseLogger.error('PROFILE.AUTOFIX', 'Erro inesperado na correção automática', error);
    return {
      success: false,
      message: 'Erro inesperado na correção automática',
      details: error
    };
  }
}

/**
 * Força a atualização do perfil com dados dos metadados do usuário
 */
export async function updateProfileFromUserMetadata(): Promise<UserFixResult> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return {
        success: false,
        message: 'Usuário não está logado'
      };
    }

    const user = session.user;
    const userData = user.user_metadata || {};
    
    const updates = {
      name: userData.name || user.email?.split('@')[0] || 'Usuário',
      role: userData.role || 'consultor_moveis',
      phone: userData.phone || '',
      updated_at: new Date().toISOString()
    };

    supabaseLogger.info('PROFILE.UPDATE', 'Atualizando perfil com metadados do usuário', updates);

    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      supabaseLogger.error('PROFILE.UPDATE', 'Erro ao atualizar perfil', updateError);
      return {
        success: false,
        message: 'Erro ao atualizar perfil',
        details: updateError
      };
    }

    supabaseLogger.info('PROFILE.UPDATE', 'Perfil atualizado com sucesso', profile);
    return {
      success: true,
      message: 'Perfil atualizado com sucesso',
      details: profile
    };
  } catch (error) {
    supabaseLogger.error('PROFILE.UPDATE', 'Erro inesperado ao atualizar perfil', error);
    return {
      success: false,
      message: 'Erro inesperado ao atualizar perfil',
      details: error
    };
  }
}

// Função para uso no console do navegador
if (typeof window !== 'undefined') {
  (window as any).supabaseUserFix = {
    checkCurrentUserProfile,
    createProfileForCurrentUser,
    autoFixUserProfile,
    updateProfileFromUserMetadata
  };
} 