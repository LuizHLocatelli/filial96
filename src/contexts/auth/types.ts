
import { User, Session } from "@supabase/supabase-js";
import { User as AppUser } from "@/types";

export interface AuthContextType {
  user: User | null;
  profile: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

export interface AuthActionsProps {
  user: User | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: AppUser | null) => void;
  setSession: (session: Session | null) => void;
  toast: any;
}

export interface AuthEffectsProps {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: AppUser | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  toast: any;
}
