
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { NavigateFunction } from "react-router-dom";

export interface UpdatePasswordParams {
  password: string;
  token?: string | null;
  hash?: string;
  navigate: NavigateFunction;
}

export async function handleUpdatePassword({
  password,
  token,
  hash,
  navigate,
}: UpdatePasswordParams): Promise<boolean> {
  try {
    console.log("Iniciando atualização de senha");
    
    // Verificar diversos formatos possíveis de token
    const hashParams = hash ? new URLSearchParams(hash.substring(1)) : null;
    const accessToken = hashParams?.get("access_token");
    const type = hashParams?.get("type");
    const refreshToken = hashParams?.get("refresh_token") || "";
    
    console.log("Formato do token:", { 
      hash: hash ? "presente" : "ausente", 
      accessToken: accessToken ? "presente" : "ausente",
      token: token ? "presente" : "ausente",
      type: type || "ausente",
    });

    // Se temos access_token no hash, tentar configurar sessão
    if (accessToken) {
      console.log("Configurando sessão com access_token do hash");
      try {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (sessionError) {
          console.error("Erro ao configurar sessão:", sessionError);
          toast({
            variant: "destructive",
            title: "Erro ao validar token de recuperação",
            description: "O link de recuperação pode estar expirado ou inválido. Por favor, solicite um novo.",
          });
          setTimeout(() => navigate("/auth"), 3000);
          return false;
        }
        
        console.log("Sessão configurada com sucesso");
      } catch (err) {
        console.error("Erro ao configurar sessão:", err);
      }
    }
    
    // Se temos um token padrão, tentar usá-lo para atualizar a senha
    if (token) {
      console.log("Usando token padrão para atualizar senha");
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) {
        console.error("Erro ao atualizar senha com token padrão:", error);
        toast({
          variant: "destructive",
          title: "Erro ao atualizar senha",
          description: "Link de recuperação inválido ou expirado. Por favor, solicite um novo link.",
        });
        setTimeout(() => navigate("/auth"), 3000);
        return false;
      }
    } else {
      // Caso não tenhamos token específico, tentar atualizar a senha diretamente
      // Isso usa a sessão configurada anteriormente com setSession ou o token da URL
      console.log("Tentando atualizar senha com sessão atual");
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) {
        console.error("Erro ao atualizar senha:", error);
        toast({
          variant: "destructive",
          title: "Erro ao atualizar senha",
          description: "Link de recuperação inválido ou expirado. Por favor, solicite um novo link.",
        });
        setTimeout(() => navigate("/auth"), 3000);
        return false;
      }
    }

    // Senha atualizada com sucesso
    console.log("Senha atualizada com sucesso");
    toast({
      title: "Senha alterada com sucesso",
      description: "Sua senha foi redefinida. Você será redirecionado para o login.",
    });
    
    // Deslogar para forçar login com a nova senha
    await supabase.auth.signOut();
    
    // Redirecionar para login após atualização bem-sucedida
    setTimeout(() => navigate("/auth"), 3000);
    return true;
    
  } catch (error: any) {
    console.error("Erro ao redefinir senha:", error);
    toast({
      variant: "destructive",
      title: "Erro ao redefinir senha",
      description: "Ocorreu um erro inesperado ao redefinir sua senha. Por favor, tente novamente.",
    });
    return false;
  }
}
