import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";

export function NotificationsDebug() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Sistema de Notificações - Status
        </CardTitle>
        <CardDescription>
          Informações sobre o sistema de notificações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <span className="font-medium">Status:</span>
          <Badge variant="secondary">
            Sistema removido
          </Badge>
        </div>

        {/* Information Card */}
        <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Sistema de Notificações Removido
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                O sistema de atividades e notificações foi completamente removido do aplicativo. 
                As tabelas <code>activities</code> e <code>notification_read_status</code> não existem mais no banco de dados.
              </p>
            </div>
          </div>
        </div>

        {/* Legacy Information */}
        <div className="space-y-2">
          <h3 className="font-medium">Componentes Removidos:</h3>
          <div className="bg-muted/30 rounded p-3 text-sm">
            <ul className="space-y-1 list-disc list-inside">
              <li>Tabela <code>activities</code></li>
              <li>Tabela <code>notification_read_status</code></li>
              <li>Sistema de notificações em tempo real</li>
              <li>Timeline de atividades</li>
              <li>Central de atividades</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 