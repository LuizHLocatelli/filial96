
import { createContext, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { User as AppUser } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { AuthContextType } from "./types";
import { useAuthActions } from "./useAuthActions";
import { useAuthEffects } from "./useAuthEffects";

// Create the context with undefined as initial value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  // Use custom hooks to organize functionality
  const { signOut, deleteAccount } = useAuthActions({
    user,
    setUser,
    setProfile,
    setSession,
    toast,
  });

  // Setup auth effects (session management, listeners)
  useAuthEffects({
    setUser,
    setSession,
    setProfile,
    setIsLoading,
    setIsInitialized,
  });

  return (
    <AuthContext.Provider value={{ user, profile, session, isLoading, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};
