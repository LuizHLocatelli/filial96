import { supabase } from "@/integrations/supabase/client";
import { AuthActionsProps } from "./types";
import { formatErrorForUser } from "@/utils/errorTranslations";

export function useAuthActions({
  user,
  setUser,
  setProfile,
  setSession,
  toast,
}: AuthActionsProps) {
  // Function for logout
  const signOut = async () => {
    console.log("🚪 Iniciando processo de logout...");
    
    try {
      // Primeiro, tenta o logout normal do Supabase
      console.log("📡 Tentando logout via Supabase...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("❌ Erro no logout do Supabase:", error);
      } else {
        console.log("✅ Logout do Supabase bem-sucedido");
      }
    } catch (error) {
      console.error("💥 Erro completo ao excluir conta:", error);
      toast.error("Erro ao excluir conta", {
        description: formatErrorForUser(error, "Ocorreu um erro ao excluir sua conta."),
      });
      throw error;
    }
    
    // Independentemente de sucesso ou erro, força limpeza completa
    console.log("🧹 Executando limpeza completa da sessão...");
    
    try {
      // Limpa todos os tokens do localStorage relacionados ao Supabase
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('sb-') || key.includes('supabase') || key.includes('auth')) {
          localStorage.removeItem(key);
        }
      });
      
      // Limpa sessionStorage também
      sessionStorage.clear();
      
      // Limpa estados locais
      setUser(null);
      setProfile(null);
      setSession(null);
      
      console.log("✅ Limpeza completa realizada com sucesso");
      
      toast.success("Logout realizado", {
        description: "Você saiu da sua conta com sucesso.",
      });
      
    } catch (cleanupError) {
      console.error("❌ Erro na limpeza:", cleanupError);
      
      // Último recurso: recarregar a página
      console.log("🔄 Forçando recarregamento da página...");
      toast.success("Logout realizado", {
        description: "Você saiu da sua conta com sucesso.",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };
  
  // Function for account deletion
  const deleteAccount = async (password: string) => {
    try {
      console.log("🗑️ Iniciando processo de exclusão de conta");
      
      // Make sure the user ID is available
      if (!user?.id) {
        throw new Error("ID do usuário não disponível");
      }
      
      console.log(`🔍 Processando exclusão para usuário: ${user.id}`);
      
      // Delete account using the NEW service-based Edge Function
      try {
        console.log("📡 Chamando Edge Function delete-account-service...");
        
        const { data: result, error: deleteError } = await supabase.functions.invoke('delete-account-service', {
          body: { 
            user_id: user.id,
            password: password
          }
        });
        
        if (deleteError) {
          console.error("❌ Erro da Edge Function:", deleteError);
          throw new Error(`Falha na Edge Function: ${formatErrorForUser(deleteError, "Erro desconhecido")}`);
        }
        
        console.log("✅ Edge Function executada com sucesso:", result);
        
        // Show success message
        toast.success("Conta excluída", {
          description: "Sua conta foi excluída com sucesso.",
        });
        
        // Clear local state immediately (auth.users was already deleted by Edge Function)
        console.log("🧹 Limpando estado local...");
        setUser(null);
        setProfile(null);
        setSession(null);
        
        // Redirect to login page
        console.log("🔄 Redirecionando para login...");
        window.location.href = '/auth';
        
      } catch (deleteUserError) {
        console.error("❌ Erro ao excluir conta:", deleteUserError);
        throw new Error(`Falha ao excluir conta: ${formatErrorForUser(deleteUserError, "Erro desconhecido")}`);
      }

    } catch (error) {
      console.error("💥 Erro completo ao excluir conta:", error);
      toast.error("Erro ao excluir conta", {
        description: formatErrorForUser(error, "Ocorreu um erro ao excluir sua conta."),
      });
      throw error;
    }
  };

  return { signOut, deleteAccount };
}
