import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Factor, AuthenticatorAssuranceLevels, AMREntry } from "@supabase/supabase-js";

interface AALInfo {
  currentLevel: AuthenticatorAssuranceLevels;
  nextLevel: AuthenticatorAssuranceLevels;
  currentAuthenticationMethods: AMREntry[];
}

export function useMFA() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [aalInfo, setAALInfo] = useState<AALInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Carregar fatores MFA
  const loadFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      const allFactors = [...(data.totp || []), ...(data.phone || [])];
      setFactors(allFactors);
      return allFactors;
    } catch (error: any) {
      console.error('Erro ao carregar fatores MFA:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar configurações MFA",
        description: error.message,
      });
      return [];
    }
  };

  // Verificar nível de garantia do autenticador
  const checkAAL = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) throw error;
      
      setAALInfo(data);
      return data;
    } catch (error: any) {
      console.error('Erro ao verificar AAL:', error);
      return null;
    }
  };

  // Cadastrar novo fator TOTP
  const enrollTOTP = async (friendlyName?: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: friendlyName || 'Aplicativo Autenticador'
      });

      if (error) throw error;

      toast({
        title: "Configuração iniciada",
        description: "Escaneie o QR code com seu aplicativo autenticador.",
      });

      return {
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        uri: data.totp.uri
      };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao iniciar configuração MFA",
        description: error.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verificar código TOTP e finalizar cadastro
  const verifyAndActivate = async (factorId: string, code: string) => {
    try {
      setLoading(true);

      // Criar desafio
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      // Verificar código
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: code.trim(),
      });

      if (verify.error) throw verify.error;

      toast({
        title: "2FA ativado com sucesso!",
        description: "Sua conta agora está protegida com autenticação de dois fatores.",
      });

      // Recarregar fatores
      await loadFactors();
      await checkAAL();

      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Código inválido",
        description: "Verifique o código e tente novamente.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remover fator MFA
  const unenroll = async (factorId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;

      toast({
        title: "MFA removido",
        description: "O fator de autenticação foi removido da sua conta.",
      });

      // Recarregar fatores
      await loadFactors();
      await checkAAL();

      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover MFA",
        description: error.message,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verificar código MFA durante login
  const challengeAndVerify = async (code: string, factorId?: string) => {
    try {
      setLoading(true);

      // Se não tiver factorId, pegar o primeiro TOTP disponível
      let targetFactorId = factorId;
      if (!targetFactorId) {
        const currentFactors = await loadFactors();
        const totpFactor = currentFactors.find(f => f.factor_type === 'totp' && f.status === 'verified');
        if (!totpFactor) {
          throw new Error('Nenhum fator TOTP encontrado');
        }
        targetFactorId = totpFactor.id;
      }

      // Criar desafio
      const challenge = await supabase.auth.mfa.challenge({ factorId: targetFactorId });
      if (challenge.error) throw challenge.error;

      // Verificar código
      const verify = await supabase.auth.mfa.verify({
        factorId: targetFactorId,
        challengeId: challenge.data.id,
        code: code.trim(),
      });

      if (verify.error) throw verify.error;

      // Atualizar AAL info
      await checkAAL();

      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verificação falhou",
        description: error.message,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verificar se MFA está habilitado
  const isMFAEnabled = () => {
    return factors.some(factor => factor.status === 'verified');
  };

  // Verificar se precisa de MFA challenge
  const requiresMFAChallenge = () => {
    return aalInfo?.currentLevel === 'aal1' && aalInfo?.nextLevel === 'aal2';
  };

  // Inicializar na montagem do componente
  useEffect(() => {
    loadFactors();
    checkAAL();
  }, []);

  return {
    // Estados
    factors,
    aalInfo,
    loading,
    
    // Funções de verificação
    isMFAEnabled: isMFAEnabled(),
    requiresMFAChallenge: requiresMFAChallenge(),
    
    // Ações
    loadFactors,
    checkAAL,
    enrollTOTP,
    verifyAndActivate,
    unenroll,
    challengeAndVerify,
  };
} 