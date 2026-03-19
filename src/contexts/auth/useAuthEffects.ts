
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/user';

interface UseAuthEffectsProps {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsInitialized: (initialized: boolean) => void;
}

export function useAuthEffects({ 
  setUser, 
  setSession,
  setProfile, 
  setIsLoading, 
  setIsInitialized 
}: UseAuthEffectsProps) {
  const initializationRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchUserProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!isMounted) return;

        if (error) {
          if (error.code === 'PGRST116') {
            console.warn('Profile not found for user:', userId);
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                name: 'Usuário',
                role: 'jovem_aprendiz'
              })
              .select()
              .single();

            if (!createError && newProfile && isMounted) {
              setProfile(newProfile);
            }
          } else {
            console.error('Error fetching profile:', error);
          }
        } else if (data && isMounted) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Profile fetch failed:', error);
      }
    };

    // onAuthStateChange handles initialization and subsequent auth events.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        // Defer async logic to prevent deadlocks
        setTimeout(() => {
          (async () => {
            if (!isMounted) return;

            console.log(`Auth event: ${event}`, { userId: session?.user?.id });

            try {
              if (session?.user) {
                setUser(session.user);
                setSession(session);
                await fetchUserProfile(session.user.id);
              } else {
                setUser(null);
                setSession(null);
                setProfile(null);
              }
            } catch (error) {
              console.error('Auth state change error:', error);
              setUser(null);
              setSession(null);
              setProfile(null);
            } finally {
              if (isMounted && !initializationRef.current) {
                setIsLoading(false);
                setIsInitialized(true);
                initializationRef.current = true;
              }
            }
          })();
        }, 0);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setProfile, setIsLoading, setIsInitialized]);

  return null;
}
