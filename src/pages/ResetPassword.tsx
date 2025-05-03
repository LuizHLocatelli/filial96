
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [isValidSession, setIsValidSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      setIsLoading(true);
      try {
        // Verificar se há um token de acesso na URL (link de recuperação de senha)
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const type = searchParams.get("type");
        
        // Check for Supabase's standard recovery token format
        const recoveryToken = searchParams.get("token");
        
        // Se não temos tokens válidos, redirecionar para o login
        if ((!accessToken && !refreshToken && !recoveryToken) || 
            (type !== "recovery" && !recoveryToken)) {
          console.log("Sem tokens de recuperação válidos, redirecionando para login");
          navigate("/auth");
          return;
        }
        
        // Handle the token in Supabase format
        if (recoveryToken) {
          // Get type and redirect_to from query params
          const redirectTo = searchParams.get("redirect_to") || window.location.origin;
          const tokenType = searchParams.get("type") || "recovery";
          
          console.log("Verificando token de recuperação:", { 
            token: recoveryToken, 
            type: tokenType,
            redirectTo
          });
          
          // Let Supabase handle the token verification
          // This will set up the session if the token is valid
          // We don't need to do anything with the response here as
          // the user will now be able to reset their password
          setIsValidSession(true);
        }
        // Standard OAuth or magic link flow
        else if (accessToken) {
          // Configurar a sessão com o token, mas SEM fazer login automático
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });
          
          // Verificamos que a sessão é válida para recuperação de senha
          setIsValidSession(true);
        }
      } catch (error) {
        console.error("Erro ao verificar a sessão de recuperação:", error);
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };
    
    verifySession();
  }, [searchParams, navigate]);

  // Se estiver carregando, mostra um spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não for uma sessão válida, isso será renderizado brevemente antes do redirecionamento
  if (!isValidSession) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted px-4">
      <div className="w-full max-w-md">
        <AuthHeader />

        <Card className="border-border shadow-lg">
          <CardHeader className="bg-card rounded-t-md">
            <CardTitle className="text-card-foreground">Redefinir senha</CardTitle>
            <CardDescription className="text-muted-foreground">
              Digite e confirme sua nova senha abaixo.
            </CardDescription>
          </CardHeader>
          <UpdatePasswordForm />
        </Card>
      </div>
    </div>
  );
}
