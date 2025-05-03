
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
import { Button } from "@/components/ui/button";

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
        // Capturar todos os possíveis tokens de autenticação
        // 1. Token de hash na URL (formato #access_token=xxx&refresh_token=yyy)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");
        
        // 2. Token em parâmetros de URL (formato ?token=xxx)
        const recoveryToken = searchParams.get("token");
        
        // 3. Tipo de fluxo (recovery, verification, etc)
        const flowType = type || searchParams.get("type");
        
        console.log("Verificando fluxo de recuperação:", {
          url: window.location.href,
          hash: window.location.hash ? "presente" : "ausente",
          accessToken: accessToken ? "presente" : "ausente",
          refreshToken: refreshToken ? "presente" : "ausente",
          recoveryToken: recoveryToken ? "presente" : "ausente",
          type: flowType || "ausente",
        });

        // Verificar se é um fluxo válido
        const isRecoveryFlow = flowType === "recovery" || window.location.hash.includes("type=recovery");
        const hasToken = accessToken || recoveryToken;
        
        if (!hasToken && !isRecoveryFlow) {
          console.error("Nenhum token de recuperação válido encontrado");
          setError("Link de recuperação inválido ou expirado. Por favor, solicite um novo link.");
          return;
        }

        // Tentar estabelecer sessão para recovery flow com access_token
        if (accessToken) {
          try {
            console.log("Tentando configurar sessão com access_token do hash");
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || "",
            });
            
            if (sessionError) {
              console.error("Erro ao configurar sessão:", sessionError);
              setError("Token de recuperação inválido ou expirado. Por favor, solicite um novo link.");
              return;
            }
            
            if (data.session) {
              console.log("Sessão configurada com sucesso");
              setIsValidSession(true);
              toast({
                title: "Verificação bem-sucedida",
                description: "Por favor, defina sua nova senha.",
              });
            } else {
              console.error("Sessão não retornada após setSession");
              setError("Não foi possível validar sua sessão. Por favor, solicite um novo link.");
            }
          } catch (sessionError) {
            console.error("Erro ao configurar sessão:", sessionError);
            setError("Erro ao validar token de recuperação.");
          }
        } 
        // Se temos um token de recuperação tradicional ou fluxo de recovery
        else if (recoveryToken || isRecoveryFlow) {
          console.log("Token de recuperação presente ou fluxo de recovery identificado");
          setIsValidSession(true);
          toast({
            title: "Redefina sua senha",
            description: "Por favor, defina sua nova senha abaixo.",
          });
        } else {
          console.error("Formato de token não reconhecido");
          setError("Link de recuperação inválido ou em formato não reconhecido.");
        }
      } catch (error) {
        console.error("Erro ao verificar sessão de recuperação:", error);
        setError("Ocorreu um erro ao verificar sua sessão de recuperação.");
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
              <CardDescription className="text-muted-foreground mt-4">
                Por favor, solicite um novo link de recuperação de senha:
              </CardDescription>
            </CardHeader>
            <div className="p-6">
              <Button 
                className="w-full" 
                onClick={() => navigate("/auth?tab=reset")}
              >
                Solicitar novo link
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Se não for uma sessão válida, isso nunca deve renderizar devido à verificação no useEffect
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
