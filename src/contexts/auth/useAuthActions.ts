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
        toast({
          title: "Conta excluída",
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
        
      } catch (deleteUserError: any) {
        console.error("❌ Erro ao excluir conta:", deleteUserError);
        throw new Error(`Falha ao excluir conta: ${formatErrorForUser(deleteUserError, "Erro desconhecido")}`);
      }
      
    } catch (error: any) {
      console.error("💥 Erro completo ao excluir conta:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir conta",
        description: formatErrorForUser(error, "Ocorreu um erro ao excluir sua conta."),
      });
      throw error;
    }
  };

  return { signOut, deleteAccount };
}
