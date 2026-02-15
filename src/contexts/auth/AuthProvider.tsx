import React, { useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { UserProfile } from "@/types/user";
import { useToast } from "@/components/ui/use-toast";
import { useAuthActions } from "./useAuthActions";
import { useAuthEffects } from "./useAuthEffects";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  const { signOut, deleteAccount } = useAuthActions({
    user,
    setUser,
    setProfile,
    setSession,
    toast,
  });

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
