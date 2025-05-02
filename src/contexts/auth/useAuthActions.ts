
import { supabase } from "@/integrations/supabase/client";
import { AuthActionsProps } from "./types";

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
      console.log("Iniciando processo de exclusão de conta");
      
      // 1. Verify the password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: password,
      });

      if (signInError) {
        console.error("Erro ao verificar senha:", signInError);
        throw new Error("Senha incorreta");
      }
      
      console.log("Senha verificada com sucesso");
      
      // 2. Call RPC to clean up user data
      const { error: rpcError } = await supabase.rpc('delete_user_account');
      
      if (rpcError) {
        console.error("Erro ao executar RPC delete_user_account:", rpcError);
        throw new Error(`Erro ao excluir dados do usuário: ${rpcError.message}`);
      }
      
      console.log("Dados do usuário limpos com sucesso via RPC");
      
      // Attempt to delete the user's auth account
      try {
        // First try with admin API
        const { error: adminDeleteError } = await supabase.auth.admin.deleteUser(
          user?.id || ""
        );
        
        if (adminDeleteError) {
          console.log("Não foi possível excluir via API admin, tentando método alternativo");
          throw adminDeleteError;
        }
        
        console.log("Usuário excluído com sucesso via API admin");
      } catch (adminError) {
        // Fall back to marking user for deletion
        const { error: updateError } = await supabase.auth.updateUser({
          data: { delete_user: true }
        });
        
        if (updateError) {
          console.error("Erro ao marcar usuário para exclusão:", updateError);
          throw new Error(`Erro ao excluir conta de autenticação: ${updateError.message}`);
        }
        
        console.log("Usuário marcado para exclusão via updateUser");
      }
      
      // Show success message
      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso.",
      });
      
      // Sign out after account deletion
      await supabase.auth.signOut();
      
      // Clear context data
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Redirect to login page
      window.location.href = '/auth';
      
    } catch (error: any) {
      console.error("Erro completo ao excluir conta:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir conta",
        description: error.message || "Ocorreu um erro ao excluir sua conta.",
      });
      throw error;
    }
  };

  return { signOut, deleteAccount };
}
