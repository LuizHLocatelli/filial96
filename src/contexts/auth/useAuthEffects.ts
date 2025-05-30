
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
              const newProfile: AppUser = {
                id: userId,
                name: userData.user.email || 'Usuário',
                role: 'consultor_moveis' as UserRole,
                email: userData.user.email || userEmail || '',
                phone: userData.user.user_metadata?.phone || ''
              };
              
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: userId,
                  name: userData.user.email || 'Usuário',
                  role: 'consultor_moveis',
                  phone: userData.user.user_metadata?.phone || ''
                });
                
              if (insertError) {
                console.error("Error creating profile:", insertError);
              } else {
                setProfile(newProfile);
              }
            }
          } else {
            console.error("Error fetching profile:", error);
          }
        } else if (profile) {
          // Combine profile data with email from auth user and ensure role is properly typed
          const fullProfile: AppUser = {
            id: profile.id,
            name: profile.name,
            role: profile.role as UserRole,
            email: userEmail || '',
            avatarUrl: profile.avatar_url,
            displayName: profile.display_name,
            phone: profile.phone
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
