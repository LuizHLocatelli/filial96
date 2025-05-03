
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
        // Enhanced logging for troubleshooting
        console.log("Reset password flow initiated:", {
          url: window.location.href,
          token: token ? "present" : "absent",
          type: type || "absent",
          hash: hash ? "present" : "absent"
        });

        // Parse hash parameters (format #access_token=xxx&refresh_token=yyy)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const hashType = hashParams.get("type");
        
        // Determine flow type from all possible sources
        const flowType = hashType || type || (hash.includes("recovery") ? "recovery" : null);
        
        console.log("Token validation details:", {
          accessToken: accessToken ? "present" : "absent",
          refreshToken: refreshToken ? "present" : "absent",
          flowType: flowType || "absent",
        });

        // Check if we're in a recovery flow with valid tokens
        const isRecoveryFlow = flowType === "recovery" || hash.includes("type=recovery");
        const hasToken = accessToken || token;
        
        if (!hasToken && !isRecoveryFlow) {
          console.error("No recovery token found");
          setError("Link de recuperação inválido ou expirado. Por favor, solicite um novo link.");
          setIsValidating(false);
          return;
        }

        // Try to establish session for recovery with access_token from hash
        if (accessToken) {
          try {
            console.log("Setting up session with access_token");
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || "",
            });
            
            if (sessionError) {
              console.error("Session setup error:", sessionError);
              setError("Token de recuperação inválido ou expirado. Por favor, solicite um novo link.");
              setIsValidating(false);
              return;
            }
            
            if (data.session) {
              console.log("Session successfully established");
              setIsValidSession(true);
              toast({
                title: "Verificação bem-sucedida",
                description: "Por favor, defina sua nova senha.",
              });
            } else {
              console.error("No session returned after setSession");
              setError("Não foi possível validar sua sessão. Por favor, solicite um novo link.");
            }
          } catch (sessionError) {
            console.error("Error establishing session:", sessionError);
            setError("Erro ao validar token de recuperação.");
          }
        } 
        // If we have a recovery token from URL or recovery flow is identified
        else if (token || isRecoveryFlow) {
          console.log("Recovery token or flow identified");
          // Verify token through user API
          try {
            // Try to get user session - will work if token is valid
            const { data, error: sessionError } = await supabase.auth.getUser();
            
            if (sessionError) {
              console.error("User verification error:", sessionError);
              setError("Token de recuperação inválido ou expirado. Por favor, solicite um novo link.");
              setIsValidating(false);
              return;
            }
            
            if (data.user) {
              console.log("User session verified:", data.user.id);
              setIsValidSession(true);
              toast({
                title: "Redefina sua senha",
                description: "Por favor, defina sua nova senha abaixo.",
              });
            } else {
              console.log("No user found with token");
              setError("Token de recuperação inválido ou expirado. Por favor, solicite um novo link.");
            }
          } catch (error) {
            console.error("Error during token validation:", error);
            setError("Erro ao verificar token de recuperação.");
          }
        } else {
          console.error("Unrecognized token format");
          setError("Link de recuperação inválido ou em formato não reconhecido.");
        }
      } catch (error) {
        console.error("Fatal error during recovery session verification:", error);
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
