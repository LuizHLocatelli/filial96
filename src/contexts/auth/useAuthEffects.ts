
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthEffectsProps } from "./types";
import { User as AppUser } from "@/types";

export function useAuthEffects({
  setUser,
  setSession,
  setProfile,
  setIsLoading,
  toast,
}: AuthEffectsProps) {
  // Function to fetch user profile
  const fetchUserProfile = async (userId: string, showWelcomeMessage = false) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        return;
      }

      if (data) {
        // Get current user's email separately since getUser now returns a promise
        const { data: userData } = await supabase.auth.getUser();
        const email = userData?.user?.email || "";

        setProfile({
          id: data.id,
          name: data.name,
          email: email,
          role: data.role as any,
          avatarUrl: data.avatar_url,
          displayName: data.display_name || data.name.split(" ")[0]
        });
        
        // Show welcome message only when specifically requested (after login)
        if (showWelcomeMessage) {
          toast({
            title: `Bem-vindo, ${data.display_name || data.name.split(" ")[0]}!`,
            description: "Bom ter você de volta.",
            className: "welcome-toast"
          });
        }
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Use setTimeout to avoid potential loop issues with RLS
          setTimeout(() => {
            // Only show welcome message on SIGNED_IN events
            fetchUserProfile(session.user.id, true);
          }, 0);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // For token refresh, fetch profile but don't show welcome message
          setTimeout(() => {
            fetchUserProfile(session.user.id, false);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          // Redirect to login page if on a protected route
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
        }
      }
    );
    
    // Check current session
    const initAuth = async () => {
      setIsLoading(true);
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        // Don't show welcome message on initial load
        await fetchUserProfile(session.user.id, false);
      }
      
      setIsLoading(false);
    };
    
    initAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
