
import { useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { User as AppUser } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface UseAuthEffectsProps {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: AppUser | null) => void;
  setIsLoading: (loading: boolean) => void;
  toast: any;
}

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
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          setSession(session);
          await fetchUserProfile(session.user.id, session.user.email);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        toast({
          title: "Erro de Autenticação",
          description: "Erro ao inicializar a autenticação. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUserProfile = async (userId: string, userEmail?: string) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Profile doesn't exist, create one
            const { data: userData } = await supabase.auth.getUser();
            if (userData.user) {
              const newProfile = {
                id: userId,
                name: userData.user.email || 'Usuário',
                role: 'vendedor',
                email: userData.user.email || userEmail || ''
              };
              
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: userId,
                  name: userData.user.email || 'Usuário',
                  role: 'vendedor'
                });
                
              if (insertError) {
                console.error("Error creating profile:", insertError);
              } else {
                setProfile(newProfile as AppUser);
              }
            }
          } else {
            console.error("Error fetching profile:", error);
          }
        } else if (profile) {
          // Combine profile data with email from auth user
          const fullProfile: AppUser = {
            ...profile,
            email: userEmail || profile.email || ''
          };
          setProfile(fullProfile);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setSession(session);
          await fetchUserProfile(session.user.id, session.user.email);
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta.",
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setProfile(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setSession(session);
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
