import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Shield, 
  Smartphone, 
  Clock, 
  MapPin, 
  Monitor,
  AlertTriangle,
  CheckCircle,
  Info,
  QrCode,
  Trash2,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useMFA } from "@/hooks/useMFA";
import React from "react";
import QRCode from 'qrcode';

// Componente para renderizar QR Code
const QRCodeDisplay = ({ qrCodeData, totpUri, className = "" }: { qrCodeData: string; totpUri?: string; className?: string }) => {
  // LOG IMEDIATO DA PROP EM CADA RENDER
  console.log(`%c[QRCodeDisplay Render] Prop qrCodeData: "${qrCodeData ? qrCodeData.substring(0, 70) : 'N/A'}..." (len: ${qrCodeData ? qrCodeData.length : 0}), Prop totpUri: ${!!totpUri}`, 'background: #222; color: #bada55');

  const [qrError, setQrError] = useState(false);
  const [fallbackQr, setFallbackQr] = useState<string>('');
  const [useSupabaseQR, setUseSupabaseQR] = useState(true);
  const [isGeneratingFallback, setIsGeneratingFallback] = useState(false);
  
  const generateFallbackQR = React.useCallback(async () => {
    if (!totpUri) {
      console.error('URI TOTP não disponível para fallback');
      setQrError(true);
      return;
    }
    if (isGeneratingFallback) return;
    try {
      setIsGeneratingFallback(true);
      console.log('🔧 Gerando QR Code de fallback para URI:', totpUri.substring(0, 50) + '...');
      const qrDataURL = await QRCode.toDataURL(totpUri, { width: 200, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } });
      setFallbackQr(qrDataURL);
      setUseSupabaseQR(false);
      console.log('✅ QR Code de fallback gerado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code de fallback:', error);
      setQrError(true);
    } finally {
      setIsGeneratingFallback(false);
    }
  }, [totpUri, isGeneratingFallback]);
  
  const isSupabaseQRValid = React.useMemo(() => {
    const fnCallId_isSupabaseQRValid = `isSupabaseQRValid-${Date.now()}${Math.random().toString(36).substring(2, 5)}`; 
    console.log(`%c[${fnCallId_isSupabaseQRValid}] Iniciando validação. qrCodeData: "${qrCodeData ? qrCodeData.substring(0, 70) : 'N/A'}..." (len: ${qrCodeData ? qrCodeData.length : 0})`, 'color: cyan;');

    if (!qrCodeData || typeof qrCodeData !== 'string' || qrCodeData.trim() === '') {
      console.log(`%c[${fnCallId_isSupabaseQRValid}] ❌ Retornando false (vazio, não string, ou só espaços).`, 'color: red;');
      return false;
    }
    const trimmedQrData = qrCodeData.trim();
    const problematicPrefixExact1 = 'data:image/svg+xml;utf-8,';
    const problematicPrefixExact2 = 'data:image/svg+xml;utf8,';
    if (trimmedQrData === problematicPrefixExact1 || trimmedQrData === problematicPrefixExact2) {
      console.log(`%c[${fnCallId_isSupabaseQRValid}] ❌ Retornando false (QR Code é EXATAMENTE um prefixo problemático).`, 'color: red; font-weight: bold;');
      return false;
    }
    if (trimmedQrData.startsWith('data:image/svg+xml')) {
      const containsSvgTag = trimmedQrData.includes('<svg');
      const containsClosingSvgTag = trimmedQrData.includes('</svg>');
      const isVeryShort = trimmedQrData.length < 70;
      
      console.log(`%c[${fnCallId_isSupabaseQRValid}] Detalhes da avaliação para SVG (após checagem de prefixo exato):`, 'color: orange;');
      console.log(`  %c- startsWith('data:image/svg+xml'): true`, 'color: orange;');
      console.log(`  %c- includes('<svg'): ${containsSvgTag}`, 'color: orange;');
      console.log(`  %c- includes('</svg'): ${containsClosingSvgTag}`, 'color: orange;');
      console.log(`  %c- length < 70 (isVeryShort): ${isVeryShort}`, 'color: orange;');

      if (isVeryShort && !containsSvgTag) {
         console.log(`%c[${fnCallId_isSupabaseQRValid}] ❌ Retornando false (começa com 'data:image/svg+xml', MUITO CURTO e SEM tag '<svg').`, 'color: red;');
         return false;
      }
      
      if (!containsSvgTag || !containsClosingSvgTag) {
          if (trimmedQrData.length < 150) { 
            console.log(`%c[${fnCallId_isSupabaseQRValid}] ❌ Retornando false (começa com 'data:image/svg+xml', SEM tags SVG completas e comprimento < 150).`, 'color: red;');
            return false;
          }
          console.log(`%c[${fnCallId_isSupabaseQRValid}] 🤔 Alerta: começa com 'data:image/svg+xml', mas sem tags SVG completas e comprimento >= 150. Permitindo por ora, pode ser outro formato de data URI ou SVG muito estranho.`, 'color: yellow;');
      }
      
      if (containsSvgTag && containsClosingSvgTag) {
        console.log(`%c[${fnCallId_isSupabaseQRValid}] ✅ Retornando true (contém tags SVG completas).`, 'color: green;');
        return true;
      }
    }
    if (trimmedQrData.startsWith('data:image/') && trimmedQrData.length > 150) {
      console.log(`%c[${fnCallId_isSupabaseQRValid}] ✅ Retornando true (data URI de imagem genérico e suficientemente longo).`, 'color: green;');
      return true;
    }
    if (trimmedQrData.length < 50) {
        console.log(`%c[${fnCallId_isSupabaseQRValid}] ❌ Retornando false (comprimento geral MUITO CURTO < 50).`, 'color: red;');
        return false;
    }
    console.log(`%c[${fnCallId_isSupabaseQRValid}] ❌ Retornando false (NENHUMA REGRA DE VALIDAÇÃO SATISFEITA).`, 'color: red; font-weight: bold;');
    return false;
  }, [qrCodeData]);
  
  React.useEffect(() => {
    const effectCallId = `useEffectPrincipal-${Date.now()}${Math.random().toString(36).substring(2, 5)}`;
    console.log(`%c[${effectCallId}] Disparado. QR Data len: ${qrCodeData ? qrCodeData.length : 'N/A'}, TOTP URI: ${!!totpUri}`, 'color: magenta;');
    
    if (totpUri) {
      const supabaseQRIsValidResult = isSupabaseQRValid;
      console.log(`%c[${effectCallId}] Avaliação de isSupabaseQRValid: ${supabaseQRIsValidResult}`, supabaseQRIsValidResult ? 'color: green;' : 'color: red;');

      if (!supabaseQRIsValidResult) {
        console.log(`%c[${effectCallId}] 🚨 Decisão: Usar FALLBACK (isSupabaseQRValid: false).`, 'color: red;');
        setUseSupabaseQR(false);
        if (!isGeneratingFallback) generateFallbackQR();
      } else {
        console.log(`%c[${effectCallId}] ✅ Decisão: Usar SUPABASE QR (isSupabaseQRValid: true).`, 'color: green;');
        setUseSupabaseQR(true);
        setFallbackQr(''); 
      }
    } else {
      console.log(`%c[${effectCallId}] ⚠️ TOTP URI indisponível. Impossível gerar fallback. Tentará usar Supabase QR se existir.`, 'color: yellow;');
      setUseSupabaseQR(!!qrCodeData);
    }
  }, [qrCodeData, totpUri, isSupabaseQRValid, generateFallbackQR, isGeneratingFallback]);
  
  React.useEffect(() => {
    console.log('=== QRCodeDisplay Status ===');
    console.log('- QR Length:', qrCodeData?.length || 0);
    console.log('- Starts with:', qrCodeData?.substring(0, 50) || 'N/A');
    console.log('- Is valid:', isSupabaseQRValid);
    console.log('- Use Supabase:', useSupabaseQR);
    console.log('- Has fallback:', !!fallbackQr);
    console.log('- TOTP URI available:', !!totpUri);
    console.log('- Is generating:', isGeneratingFallback);
    console.log('- Error state:', qrError);
    console.log('============================');
  }, [qrCodeData, totpUri, isSupabaseQRValid, useSupabaseQR, fallbackQr, isGeneratingFallback, qrError]);
  
  if (!qrCodeData && !totpUri) {
    return (
      <div className={`border-2 border-dashed border-gray-300 rounded flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <QrCode className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Carregando QR Code...</p>
        </div>
      </div>
    );
  }

  if (isGeneratingFallback) {
    return (
      <div style={{ border: '1px dashed lightgray', width: '200px', height: '200px', display:'flex', alignItems:'center', justifyContent:'center' }} className={className}>
        <div className="text-center p-4">
          <QrCode className="h-8 w-8 mx-auto text-gray-400 mb-2 animate-pulse" />
          <p className="text-sm text-gray-500">Gerando QR Code...</p>
        </div>
      </div>
    );
  }

  if (!useSupabaseQR && fallbackQr) {
    console.log('%c📱 Renderizando QR Code de FALLBACK', 'background: #222; color: limegreen; font-weight: bold;');
    return (
      <div key={fallbackQr} style={{ border: '2px solid green', width: '200px', height: '200px', padding: '5px', backgroundColor: 'white' }} className={className}>
        <img src={fallbackQr} alt="QR Code para autenticação" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    );
  }

  if (qrError || (!useSupabaseQR && !fallbackQr && !isGeneratingFallback)) {
    return (
      <div style={{ border: '2px dashed darkred', width: '200px', height: '200px', display:'flex', alignItems:'center', justifyContent:'center'}} className={className}>
        <div className="text-center p-4">
          <QrCode className="h-8 w-8 mx-auto text-red-400 mb-2" />
          <p className="text-sm text-red-500">Erro ao carregar QR Code</p>
          <p className="text-xs text-gray-400 mt-1">Use o código manual abaixo</p>
          
          {totpUri && !isGeneratingFallback && (
            <button 
              onClick={() => {
                console.log('🔄 Tentativa manual de gerar QR Code via botão');
                setQrError(false);
                if (!isGeneratingFallback) generateFallbackQR();
              }}
              className="mt-2 px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    );
  }

  if (useSupabaseQR && qrCodeData) {
    console.log('%c📱 Tentando renderizar QR Code do SUPABASE...', 'background: #222; color: #add8e6; font-weight: bold;');
    
    if (typeof qrCodeData === 'string' && qrCodeData.includes('<svg')) {
      console.log('%c   Metodo: dangerouslySetInnerHTML (qrCodeData é string e inclui \'<svg>\')', 'color: #1e90ff');
      
      const containerStyle: React.CSSProperties = {
        border: '2px solid blue', 
        width: '200px', 
        height: '200px', 
        padding: '0px', // Removido padding para simplificar o encaixe do SVG filho
        backgroundColor: 'white',
        overflow: 'hidden' 
      };
      
      let rawSvgContent = qrCodeData;
      const dataUriPrefix = 'data:image/svg+xml;utf-8,';
      let originalViewBox = '0 0 200 200'; // Default viewBox, tentaremos extrair o real

      // Tentativa de extrair o conteúdo SVG real se for um data URI
      if (rawSvgContent.startsWith(dataUriPrefix)) {
        console.log('%c   INFO: qrCodeData é um data URI. Tentando extrair conteúdo SVG.', 'color: gray');
        rawSvgContent = rawSvgContent.substring(dataUriPrefix.length);
      }
      
      // Remove comentários XML
      rawSvgContent = rawSvgContent.replace(/<!--.*?-->/gs, '');
      
      // Log para verificar se o texto problemático está no conteúdo SVG bruto
      if (rawSvgContent.includes('data:image/svg+xml;utf-8,')) {
        console.warn('%c   ALERTA CRÍTICO: O texto "data:image/svg+xml;utf-8," FOI ENCONTRADO DENTRO do conteúdo SVG processado! Isso é inesperado.', 'color: red; font-weight: bold;');
      }

      // Tenta extrair o viewBox original do SVG interno
      const viewBoxMatch = rawSvgContent.match(/viewBox=(["'])(.*?)(["'])/);
      if (viewBoxMatch && viewBoxMatch[2]) {
        originalViewBox = viewBoxMatch[2];
        console.log(`%c   INFO: ViewBox original detectado: "${originalViewBox}"`, 'color: gray');
      }

      // Envolve o SVG original com um SVG externo para controlar o dimensionamento
      // O SVG interno usará o preserveAspectRatio do SVG externo.
      const wrappedSvg = 
        `<svg width="100%" height="100%" viewBox="${originalViewBox}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
          ${rawSvgContent}
         </svg>`;

      return (
        <div 
          key={qrCodeData} // Key ainda no qrCodeData original para reagir a mudanças dele
          style={containerStyle}
          className={className} 
          dangerouslySetInnerHTML={{ __html: wrappedSvg }}
        />
      );
    } else if (typeof qrCodeData === 'string') {
      console.log('%c   Metodo: <img> tag (qrCodeData é string mas NÃO inclui \'<svg>\')', 'color: #ffa500');
      return (
        <div key={qrCodeData + '-img-container'} style={{ border: '2px solid orange', width: '200px', height: '200px', padding: '5px', backgroundColor: 'white'}} className={className}>
          <img 
            key={qrCodeData} 
            src={qrCodeData}
            alt="QR Code para autenticação" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => {
              console.error('❌ Erro ao carregar QR Code do Supabase na img tag:', e);
              setUseSupabaseQR(false);
              if (!isGeneratingFallback) generateFallbackQR();
            }}
          />
        </div>
      );
    } else {
      console.log(`%c   Metodo: NENHUM (qrCodeData não é uma string, tipo: ${typeof qrCodeData}) - Renderizando placeholder`, 'color: #ff0000');
      return (
        <div style={{ border: '1px dashed red', width: '200px', height: '200px', display:'flex', alignItems:'center', justifyContent:'center' }} className={className}>
           <div className="text-center p-4">
              <QrCode className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Dados do QR inválidos...</p>
           </div>
        </div>
      );
    }
  }

  if (totpUri && !fallbackQr && !isGeneratingFallback && !qrError) {
    console.log('🔄 Forçando geração de fallback como último recurso');
    generateFallbackQR();
  }

  console.log('%c🤔 Renderizando placeholder de carregamento/preparando...', 'color: gray');
  return (
    <div style={{ border: '1px dashed gray', width: '200px', height: '200px', display:'flex', alignItems:'center', justifyContent:'center' }} className={className}>
       <div className="text-center p-4">
          <QrCode className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Preparando QR Code...</p>
       </div>
    </div>
  );
};

// Schema para configurações de segurança
const securitySettingsSchema = z.object({
  emailNotifications: z.boolean(),
  loginNotifications: z.boolean(),
});

interface LoginSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export function SecuritySettingsForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  
  // Usar o hook MFA
  const {
    factors,
    loading,
    isMFAEnabled,
    enrollTOTP,
    verifyAndActivate,
    unenroll,
    loadFactors
  } = useMFA();
  
  // MFA Setup States
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [totpUri, setTotpUri] = useState('');
  const [factorId, setFactorId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [setupStep, setSetupStep] = useState<'qr' | 'verify'>('qr');
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const form = useForm<z.infer<typeof securitySettingsSchema>>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      emailNotifications: true,
      loginNotifications: true,
    },
  });

  useEffect(() => {
    // Simulação de sessões ativas (em uma implementação real, viria do backend)
    const mockSessions: LoginSession[] = [
      {
        id: "1",
        device: "Chrome no Windows",
        location: "Vitória, ES",
        lastActive: "Agora",
        current: true
      },
      {
        id: "2", 
        device: "Firefox no Windows",
        location: "Vitória, ES",
        lastActive: "2 horas atrás",
        current: false
      }
    ];
    setSessions(mockSessions);
  }, []);

  const onSubmit = async (data: z.infer<typeof securitySettingsSchema>) => {
    try {
      // Aqui você salvaria as preferências de notificação no banco de dados
      // await supabase.from('user_preferences').upsert({ ... });
      
      toast({
        title: "Configurações atualizadas",
        description: "Suas preferências de segurança foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar configurações",
        description: error.message,
      });
    }
  };

  const handleSignOutAllDevices = async () => {
    try {
      // Fazer logout de todas as sessões
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você foi deslogado de todos os dispositivos.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: error.message,
      });
    }
  };

  // Iniciar processo de configuração do 2FA
  const handleStartMFASetup = async () => {
    try {
      // Verificar se já existe um fator ativo
      if (factors.some(f => f.status === 'verified')) {
        toast({
          variant: "destructive",
          title: "2FA já ativo",
          description: "Você já tem autenticação de dois fatores configurada.",
        });
        return;
      }

      // Verificar se já existe um fator pendente e remover
      const pendingFactors = factors.filter(f => f.status === 'unverified');
      for (const factor of pendingFactors) {
        await unenroll(factor.id);
      }

      // Gerar nome único para o fator
      const timestamp = Date.now();
      const friendlyName = `Autenticador ${timestamp}`;
      
      const setupData = await enrollTOTP(friendlyName);
      
      setFactorId(setupData.factorId);
      setQrCode(setupData.qrCode);
      setSecret(setupData.secret);
      setTotpUri(setupData.uri);
      setSetupStep('qr');
      setShowSetupDialog(true);
      
    } catch (error: any) {
      console.error('Erro ao iniciar MFA:', error);
      toast({
        variant: "destructive",
        title: "Erro ao iniciar configuração",
        description: error.message || "Não foi possível iniciar a configuração do 2FA",
      });
    }
  };

  // Verificar código e ativar 2FA
  const handleVerifyMFA = async () => {
    try {
      if (verificationCode.length !== 6) {
        toast({
          variant: "destructive",
          title: "Código inválido",
          description: "O código deve ter exatamente 6 dígitos.",
        });
        return;
      }

      const success = await verifyAndActivate(factorId, verificationCode);
      
      if (success) {
        setShowSetupDialog(false);
        setVerificationCode('');
        setSetupStep('qr');
        
        // Recarregar fatores
        await loadFactors();
      }
    } catch (error: any) {
      console.error('Erro ao verificar MFA:', error);
    }
  };

  // Desativar 2FA
  const handleDisableMFA = async (factorToRemove: any) => {
    try {
      const success = await unenroll(factorToRemove.id);
      
      if (success) {
        // Recarregar fatores
        await loadFactors();
      }
    } catch (error: any) {
      console.error('Erro ao desativar MFA:', error);
    }
  };

  // Copiar secret para clipboard
  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({
      title: "Copiado!",
      description: "Código secreto copiado para a área de transferência.",
    });
  };

  // Fatores verificados
  const verifiedFactors = factors.filter(f => f.status === 'verified');

  return (
    <div className="space-y-6">
      {/* Status de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
            Status de Segurança
          </CardTitle>
          <CardDescription className="text-sm">
            Visão geral da segurança da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Senha forte</span>
            </div>
            <Badge variant="secondary" className="text-xs">Ativo</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Email verificado</span>
            </div>
            <Badge variant="secondary" className="text-xs">Ativo</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isMFAEnabled ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              )}
              <span className="text-sm">Autenticação de dois fatores</span>
            </div>
            <Badge variant={isMFAEnabled ? "secondary" : "outline"} className="text-xs">
              {isMFAEnabled ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Autenticação Multifator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
            Autenticação de Dois Fatores (2FA)
          </CardTitle>
          <CardDescription className="text-sm">
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isMFAEnabled ? (
            <>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  A autenticação de dois fatores adiciona uma camada extra de segurança. 
                  Você precisará de um código do seu telefone para fazer login.
                </AlertDescription>
              </Alert>
              
              <Button onClick={handleStartMFASetup} disabled={loading} className="w-full sm:w-auto">
                <QrCode className="h-4 w-4 mr-2" />
                {loading ? "Configurando..." : "Configurar 2FA"}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-400 text-sm">
                  Sua conta está protegida com autenticação de dois fatores.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm sm:text-base">Dispositivos Autenticadores Ativos:</h4>
                {verifiedFactors.map((factor) => (
                  <div key={factor.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-4 w-4 text-green-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {factor.friendly_name || 'Aplicativo Autenticador'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Configurado em {new Date(factor.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDisableMFA(factor)}
                      disabled={loading}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                ))}
                
                {verifiedFactors.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum dispositivo autenticador encontrado.
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Configuração 2FA */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {setupStep === 'qr' ? 'Configurar 2FA' : 'Confirmar Código'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {setupStep === 'qr' 
                ? "Escaneie o QR code ou use o código manual" 
                : "Digite o código do seu aplicativo"}
            </DialogDescription>
          </DialogHeader>
          
          {setupStep === 'qr' && (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-3 bg-white rounded-lg border w-fit">
                  <QRCodeDisplay qrCodeData={qrCode} totpUri={totpUri} className="w-40 h-40 sm:w-48 sm:h-48" />
                </div>
              </div>
              
              {/* Código Manual */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Código manual:</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={secret} 
                    readOnly 
                    type={showSecret ? "text" : "password"}
                    className="font-mono text-xs flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSecret(!showSecret)}
                    className="h-9 w-9 shrink-0"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copySecret}
                    className="h-9 w-9 shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Instruções */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Use Google Authenticator, Authy ou similar para escanear o código.
                </AlertDescription>
              </Alert>
              
              {/* Debug Info (apenas em desenvolvimento e quando solicitado) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="border-t pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDebugInfo(!showDebugInfo)}
                    className="text-xs text-muted-foreground"
                  >
                    {showDebugInfo ? 'Ocultar' : 'Mostrar'} debug do QR Code
                  </Button>
                  
                  {showDebugInfo && (
                    <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                      <p><strong>Debug QR Code:</strong></p>
                      
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <span>Supabase QR: {qrCode ? '✓' : '✗'}</span>
                        <span>Length: {qrCode?.length || 0}</span>
                        <span>Valid: {qrCode?.length > 50 ? '✓' : '✗'}</span>
                        <span>URI: {totpUri ? '✓' : '✗'}</span>
                      </div>
                      
                      <div className="mt-2">
                        <p><strong>QR Code raw (primeiros 100 chars):</strong></p>
                        <pre className="text-xs mt-1 p-2 bg-white border rounded text-wrap">
                          {qrCode?.substring(0, 100) || 'Não disponível'}
                        </pre>
                      </div>
                      
                      {totpUri && (
                        <div className="mt-2">
                          <p><strong>URI TOTP:</strong></p>
                          <pre className="text-xs mt-1 p-2 bg-white border rounded text-wrap">
                            {totpUri}
                          </pre>
                        </div>
                      )}
                      
                      <div className="mt-2 flex gap-2">
                        <button 
                          onClick={() => {
                            console.log('=== MANUAL DEBUG ===');
                            console.log('QR Code completo:', qrCode);
                            console.log('URI TOTP:', totpUri);
                            console.log('==================');
                          }}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded"
                        >
                          Log completo
                        </button>
                        
                        {totpUri && (
                          <button 
                            onClick={async () => {
                              try {
                                const fallback = await QRCode.toDataURL(totpUri, { width: 200 });
                                console.log('Fallback QR gerado:', fallback.substring(0, 100) + '...');
                                
                                // Criar um link de download temporário
                                const link = document.createElement('a');
                                link.href = fallback;
                                link.download = 'qr-code-2fa.png';
                                link.click();
                              } catch (e) {
                                console.error('Erro ao gerar fallback manual:', e);
                              }
                            }}
                            className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded"
                          >
                            Download QR
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {setupStep === 'verify' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code" className="text-sm font-medium">
                  Código de verificação:
                </Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-lg tracking-widest font-mono"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Digite o código de 6 dígitos do seu aplicativo
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => setShowSetupDialog(false)} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
            {setupStep === 'qr' ? (
              <Button onClick={() => setSetupStep('verify')} className="flex-1 sm:flex-none">
                Continuar
              </Button>
            ) : (
              <Button 
                onClick={handleVerifyMFA} 
                disabled={loading || verificationCode.length !== 6}
                className="flex-1 sm:flex-none"
              >
                {loading ? "Verificando..." : "Ativar 2FA"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sessões Ativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Monitor className="h-4 w-4 sm:h-5 sm:w-5" />
            Dispositivos Conectados
          </CardTitle>
          <CardDescription className="text-sm">
            Gerencie os dispositivos que têm acesso à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.map((session, index) => (
            <div key={session.id}>
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Monitor className="h-4 w-4 shrink-0" />
                    <span className="font-medium text-sm truncate">{session.device}</span>
                    {session.current && (
                      <Badge variant="default" className="text-xs">
                        Este dispositivo
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {session.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.lastActive}
                    </div>
                  </div>
                </div>
              </div>
              {index < sessions.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
          
          <div className="pt-4">
            <Button 
              variant="outline" 
              onClick={handleSignOutAllDevices}
              disabled={loading}
              className="w-full"
              size="sm"
            >
              Desconectar de todos os dispositivos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notificações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Notificações de Segurança</CardTitle>
          <CardDescription className="text-sm">
            Configure quando você quer ser notificado sobre atividades da conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Notificações por email</p>
                <p className="text-xs text-muted-foreground">
                  Receber alertas de segurança por email
                </p>
              </div>
              <Switch
                checked={form.watch("emailNotifications")}
                onCheckedChange={(checked) => 
                  form.setValue("emailNotifications", checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Alertas de login</p>
                <p className="text-xs text-muted-foreground">
                  Notificar sobre logins de novos dispositivos
                </p>
              </div>
              <Switch
                checked={form.watch("loginNotifications")}
                onCheckedChange={(checked) => 
                  form.setValue("loginNotifications", checked)
                }
              />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full" size="sm">
              {loading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 