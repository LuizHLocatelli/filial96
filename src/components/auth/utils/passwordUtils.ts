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
    // Security: Enhanced password validation
    if (!password || password.length < 8) {
      toast({
        variant: "destructive",
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 8 caracteres.",
      });
      return false;
    }

    // Security: Validate password strength
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      toast({
        variant: "destructive",
        title: "Senha fraca",
        description: "A senha deve conter ao menos uma letra maiúscula, minúscula, número e caractere especial.",
      });
      return false;
    }

    console.log("Iniciando processo de atualização de senha");
    
    // Security: Sanitize and validate token inputs
    const sanitizedToken = token?.trim();
    const sanitizedHash = hash?.trim();
    
    // Parse hash parameters if present
    const hashParams = sanitizedHash ? new URLSearchParams(sanitizedHash.substring(1)) : null;
    const accessToken = hashParams?.get("access_token")?.trim();
    const refreshToken = hashParams?.get("refresh_token")?.trim() || "";
    const type = hashParams?.get("type")?.trim();
    
    console.log("Formato do token:", { 
      token: sanitizedToken ? "presente" : "ausente",
      hash: sanitizedHash ? "presente" : "ausente", 
      accessToken: accessToken ? "presente" : "ausente",
      type: type || "ausente",
      flowType: type || sanitizedToken ? "recovery" : "desconhecido"
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
            duration: 6000,
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
          
          // Security: Validate email parameter for token verification
          const urlParams = new URLSearchParams(window.location.search);
          const email = urlParams.get("email")?.trim().toLowerCase();
          
          if (!email || !email.includes('@')) {
            console.error("Email inválido ou não encontrado nos parâmetros da URL");
            toast({
              variant: "destructive",
              title: "Erro ao redefinir senha",
              description: "E-mail inválido ou não encontrado. Por favor, solicite um novo link de recuperação.",
              duration: 6000,
            });
            setTimeout(() => navigate("/auth?tab=reset"), 2000);
            return false;
          }
          
          console.log("Verificando OTP com email:", email);
          
          // Security: Verify OTP with email and sanitized token
          const { error: verifyError } = await supabase.auth.verifyOtp({
            email: email,
            token: sanitizedToken,
            type: 'recovery',
          });
          
          if (verifyError) {
            console.error("Erro na verificação do token:", verifyError);
            toast({
              variant: "destructive",
              title: "Erro ao redefinir senha",
              description: "Link de recuperação inválido ou expirado. Por favor, solicite um novo link.",
              duration: 6000,
            });
            setTimeout(() => navigate("/auth?tab=reset"), 2000);
            return false;
          }
          
          console.log("Token verificado com sucesso, tentando atualizar senha novamente");
          
          // Após verificação, tente atualizar a senha novamente
          const { error: updateError } = await supabase.auth.updateUser({
            password: password,
          });
          
          if (updateError) {
            console.error("Erro na segunda tentativa de atualização:", updateError);
            toast({
              variant: "destructive",
              title: "Erro ao redefinir senha",
              description: "Não foi possível atualizar sua senha. Por favor, solicite um novo link de recuperação.",
              duration: 6000,
            });
            setTimeout(() => navigate("/auth?tab=reset"), 2000);
            return false;
          }
        } catch (alterErr) {
          console.error("Erro no método alternativo:", alterErr);
          toast({
            variant: "destructive",
            title: "Erro ao redefinir senha",
            description: "Erro ao processar sua solicitação. Por favor, tente novamente.",
            duration: 5000,
          });
          setTimeout(() => navigate("/auth?tab=reset"), 2000);
          return false;
        }
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar senha",
          description: "Link de recuperação inválido ou expirado. Por favor, solicite um novo link.",
          duration: 6000,
        });
        setTimeout(() => navigate("/auth?tab=reset"), 2000);
        return false;
      }
    }

    // Success path - Security: Enhanced audit logging
    const user = (await supabase.auth.getUser()).data.user;
    console.log("Senha atualizada com sucesso", {
      timestamp: new Date().toISOString(),
      userId: user?.id,
      userEmail: user?.email,
      method: sanitizedToken ? 'password_reset' : 'direct_update',
      userAgent: navigator.userAgent
    });
    
    toast({
      title: "Senha alterada com sucesso",
      description: "Sua senha foi redefinida. Você será redirecionado para o login.",
      duration: 4000,
    });
    
    // Security: Clear all auth state and force clean logout
    localStorage.clear();
    sessionStorage.clear();
    await supabase.auth.signOut({ scope: 'global' });
    
    // Redirect to login after successful update
    setTimeout(() => navigate("/auth"), 2000);
    return true;
    
  } catch (error) {
    console.error("Erro inesperado ao redefinir senha:", error);
    toast({
      variant: "destructive",
      title: "Erro ao redefinir senha",
      description: "Ocorreu um erro inesperado ao redefinir sua senha. Por favor, tente novamente.",
      duration: 5000,
    });
    return false;
  }
}
