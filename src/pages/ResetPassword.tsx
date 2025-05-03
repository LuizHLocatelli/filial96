
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
import { toast } from "@/components/ui/use-toast";

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
        // Verificar todos os possíveis formatos de token que o Supabase pode enviar
        // URL está no formato: https://seu-site.com/reset-password#access_token=eyJ...&refresh_token=eyJ...&expires_in=3600&token_type=bearer&type=recovery
        
        // O token pode estar no hash (fragment) da URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        // Ou nos parâmetros da URL
        const accessToken = hashParams.get("access_token") || searchParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token") || searchParams.get("refresh_token");
        const type = hashParams.get("type") || searchParams.get("type");
        
        // Verificar também o token do formato padrão do Supabase
        const recoveryToken = searchParams.get("token");
        
        // Logar o que foi encontrado para diagnósticos
        console.log("Verificando tokens de recuperação:", {
          hashParams: window.location.hash ? "presente" : "ausente",
          accessToken: accessToken ? "presente" : "ausente",
          refreshToken: refreshToken ? "presente" : "ausente",
          type: type || "ausente",
          recoveryToken: recoveryToken ? "presente" : "ausente",
        });
        
        // Se não houver tokens válidos, redirecionar para login
        if (!accessToken && !refreshToken && !recoveryToken) {
          console.error("Nenhum token de recuperação válido encontrado");
          setError("Link de recuperação inválido ou expirado. Por favor, solicite um novo link.");
          setTimeout(() => navigate("/auth"), 3000);
          return;
        }
        
        // Se temos um token de hash na URL, tentar usá-lo para definir a sessão
        if (accessToken) {
          try {
            console.log("Tentando configurar sessão com access_token");
            // Definir a sessão com o token
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || "",
            });
            
            if (sessionError) {
              console.error("Erro ao configurar sessão:", sessionError);
              setError("Token de recuperação inválido ou expirado. Por favor, solicite um novo link.");
              setTimeout(() => navigate("/auth"), 3000);
              return;
            }
            
            setIsValidSession(true);
            toast({
              title: "Sessão validada",
              description: "Por favor, defina sua nova senha abaixo.",
            });
          } catch (sessionError) {
            console.error("Erro ao configurar sessão:", sessionError);
            setError("Erro ao configurar a sessão de recuperação.");
            setTimeout(() => navigate("/auth"), 3000);
          }
        } 
        // Se temos um token de recuperação na URL, assumir que é uma sessão válida
        // A verificação acontecerá quando o usuário enviar o formulário
        else if (recoveryToken || type === "recovery") {
          console.log("Token de recuperação presente, permitindo definição de nova senha");
          setIsValidSession(true);
          toast({
            title: "Redefina sua senha",
            description: "Por favor, defina sua nova senha abaixo.",
          });
        } else {
          console.error("Formato de token não reconhecido");
          setError("Link de recuperação inválido ou em formato não reconhecido.");
          setTimeout(() => navigate("/auth"), 3000);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão de recuperação:", error);
        setError("Ocorreu um erro ao verificar sua sessão de recuperação.");
        setTimeout(() => navigate("/auth"), 3000);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifySession();
  }, [searchParams, navigate]);

  // Se estiver carregando, mostrar um spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se houver um erro, mostrá-lo
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

  // Se não for uma sessão válida, isso nunca deve renderizar devido ao redirecionamento no useEffect
  if (!isValidSession) {
    return null;
  }

  // Passar os parâmetros da URL para o formulário de atualização de senha
  const formProps = {
    token: searchParams.get("token"),
    hash: window.location.hash,
  };

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
          <UpdatePasswordForm {...formProps} />
        </Card>
      </div>
    </div>
  );
}
