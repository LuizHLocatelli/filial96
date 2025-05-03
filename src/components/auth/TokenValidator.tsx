
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface TokenValidatorResult {
  isValidating: boolean;
  isValidSession: boolean;
  error: string | null;
  token: string | null;
  hash: string;
}

export function useTokenValidator(): TokenValidatorResult {
  const [searchParams] = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get token from URL parameters
  const token = searchParams.get("token");
  const hash = window.location.hash;
  
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Parse hash parameters (format #access_token=xxx&refresh_token=yyy)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");
        
        // Check URL parameters (format ?token=xxx)
        const recoveryToken = searchParams.get("token");
        
        // Check flow type
        const flowType = type || searchParams.get("type");
        
        console.log("Verificando fluxo de recuperação:", {
          url: window.location.href,
          hash: window.location.hash ? "presente" : "ausente",
          accessToken: accessToken ? "presente" : "ausente",
          refreshToken: refreshToken ? "presente" : "ausente",
          recoveryToken: recoveryToken ? "presente" : "ausente",
          type: flowType || "ausente",
        });

        // Validate session
        const isRecoveryFlow = flowType === "recovery" || window.location.hash.includes("type=recovery");
        const hasToken = accessToken || recoveryToken;
        
        if (!hasToken && !isRecoveryFlow) {
          console.error("Nenhum token de recuperação válido encontrado");
          setError("Link de recuperação inválido ou expirado. Por favor, solicite um novo link.");
          setIsValidating(false);
          return;
        }

        // Try to establish session for recovery with access_token
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
              setIsValidating(false);
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
        // If we have a recovery token or recovery flow
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
        setIsValidating(false);
      }
    };
    
    verifySession();
  }, [searchParams, hash]);

  return {
    isValidating,
    isValidSession,
    error,
    token,
    hash
  };
}
