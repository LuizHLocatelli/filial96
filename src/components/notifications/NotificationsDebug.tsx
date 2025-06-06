import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConnectionStatus {
  supabaseConnection: boolean;
  realtimeConnection: boolean;
  userAuthenticated: boolean;
  activitiesTableAccess: boolean;
  notificationTableAccess: boolean;
}

export function NotificationsDebug() {
  const [status, setStatus] = useState<ConnectionStatus>({
    supabaseConnection: false,
    realtimeConnection: false,
    userAuthenticated: false,
    activitiesTableAccess: false,
    notificationTableAccess: false,
  });
  const [isChecking, setIsChecking] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { profile, user } = useAuth();
  const { toast } = useToast();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const checkConnection = async () => {
    setIsChecking(true);
    setLogs([]);
    addLog("🔍 Iniciando diagnóstico das notificações...");

    const newStatus: ConnectionStatus = {
      supabaseConnection: false,
      realtimeConnection: false,
      userAuthenticated: false,
      activitiesTableAccess: false,
      notificationTableAccess: false,
    };

    try {
      // 1. Verificar conexão com Supabase
      addLog("🔗 Verificando conexão com Supabase...");
      const { data: healthCheck, error: healthError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (!healthError) {
        newStatus.supabaseConnection = true;
        addLog("✅ Conexão com Supabase: OK");
      } else {
        addLog(`❌ Erro de conexão Supabase: ${healthError.message}`);
      }

      // 2. Verificar autenticação
      addLog("👤 Verificando autenticação...");
      if (user && profile) {
        newStatus.userAuthenticated = true;
        addLog(`✅ Usuário autenticado: ${user.email} (ID: ${user.id})`);
      } else {
        addLog("❌ Usuário não autenticado ou perfil não carregado");
      }

      // 3. Verificar acesso à tabela activities
      addLog("📊 Verificando acesso à tabela activities...");
      try {
        const { data: activities, error: activitiesError } = await supabase
          .from('activities')
          .select('id, timestamp')
          .limit(1);
        
        if (!activitiesError) {
          newStatus.activitiesTableAccess = true;
          addLog(`✅ Acesso à tabela activities: OK (${activities?.length || 0} registros encontrados)`);
        } else {
          addLog(`❌ Erro ao acessar activities: ${activitiesError.message}`);
        }
      } catch (error: any) {
        addLog(`❌ Erro na consulta activities: ${error.message}`);
      }

      // 4. Verificar acesso à tabela notification_read_status
      addLog("📋 Verificando acesso à tabela notification_read_status...");
      if (user?.id) {
        try {
          const { data: readStatus, error: readStatusError } = await supabase
            .from('notification_read_status')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);
          
          if (!readStatusError) {
            newStatus.notificationTableAccess = true;
            addLog(`✅ Acesso à tabela notification_read_status: OK`);
          } else {
            addLog(`❌ Erro ao acessar notification_read_status: ${readStatusError.message}`);
          }
        } catch (error: any) {
          addLog(`❌ Erro na consulta notification_read_status: ${error.message}`);
        }
      }

      // 5. Verificar conexão realtime
      addLog("⚡ Testando conexão realtime...");
      try {
        const channel = supabase
          .channel('debug-channel')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'activities'
            }, 
            (payload) => {
              addLog(`🆕 Evento realtime recebido: ${payload.eventType}`);
            })
          .subscribe((status) => {
            addLog(`📡 Status do canal realtime: ${status}`);
            if (status === 'SUBSCRIBED') {
              newStatus.realtimeConnection = true;
              addLog("✅ Conexão realtime: OK");
              setStatus({...newStatus});
            } else if (status === 'CHANNEL_ERROR') {
              addLog("❌ Erro na conexão realtime");
            }
          });

        // Limpar o canal após 5 segundos
        setTimeout(() => {
          supabase.removeChannel(channel);
          addLog("🧹 Canal de teste removido");
        }, 5000);

      } catch (error: any) {
        addLog(`❌ Erro no teste realtime: ${error.message}`);
      }

      setStatus(newStatus);
      addLog("✅ Diagnóstico concluído");

    } catch (error: any) {
      addLog(`❌ Erro geral no diagnóstico: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const testNotification = async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      addLog("🧪 Criando atividade de teste...");
      
      const { error } = await supabase
        .from('activities')
        .insert({
          action: 'teste',
          task_id: '00000000-0000-0000-0000-000000000000',
          task_title: 'Teste de Notificação',
          task_type: 'teste',
          user_id: user.id,
          user_name: profile?.name || 'Usuário Teste'
        });

      if (error) {
        addLog(`❌ Erro ao criar atividade de teste: ${error.message}`);
        toast({
          title: "Erro",
          description: `Erro ao criar atividade de teste: ${error.message}`,
          variant: "destructive"
        });
      } else {
        addLog("✅ Atividade de teste criada com sucesso");
        toast({
          title: "Sucesso",
          description: "Atividade de teste criada. Verifique se a notificação apareceu.",
        });
      }
    } catch (error: any) {
      addLog(`❌ Erro no teste: ${error.message}`);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = (isOk: boolean) => {
    return isOk ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const overallHealth = Object.values(status).filter(Boolean).length;
  const totalChecks = Object.keys(status).length;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Diagnóstico de Notificações
        </CardTitle>
        <CardDescription>
          Verificação do sistema de notificações em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <span className="font-medium">Status Geral:</span>
          <Badge variant={overallHealth === totalChecks ? "default" : overallHealth > 2 ? "secondary" : "destructive"}>
            {overallHealth}/{totalChecks} verificações passaram
          </Badge>
        </div>

        {/* Individual Status Checks */}
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between p-2 border rounded">
            <span>Conexão Supabase</span>
            {getStatusIcon(status.supabaseConnection)}
          </div>
          <div className="flex items-center justify-between p-2 border rounded">
            <span>Usuário Autenticado</span>
            {getStatusIcon(status.userAuthenticated)}
          </div>
          <div className="flex items-center justify-between p-2 border rounded">
            <span>Acesso à Tabela Activities</span>
            {getStatusIcon(status.activitiesTableAccess)}
          </div>
          <div className="flex items-center justify-between p-2 border rounded">
            <span>Acesso à Tabela Notifications</span>
            {getStatusIcon(status.notificationTableAccess)}
          </div>
          <div className="flex items-center justify-between p-2 border rounded">
            <span>Conexão Realtime</span>
            {getStatusIcon(status.realtimeConnection)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={checkConnection} 
            disabled={isChecking}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Verificando...' : 'Verificar Novamente'}
          </Button>
          
          <Button 
            onClick={testNotification} 
            variant="outline"
            disabled={!status.userAuthenticated || !status.activitiesTableAccess}
          >
            Testar Notificação
          </Button>
        </div>

        {/* Logs */}
        {logs.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Logs do Diagnóstico:</h3>
            <div className="bg-muted/30 rounded p-3 max-h-48 overflow-y-auto">
              <div className="space-y-1 text-sm font-mono">
                {logs.map((log, index) => (
                  <div key={index} className="text-xs">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 