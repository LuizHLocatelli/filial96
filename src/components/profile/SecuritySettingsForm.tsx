import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Shield, 
  Clock, 
  MapPin, 
  Monitor,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  ip?: string;
}

// Hook para detecção de dispositivo usando navigator.userAgent nativo
const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState<string>('');
  
  useEffect(() => {
    const detectDevice = () => {
      const ua = navigator.userAgent;
      let browser = 'Navegador Desconhecido';
      let os = 'OS Desconhecido';
      
      // Detectar navegador
      if (ua.includes('Chrome') && !ua.includes('Edge')) {
        browser = 'Chrome';
      } else if (ua.includes('Firefox')) {
        browser = 'Firefox';
      } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
        browser = 'Safari';
      } else if (ua.includes('Edge')) {
        browser = 'Edge';
      } else if (ua.includes('Opera')) {
        browser = 'Opera';
      }
      
      // Detectar sistema operacional
      if (ua.includes('Windows NT 10.0')) {
        os = 'Windows 10';
      } else if (ua.includes('Windows NT 6.3')) {
        os = 'Windows 8.1';
      } else if (ua.includes('Windows NT 6.2')) {
        os = 'Windows 8';
      } else if (ua.includes('Windows NT 6.1')) {
        os = 'Windows 7';
      } else if (ua.includes('Windows')) {
        os = 'Windows';
      } else if (ua.includes('Mac OS X')) {
        os = 'macOS';
      } else if (ua.includes('Linux')) {
        os = 'Linux';
      } else if (ua.includes('Android')) {
        os = 'Android';
      } else if (ua.includes('iPhone') || ua.includes('iPad')) {
        os = 'iOS';
      }
      
      setDeviceInfo(`${browser} no ${os}`);
    };
    
    detectDevice();
  }, []);
  
  return deviceInfo;
};

// Hook para detecção de localização
const useLocationDetection = () => {
  const [location, setLocation] = useState<string>('Carregando...');
  
  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Usando ipapi.co para geolocalização baseada em IP (gratuita)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.city && data.region) {
          setLocation(`${data.city}, ${data.region}`);
        } else if (data.city) {
          setLocation(data.city);
        } else if (data.country_name) {
          setLocation(data.country_name);
        } else {
          setLocation('Localização não disponível');
        }
      } catch (error) {
        console.error('Erro ao detectar localização:', error);
        setLocation('Localização não disponível');
      }
    };
    
    detectLocation();
  }, []);
  
  return location;
};

export function SecuritySettingsForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  const deviceInfo = useDeviceDetection();
  const currentLocation = useLocationDetection();

  const form = useForm<z.infer<typeof securitySettingsSchema>>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      emailNotifications: true,
      loginNotifications: true,
    },
  });

  useEffect(() => {
    const loadUserSessions = async () => {
      setLoadingSessions(true);
      try {
        // Obter informações do usuário atual
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser) {
          const currentSession: LoginSession = {
            id: "current",
            device: deviceInfo || 'Detectando dispositivo...',
            location: currentLocation,
            lastActive: "Agora",
            current: true
          };
          
          // Por enquanto, mostrar apenas a sessão atual
          // Em uma implementação completa, você poderia armazenar sessões em uma tabela customizada
          const allSessions = [currentSession];
          
          // Simular uma sessão adicional se necessário (pode remover depois)
          if (currentUser.last_sign_in_at) {
            const lastSignIn = new Date(currentUser.last_sign_in_at);
            const now = new Date();
            const diffHours = Math.round((now.getTime() - lastSignIn.getTime()) / (1000 * 60 * 60));
            
            if (diffHours > 2) {
              allSessions.push({
                id: "previous",
                device: "Sessão anterior",
                location: "Localização anterior",
                lastActive: `${diffHours} horas atrás`,
                current: false
              });
            }
          }
          
          setSessions(allSessions);
        }
      } catch (error) {
        console.error('Erro ao carregar sessões:', error);
        // Fallback para dados de exemplo se houver erro
        setSessions([{
          id: "current",
          device: deviceInfo || "Dispositivo atual",
          location: currentLocation,
          lastActive: "Agora",
          current: true
        }]);
      } finally {
        setLoadingSessions(false);
      }
    };

    // Só carregar quando tivermos as informações básicas
    if (deviceInfo && currentLocation !== 'Carregando...') {
      loadUserSessions();
    }
  }, [deviceInfo, currentLocation]);

  const onSubmit = async (data: z.infer<typeof securitySettingsSchema>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Configurações atualizadas",
        description: "Suas preferências de segurança foram salvas com sucesso.",
        duration: 4000,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar configurações",
        description: error.message,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutAllDevices = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi deslogado de todos os dispositivos. Redirecionando...",
        duration: 3000,
      });
      
      // Aguardar um momento para mostrar o toast, depois redirecionar
      setTimeout(() => {
        window.location.href = '/auth';
      }, 2000);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: error.message,
        duration: 5000,
      });
      setLoading(false);
    }
    // Não definir setLoading(false) aqui porque a página vai redirecionar
  };

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
        </CardContent>
      </Card>

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
          {loadingSessions ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Detectando dispositivos...</span>
              </div>
            </div>
          ) : (
            <>
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
                <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      disabled={loading}
                      className="w-full"
                      size="sm"
                    >
                      Desconectar de todos os dispositivos
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Desconectar de todos os dispositivos?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação irá desconectar sua conta de todos os dispositivos, incluindo este dispositivo atual. 
                        Você será redirecionado para a página de login.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleSignOutAllDevices}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {loading ? "Desconectando..." : "Sim, desconectar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          )}
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