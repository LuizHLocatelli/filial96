
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
      
      // 1. Verify the password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: password,
      });

      if (signInError) {
        console.error("Erro ao verificar senha:", signInError);
        throw new Error("Senha incorreta");
      }
      
      console.log("Senha verificada com sucesso");
      
      // 2. Call delete_user_account function to clean up user data
      // This SQL function will delete all user data from the database
      const { error: rpcError } = await supabase.rpc('delete_user_account');
      
      if (rpcError) {
        console.error("Erro ao executar RPC delete_user_account:", rpcError);
        throw new Error(`Erro ao excluir dados do usuário: ${rpcError.message}`);
      }
      
      console.log("Dados do usuário limpos com sucesso via RPC");
      
      // 3. Delete the actual user account from auth.users
      // We need to use admin.deleteUser which requires service role
      try {
        // Make sure the user ID is available
        if (!user?.id) {
          throw new Error("ID do usuário não disponível");
        }
        
        // Delete from auth.users directly using the Edge Function
        const { error: deleteError } = await supabase.functions.invoke('delete-user', {
          body: { user_id: user.id }
        });
        
        if (deleteError) {
          throw deleteError;
        }
        
        console.log("Usuário excluído com sucesso");
      } catch (deleteUserError: any) {
        console.error("Erro ao excluir conta de autenticação:", deleteUserError);
        throw new Error(`Falha ao excluir conta de autenticação: ${deleteUserError.message || "Erro desconhecido"}`);
      }
      
      // 4. Show success message
      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso.",
      });
      
      // 5. Sign out and clear local state
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
