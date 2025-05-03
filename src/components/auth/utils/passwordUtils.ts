
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
    console.log("Iniciando processo de atualização de senha");
    
    // Parse hash parameters if present
    const hashParams = hash ? new URLSearchParams(hash.substring(1)) : null;
    const accessToken = hashParams?.get("access_token");
    const refreshToken = hashParams?.get("refresh_token") || "";
    const type = hashParams?.get("type");
    
    console.log("Formato do token:", { 
      token: token ? "presente" : "ausente",
      hash: hash ? "presente" : "ausente", 
      accessToken: accessToken ? "presente" : "ausente",
      type: type || "ausente",
      flowType: type || token ? "recovery" : "desconhecido"
    });

    // If we have an access token in the hash, set the session first
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
          setTimeout(() => navigate("/auth?tab=reset"), 2000);
          return false;
        }
        
        console.log("Sessão configurada com sucesso");
      } catch (err) {
        console.error("Erro inesperado ao configurar sessão:", err);
      }
    }
    
    // Try to update the password
    console.log("Atualizando senha");
    const { error } = await supabase.auth.updateUser({
      password: password,
    });
    
    if (error) {
      console.error("Erro ao atualizar senha:", error);
      
      // Try alternative method for password recovery if first attempt fails
      if (token) {
        try {
          console.log("Tentando método alternativo com token específico");
          
          // For direct token verification, we need an email
          // We'll try to extract from the URL if available
          const urlParams = new URLSearchParams(window.location.search);
          const email = urlParams.get("email");
          
          if (email) {
            // Try the verifyOtp approach with email
            const { error: verifyError } = await supabase.auth.verifyOtp({
              email,
              token,
              type: 'recovery',
            });
            
            if (verifyError) {
              console.error("Erro na verificação do token:", verifyError);
              toast({
                variant: "destructive",
                title: "Erro ao redefinir senha",
                description: "Link de recuperação inválido ou expirado. Por favor, solicite um novo link.",
              });
              setTimeout(() => navigate("/auth?tab=reset"), 2000);
              return false;
            }
            
            // After verification, try updating password again
            const { error: updateError } = await supabase.auth.updateUser({
              password: password,
            });
            
            if (updateError) {
              console.error("Erro na segunda tentativa de atualização:", updateError);
              toast({
                variant: "destructive",
                title: "Erro ao redefinir senha",
                description: "Não foi possível atualizar sua senha. Por favor, solicite um novo link de recuperação.",
              });
              setTimeout(() => navigate("/auth?tab=reset"), 2000);
              return false;
            }
          } else {
            // If we don't have an email, we can try updating the password directly again
            // This might work if the session is already established
            const { error: finalAttemptError } = await supabase.auth.updateUser({
              password: password,
            });
            
            if (finalAttemptError) {
              console.error("Falha na última tentativa de atualização:", finalAttemptError);
              toast({
                variant: "destructive",
                title: "Erro ao redefinir senha",
                description: "Não foi possível atualizar sua senha. Por favor, solicite um novo link.",
              });
              setTimeout(() => navigate("/auth?tab=reset"), 2000);
              return false;
            }
          }
        } catch (alterErr) {
          console.error("Erro no método alternativo:", alterErr);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar senha",
          description: "Link de recuperação inválido ou expirado. Por favor, solicite um novo link.",
        });
        setTimeout(() => navigate("/auth?tab=reset"), 2000);
        return false;
      }
    }

    // Success path
    console.log("Senha atualizada com sucesso");
    toast({
      title: "Senha alterada com sucesso",
      description: "Sua senha foi redefinida. Você será redirecionado para o login.",
    });
    
    // Log out to ensure clean state
    await supabase.auth.signOut();
    
    // Redirect to login after successful update
    setTimeout(() => navigate("/auth"), 2000);
    return true;
    
  } catch (error: any) {
    console.error("Erro inesperado ao redefinir senha:", error);
    toast({
      variant: "destructive",
      title: "Erro ao redefinir senha",
      description: "Ocorreu um erro inesperado ao redefinir sua senha. Por favor, tente novamente.",
    });
    return false;
  }
}
