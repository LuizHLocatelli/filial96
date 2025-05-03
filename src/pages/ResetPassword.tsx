
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
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      setIsLoading(true);
      try {
        // Check all possible token formats that Supabase might send
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const type = searchParams.get("type");
        // This is the standard Supabase recovery token
        const recoveryToken = searchParams.get("token");
        
        console.log("URL Parameters:", {
          token: recoveryToken ? "exists" : "missing",
          type: type || "missing",
          access_token: accessToken ? "exists" : "missing",
        });
        
        // If there are no valid tokens, redirect to login
        if ((!accessToken && !refreshToken && !recoveryToken) || 
            ((type !== "recovery" && !recoveryToken))) {
          console.log("No valid recovery tokens found, redirecting to login");
          setError("Link de recuperação inválido ou expirado.");
          setTimeout(() => navigate("/auth"), 3000);
          return;
        }
        
        // Handle standard Supabase recovery token format
        if (recoveryToken) {
          const tokenType = searchParams.get("type") || "recovery";
          
          console.log("Verifying recovery token:", { 
            tokenExists: !!recoveryToken, 
            type: tokenType
          });
          
          // When a token exists in the URL, we can assume it's a valid session for password reset
          // The verification happens when the user submits the form
          setIsValidSession(true);
        }
        // Handle older format with access_token
        else if (accessToken) {
          try {
            // Set the session with the token
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || "",
            });
            
            if (sessionError) {
              console.error("Error setting session:", sessionError);
              setError("Erro ao verificar o token de recuperação. Tente novamente.");
              setTimeout(() => navigate("/auth"), 3000);
              return;
            }
            
            setIsValidSession(true);
          } catch (sessionError) {
            console.error("Error setting session:", sessionError);
            setError("Erro ao configurar a sessão de recuperação.");
            setTimeout(() => navigate("/auth"), 3000);
          }
        }
      } catch (error) {
        console.error("Error verifying recovery session:", error);
        setError("Ocorreu um erro ao verificar sua sessão de recuperação.");
        setTimeout(() => navigate("/auth"), 3000);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifySession();
  }, [searchParams, navigate]);

  // If loading, show a spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If there's an error, show it
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted px-4">
        <div className="w-full max-w-md text-center">
          <AuthHeader />
          
          <Card className="border-border shadow-lg mt-4">
            <CardHeader className="bg-card rounded-t-md">
              <CardTitle className="text-card-foreground">Erro de Recuperação</CardTitle>
              <CardDescription className="text-destructive">
                {error}
              </CardDescription>
              <CardDescription className="text-muted-foreground mt-2">
                Você será redirecionado para a página de login.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // If not a valid session, this should never render due to redirect in useEffect
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
