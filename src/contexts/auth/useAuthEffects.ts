import { useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { User as AppUser, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface UseAuthEffectsProps {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: AppUser | null) => void;
  setIsLoading: (loading: boolean) => void;
  toast: any;
}

// Função para retry com backoff exponencial (mesmo padrão do useDepositos)
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Se é o último attempt, rejeita
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Verificar se é erro de rede que vale a pena tentar novamente
      const isNetworkError = 
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('QUIC_NETWORK_IDLE_TIMEOUT') ||
        error.message?.includes('ERR_QUIC_PROTOCOL_ERROR') ||
        error.message?.includes('NetworkError') ||
        error.code === 'PGRST301'; // Supabase network error
      
      if (!isNetworkError) {
        throw error; // Não tentar novamente para erros não relacionados à rede
      }
      
      // Delay exponencial: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`🔄 [Auth] Tentativa ${attempt + 1}/${maxRetries + 1} falhou. Tentando novamente em ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const useAuthEffects = ({
  setUser,
  setSession,
  setProfile,
  setIsLoading,
  toast,
}: UseAuthEffectsProps) => {
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session with retry
        const sessionResult = await retryWithBackoff(async () => {
          console.log('🔐 Inicializando autenticação...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.error("❌ Session error:", sessionError);
            throw sessionError;
          }
          
          return session;
        }, 3, 2000);

        if (sessionResult?.user) {
          console.log('✅ Sessão carregada com sucesso');
          setUser(sessionResult.user);
          setSession(sessionResult);
          await fetchUserProfile(sessionResult.user.id, sessionResult.user.email);
        }
      } catch (error: any) {
        console.error("❌ Erro final na inicialização da autenticação:", error);
        
        const errorMessage = error.message?.includes('Failed to fetch') 
          ? 'Problema de conexão na autenticação. Verifique sua internet.'
          : 'Erro ao inicializar a autenticação. Tente novamente.';
        
        toast({
          title: "⚠️ Erro de Autenticação",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUserProfile = async (userId: string, userEmail?: string) => {
      try {
        const profile = await retryWithBackoff(async () => {
          console.log('👤 Buscando perfil do usuário...');
          
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Profile doesn't exist, create one
              console.log('📝 Criando novo perfil...');
            const { data: userData } = await supabase.auth.getUser();
            if (userData.user) {
              const newProfile: AppUser = {
                id: userId,
                name: userData.user.email || 'Usuário',
                role: 'jovem_aprendiz' as UserRole, // Changed default role
                email: userData.user.email || userEmail || '',
                phone: userData.user.user_metadata?.phone || ''
              };
              
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: userId,
                  name: userData.user.email || 'Usuário',
                  role: 'jovem_aprendiz', // Changed default role
                  phone: userData.user.user_metadata?.phone || ''
                });
                
              if (insertError) {
                  console.error("❌ Erro ao criar perfil:", insertError);
                  throw insertError;
              } else {
                  console.log('✅ Perfil criado com sucesso');
                  return newProfile;
              }
            }
          } else {
              console.error("❌ Erro ao buscar perfil:", error);
              throw error;
          }
          }
          
          return profile;
        }, 3, 1500);

        if (profile) {
          console.log('✅ Perfil carregado com sucesso');
          // Combine profile data with email from auth user and ensure role is properly typed
          const fullProfile: AppUser = {
            id: profile.id,
            name: profile.name,
            role: profile.role as UserRole,
            email: userEmail || '',
            avatarUrl: (profile as any).avatar_url,
            displayName: (profile as any).display_name,
            phone: profile.phone
          };
          setProfile(fullProfile);
        }
      } catch (error: any) {
        console.error("❌ Erro final ao buscar perfil:", error);
        
        // Não mostrar toast para erros de perfil, pois não impedem o uso básico do app
        // O usuário ainda pode usar o sistema mesmo sem o perfil completo
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setSession(session);
          // Use setTimeout to prevent deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user.id, session.user.email);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setProfile(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setSession(session);
          // Refetch profile to ensure we have the latest data
          if (session.user) {
            setTimeout(() => {
              fetchUserProfile(session.user.id, session.user.email);
            }, 0);
          }
        }
        
        setIsLoading(false);
      }
    );

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setProfile, setIsLoading, toast]);
};
