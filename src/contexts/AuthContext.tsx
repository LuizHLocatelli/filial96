
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { User as AppUser } from "@/types";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  profile: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Função para buscar o perfil do usuário
  const fetchUserProfile = async (userId: string) => {
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
        setProfile({
          id: data.id,
          name: data.name,
          email: user?.email || "",
          role: data.role as any,
          avatarUrl: data.avatar_url,
          displayName: data.display_name || data.name.split(" ")[0]
        });
        
        // Mostrar mensagem de boas-vindas
        toast({
          title: `Bem-vindo, ${data.display_name || data.name.split(" ")[0]}!`,
          description: "Bom ter você de volta.",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    }
  };

  useEffect(() => {
    // Configurar listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Definir um timeout para evitar potenciais problemas de loop com RLS
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          // Redirecionar para página de login se estiver em uma rota protegida
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
        }
      }
    );
    
    // Verificar sessão atual
    const initAuth = async () => {
      setIsLoading(true);
      
      // Buscar sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      
      setIsLoading(false);
    };
    
    initAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Função para logout
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Ocorreu um erro ao tentar fazer logout.",
      });
      console.error("Erro ao fazer logout:", error);
    }
  };
  
  // Função para excluir conta
  const deleteAccount = async (password: string) => {
    try {
      // 1. Verificar a senha do usuário antes de continuar
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: password,
      });

      if (signInError) {
        throw new Error("Senha incorreta");
      }
      
      // 2. Chamar a função RPC para limpar dados do usuário no banco
      const { error: rpcError } = await supabase.rpc('delete_user_account');
      
      if (rpcError) {
        throw new Error(`Erro ao excluir dados do usuário: ${rpcError.message}`);
      }
      
      // 3. Mostrar mensagem de sucesso
      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso.",
      });
      
      // 4. Fazer logout após excluir a conta
      await supabase.auth.signOut();
      
      // 5. Limpar dados do contexto
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // 6. Redirecionar para a página de login
      window.location.href = '/auth';
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir conta",
        description: error.message || "Ocorreu um erro ao excluir sua conta.",
      });
      console.error("Erro ao excluir conta:", error);
      throw error; // Propagar o erro para que o componente DeleteAccountForm possa lidar com ele
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, isLoading, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
