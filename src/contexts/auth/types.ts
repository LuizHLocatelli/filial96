
import { User, Session } from "@supabase/supabase-js";
import { UserProfile } from "@/types/user";

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

export interface AuthActionsProps {
  user: User | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setSession: (session: Session | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toast: any;
}

export interface AuthEffectsProps {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsInitialized: (initialized: boolean) => void;
}
