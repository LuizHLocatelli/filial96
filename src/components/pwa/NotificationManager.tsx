import { useEffect, useState } from 'react';
import { usePWANotifications } from '@/hooks/usePWANotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, BellOff, Smartphone, CheckCircle, AlertTriangle, Settings, TestTube } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NotificationManagerProps {
  autoSetup?: boolean;
  showTestMode?: boolean;
}

export function NotificationManager({ autoSetup = true, showTestMode = false }: NotificationManagerProps) {
  const {
    permission,
    isSupported,
    requestPermission,
    showLocalNotification,
    showPersistentNotification,
    showDepositReminder,
    showUrgentAlert,
    showTaskNotification,
    clearAllNotifications
  } = usePWANotifications();

  const [testMode, setTestMode] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    deposits: true,
    tasks: true,
    folgas: true,
    reservas: true,
    goals: true,
    system: true,
  });

  // Carregar configurações do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pwa-notification-settings');
    if (saved) {
      try {
        setNotificationSettings(JSON.parse(saved));
      } catch {
        // Usar configurações padrão
      }
    }
  }, []);

  // Salvar configurações no localStorage
  useEffect(() => {
    localStorage.setItem('pwa-notification-settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  // Setup automático ao carregar
  useEffect(() => {
    if (autoSetup && isSupported && permission === 'default') {
      // Aguardar 3 segundos antes de solicitar permissão
      const timer = setTimeout(() => {
        requestPermission().then((granted) => {
          if (granted) {
            toast({
              title: "🔔 Notificações Ativadas!",
              description: "Você receberá notificações importantes do sistema.",
              duration: 5000,
            });
          }
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [autoSetup, isSupported, permission, requestPermission]);

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return {
          status: 'Ativadas',
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          icon: <CheckCircle className="h-4 w-4" />
        };
      case 'denied':
        return {
          status: 'Bloqueadas',
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          icon: <AlertTriangle className="h-4 w-4" />
        };
      default:
        return {
          status: 'Pendente',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          icon: <Bell className="h-4 w-4" />
        };
    }
  };

  const handleTestNotification = async (type: string) => {
    if (!notificationSettings[type as keyof typeof notificationSettings] && type !== 'local' && type !== 'persistent') {
      toast({
        title: "⚠️ Notificação desabilitada",
        description: `Ative as notificações de ${type} nas configurações.`,
        variant: "destructive"
      });
      return;
    }

    switch (type) {
      case 'local':
        await showLocalNotification({
          title: '🧪 Teste de Notificação Local',
          body: 'Esta é uma notificação de teste que aparece mesmo com o app aberto.',
          tag: 'test-local'
        });
        break;
      case 'persistent':
        await showPersistentNotification({
          title: '🧪 Teste de Notificação Persistente',
          body: 'Esta notificação fica ativa mesmo quando o app está fechado.',
          tag: 'test-persistent',
          actions: [
            { action: 'test', title: 'Ação de Teste' }
          ]
        });
        break;
      case 'deposits':
        await showDepositReminder();
        break;
      case 'urgent':
        await showUrgentAlert();
        break;
      case 'tasks':
        await showTaskNotification('Teste de Tarefa', 'Esta é uma tarefa de exemplo para testar notificações.', 'test-123');
        break;
    }
    
    toast({
      title: "📤 Notificação enviada!",
      description: "Verifique se a notificação apareceu no seu sistema.",
    });
  };

  const updateNotificationSetting = (key: keyof typeof notificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificações Não Suportadas
          </CardTitle>
          <CardDescription>
            Seu navegador não suporta notificações PWA.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const permissionInfo = getPermissionStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Notificações PWA
          <Badge className={permissionInfo.color}>
            {permissionInfo.icon}
            {permissionInfo.status}
          </Badge>
        </CardTitle>
        <CardDescription>
          Configure notificações para receber alertas importantes do sistema.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {permission === 'default' && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              📱 Ative as notificações para receber lembretes importantes como depósitos bancários, tarefas e atualizações do sistema.
            </p>
            <Button onClick={requestPermission} className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              Ativar Notificações
            </Button>
          </div>
        )}

        {permission === 'denied' && (
          <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200 mb-2">
              ❌ Notificações estão bloqueadas. Para ativá-las:
            </p>
            <ol className="text-sm text-red-700 dark:text-red-300 list-decimal list-inside space-y-1">
              <li>Clique no ícone de cadeado na barra de endereços</li>
              <li>Permita notificações para este site</li>
              <li>Recarregue a página</li>
            </ol>
          </div>
        )}

        {permission === 'granted' && (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ Notificações ativadas! Configure abaixo quais tipos você quer receber:
              </p>
            </div>

            {/* Configurações de Notificação */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="font-medium">Configurações</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Depósitos Bancários</p>
                    <p className="text-xs text-muted-foreground">Lembretes e alertas de prazo</p>
                  </div>
                  <Switch
                    checked={notificationSettings.deposits}
                    onCheckedChange={(checked) => updateNotificationSetting('deposits', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Tarefas e Orientações</p>
                    <p className="text-xs text-muted-foreground">Novas tarefas e prazos</p>
                  </div>
                  <Switch
                    checked={notificationSettings.tasks}
                    onCheckedChange={(checked) => updateNotificationSetting('tasks', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Sistema</p>
                    <p className="text-xs text-muted-foreground">Atualizações e manutenções</p>
                  </div>
                  <Switch
                    checked={notificationSettings.system}
                    onCheckedChange={(checked) => updateNotificationSetting('system', checked)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="flex-1"
                >
                  Limpar Todas
                </Button>
              </div>
            </div>

            {/* Modo de teste */}
            {showTestMode && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TestTube className="h-4 w-4" />
                      <span className="text-sm font-medium">Modo de Teste</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTestMode(!testMode)}
                    >
                      {testMode ? 'Ocultar' : 'Mostrar'}
                    </Button>
                  </div>

                  {testMode && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestNotification('local')}
                      >
                        Local
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestNotification('persistent')}
                      >
                        Persistente
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestNotification('deposits')}
                      >
                        Depósito
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestNotification('urgent')}
                      >
                        Urgente
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestNotification('tasks')}
                        className="col-span-2"
                      >
                        Tarefa
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}