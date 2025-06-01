import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { supabaseLogger, logSupabaseOperation } from '@/utils/supabaseLogger';

interface SignupData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: string;
}

interface UseSupabaseSignupReturn {
  isLoading: boolean;
  signUp: (data: SignupData) => Promise<boolean>;
}

// Função auxiliar para retry com backoff exponencial
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Backoff exponencial: 1s, 2s, 4s...
      const delay = baseDelay * Math.pow(2, attempt);
      supabaseLogger.warn('RETRY', `Tentativa ${attempt + 1} falhou, tentando novamente em ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

export function useSupabaseSignup(): UseSupabaseSignupReturn {
  const [isLoading, setIsLoading] = useState(false);

  const signUp = async (data: SignupData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      logSupabaseOperation.auth.signup('Iniciando processo de cadastro...', { email: data.email });
      
      // Criar conta de autenticação com dados do usuário nos metadados
      const authResult = await supabaseLogger.measure('AUTH.SIGNUP', async () => {
        return await retryWithBackoff(async () => {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                name: data.name,
                phone: data.phone,
                role: data.role,
              }
            }
          });

          if (authError) {
            // Tratar erros específicos do Supabase
            if (authError.message.includes('already registered')) {
              throw new Error('EMAIL_ALREADY_EXISTS');
            } else if (authError.message.includes('Password should be')) {
              throw new Error('INVALID_PASSWORD');
            } else if (authError.message.includes('Invalid email')) {
              throw new Error('INVALID_EMAIL');
            } else if (authError.message.includes('Too many requests')) {
              throw new Error('RATE_LIMITED');
            } else if (authError.message.includes('Database error') || authError.message.includes('unable to validate email address')) {
              throw new Error('SIGNUP_SERVICE_ERROR');
            } else {
              supabaseLogger.error('AUTH.SIGNUP', 'Erro detalhado:', authError);
              throw new Error(`AUTH_ERROR: ${authError.message}`);
            }
          }

          if (!authData.user) {
            throw new Error('USER_CREATION_FAILED');
          }

          return authData;
        }, 3, 1500);
      });

      logSupabaseOperation.auth.signup('Conta de autenticação criada com sucesso', { 
        userId: authResult.user.id,
        needsConfirmation: !authResult.user.email_confirmed_at 
      });

      // Aguardar um pouco para que triggers do banco executem
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar se o perfil foi criado automaticamente pelo trigger
      try {
        await supabaseLogger.measure('PROFILE.VERIFY', async () => {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, name, role')
            .eq('id', authResult.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            supabaseLogger.warn('PROFILE.VERIFY', 'Erro ao verificar perfil, mas não é crítico', profileError);
          } else if (profile) {
            logSupabaseOperation.profile.fetch('Perfil criado automaticamente pelo trigger', { profileId: profile.id });
          } else {
            logSupabaseOperation.profile.fetch('Perfil não encontrado, mas signup foi bem-sucedido');
          }
        });
      } catch (profileError: any) {
        // Não falha o processo principal - o perfil pode ser criado posteriormente
        supabaseLogger.warn('PROFILE', 'Não foi possível verificar o perfil, mas signup foi bem-sucedido', profileError);
      }

      // Sucesso!
      logSupabaseOperation.auth.signup('Processo de cadastro concluído com sucesso');
      
      if (authResult.user.email_confirmed_at) {
        toast({
          title: "Conta criada com sucesso! 🎉",
          description: "Você já pode fazer login na sua conta.",
        });
      } else {
        toast({
          title: "Conta criada com sucesso! 🎉",
          description: "Verifique seu e-mail para confirmar sua conta.",
        });
      }
      
      return true;
      
    } catch (error: any) {
      logSupabaseOperation.auth.error('Erro no signup', error);
      
      // Tratar erros específicos
      const errorMessage = error.message || error.toString();
      
      if (errorMessage.includes('EMAIL_ALREADY_EXISTS')) {
        toast({
          variant: "destructive",
          title: "E-mail já cadastrado",
          description: "Este e-mail já está registrado. Tente fazer login ou use outro e-mail.",
        });
      } else if (errorMessage.includes('INVALID_PASSWORD')) {
        toast({
          variant: "destructive",
          title: "Senha inválida",
          description: "A senha deve ter pelo menos 6 caracteres.",
        });
      } else if (errorMessage.includes('INVALID_EMAIL')) {
        toast({
          variant: "destructive",
          title: "E-mail inválido",
          description: "Por favor, insira um endereço de e-mail válido.",
        });
      } else if (errorMessage.includes('RATE_LIMITED')) {
        toast({
          variant: "destructive",
          title: "Muitas tentativas",
          description: "Aguarde alguns minutos antes de tentar novamente.",
        });
      } else if (errorMessage.includes('SIGNUP_SERVICE_ERROR')) {
        toast({
          variant: "destructive",
          title: "Serviço temporariamente indisponível",
          description: "Tente novamente em alguns minutos. Se o problema persistir, contate o suporte.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: "Ocorreu um erro inesperado. Tente novamente em alguns minutos ou contate o suporte.",
        });
      }
      
      return false;
      
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, signUp };
} 