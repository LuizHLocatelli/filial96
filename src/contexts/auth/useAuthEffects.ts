
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthError } from '@supabase/supabase-js';

interface UseAuthEffectsProps {
  setUser: (user: User | null) => void;
  setProfile: (profile: any) => void;
  setIsLoading: (loading: boolean) => void;
  setIsInitialized: (initialized: boolean) => void;
}

export function useAuthEffects({ 
  setUser, 
  setProfile, 
  setIsLoading, 
  setIsInitialized 
}: UseAuthEffectsProps) {
  const initializationRef = useRef(false);
  const profileFetchRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Secure session initialization with timeout protection
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Add timeout to prevent hanging auth state
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth initialization timeout')), 10000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as { data: { session: Session | null }, error: AuthError | null };

        if (!isMounted) return;

        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setProfile(null);
        } else if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Auth initialization failed:', error);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsInitialized(true);
          initializationRef.current = true;
        }
      }
    };

    // Secure profile fetching with duplicate request prevention
    const fetchUserProfile = async (userId: string) => {
      if (profileFetchRef.current === userId) return;
      profileFetchRef.current = userId;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!isMounted) return;

        if (error) {
          if (error.code === 'PGRST116') {
            // Profile not found - try to create it
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
      } finally {
        profileFetchRef.current = null;
      }
    };

    // Enhanced auth state change listener with security checks
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        // Security: Log auth events for audit
        console.log(`Auth event: ${event}`, { 
          userId: session?.user?.id, 
          timestamp: new Date().toISOString() 
        });

        try {
          switch (event) {
            case 'SIGNED_IN':
            case 'TOKEN_REFRESHED':
              if (session?.user) {
                setUser(session.user);
                await fetchUserProfile(session.user.id);
              }
              break;
            case 'SIGNED_OUT':
              setUser(null);
              setProfile(null);
              profileFetchRef.current = null;
              break;
            case 'PASSWORD_RECOVERY':
              // Security: Don't expose sensitive information
              console.log('Password recovery initiated');
              break;
            default:
              break;
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          // Ensure we don't leave the app in an inconsistent state
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setProfile(null);
          }
        } finally {
          if (!initializationRef.current) {
            setIsLoading(false);
            setIsInitialized(true);
            initializationRef.current = true;
          }
        }
      }
    );

    // Initialize auth only once
    if (!initializationRef.current) {
      initializeAuth();
    }

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setProfile, setIsLoading, setIsInitialized]);

  return null;
}
