
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
  const type = searchParams.get("type");
  const hash = window.location.hash;
  
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Debug info to help diagnose issues
        console.log("Reset password flow iniciado:", {
          url: window.location.href,
          token: token ? "presente" : "ausente",
          type: type || "ausente",
          hash: hash ? "presente" : "ausente"
        });

        // Parse hash parameters (format #access_token=xxx&refresh_token=yyy)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const hashType = hashParams.get("type");
        
        // Determine flow type from all possible sources
        const flowType = hashType || type || (hash.includes("recovery") ? "recovery" : null);
        
        console.log("Detalhes da validação:", {
          accessToken: accessToken ? "presente" : "ausente",
          refreshToken: refreshToken ? "presente" : "ausente",
          flowType: flowType || "ausente",
        });

        // Check if we're in a recovery flow with valid tokens
        const isRecoveryFlow = flowType === "recovery" || hash.includes("type=recovery");
        const hasToken = accessToken || token;
        
        if (!hasToken && !isRecoveryFlow) {
          console.error("Token de recuperação não encontrado");
          setError("Link de recuperação inválido ou expirado. Por favor, solicite um novo link.");
          setIsValidating(false);
          return;
        }

        // Try to establish session for recovery with access_token from hash
        if (accessToken) {
          try {
            console.log("Configurando sessão com access_token");
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || "",
            });
            
            if (sessionError) {
              console.error("Erro na configuração da sessão:", sessionError);
              setError("Token de recuperação inválido ou expirado. Por favor, solicite um novo link.");
              setIsValidating(false);
              return;
            }
            
            if (data.session) {
              console.log("Sessão estabelecida com sucesso");
              setIsValidSession(true);
              toast({
                title: "Verificação bem-sucedida",
                description: "Por favor, defina sua nova senha.",
              });
            } else {
              console.error("Nenhuma sessão retornada após setSession");
              setError("Não foi possível validar sua sessão. Por favor, solicite um novo link.");
            }
          } catch (sessionError) {
            console.error("Erro ao estabelecer sessão:", sessionError);
            setError("Erro ao validar token de recuperação.");
          }
        } 
        // If we have a recovery token from URL or recovery flow is identified
        else if (token || isRecoveryFlow) {
          console.log("Token de recuperação ou fluxo identificado");
          // Verify token through user API
          try {
            // Get current session - if token is valid, this might work
            const { data: userData, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
              console.error("Erro na verificação do usuário:", userError);
              
              // Try one more approach - verify token directly
              if (token) {
                try {
                  console.log("Tentando verificar token de recuperação diretamente");
                  
                  // This approach might work for some token formats
                  const { error: verifyError } = await supabase.auth.verifyOtp({
                    token,
                    type: 'recovery',
                  });
                  
                  if (verifyError) {
                    console.error("Erro na verificação do token:", verifyError);
                    setError("Token de recuperação inválido ou expirado. Por favor, solicite um novo link.");
                    setIsValidating(false);
                    return;
                  }
                  
                  setIsValidSession(true);
                  toast({
                    title: "Token verificado",
                    description: "Por favor, defina sua nova senha abaixo.",
                  });
                  
                } catch (verifyError) {
                  console.error("Erro na verificação alternativa:", verifyError);
                  setError("Erro ao verificar token de recuperação.");
                }
              } else {
                setError("Token de recuperação inválido ou expirado. Por favor, solicite um novo link.");
              }
            } else if (userData.user) {
              console.log("Usuário verificado:", userData.user.id);
              setIsValidSession(true);
              toast({
                title: "Redefina sua senha",
                description: "Por favor, defina sua nova senha abaixo.",
              });
            } else {
              console.log("Nenhum usuário encontrado com o token");
              setError("Token de recuperação inválido ou expirado. Por favor, solicite um novo link.");
            }
          } catch (error) {
            console.error("Erro durante a validação do token:", error);
            setError("Erro ao verificar token de recuperação.");
          }
        } else {
          console.error("Formato de token não reconhecido");
          setError("Link de recuperação inválido ou em formato não reconhecido.");
        }
      } catch (error) {
        console.error("Erro fatal durante a verificação da sessão de recuperação:", error);
        setError("Ocorreu um erro ao verificar sua sessão de recuperação.");
      } finally {
        setIsValidating(false);
      }
    };
    
    verifySession();
  }, [searchParams, hash, token, type]);

  return {
    isValidating,
    isValidSession,
    error,
    token,
    hash
  };
}
