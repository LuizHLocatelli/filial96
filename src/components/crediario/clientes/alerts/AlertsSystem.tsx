import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, Phone, MessageSquare, Calendar, AlertTriangle } from "lucide-react";
import { Cliente } from "@/components/crediario/types";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Alert {
  id: string;
  type: "vencimento" | "promessa" | "follow_up" | "urgente";
  cliente: Cliente;
  message: string;
  priority: "low" | "medium" | "high";
  createdAt: Date;
}

interface AlertsSystemProps {
  clientes: Cliente[];
}

export function AlertsSystem({ clientes }: AlertsSystemProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  useEffect(() => {
    generateAlerts();
  }, [clientes]);

  const generateAlerts = () => {
    const today = new Date();
    const newAlerts: Alert[] = [];

    clientes.forEach(cliente => {
      const diasAtraso = differenceInDays(today, cliente.diaPagamento);
      
      // Alerta de vencimento próximo (3 dias antes)
      const diasParaVencimento = differenceInDays(cliente.diaPagamento, today);
      if (diasParaVencimento <= 3 && diasParaVencimento >= 0) {
        newAlerts.push({
          id: `vencimento-${cliente.id}`,
          type: "vencimento",
          cliente,
          message: `Pagamento de ${cliente.nome} vence em ${diasParaVencimento} dia(s)`,
          priority: "medium",
          createdAt: today
        });
      }

      // Alerta de inadimplência
      if (diasAtraso > 0) {
        let priority: "low" | "medium" | "high" = "low";
        let type: "follow_up" | "urgente" = "follow_up";
        
        if (diasAtraso > 30) {
          priority = "high";
          type = "urgente";
        } else if (diasAtraso > 7) {
          priority = "medium";
        }

        newAlerts.push({
          id: `atraso-${cliente.id}`,
          type,
          cliente,
          message: `${cliente.nome} está com ${diasAtraso} dia(s) de atraso`,
          priority,
          createdAt: today
        });
      }

      // Simular alertas de promessa não cumprida
      if (cliente.indicator === "M1" || cliente.indicator === "M2") {
        newAlerts.push({
          id: `promessa-${cliente.id}`,
          type: "promessa",
          cliente,
          message: `${cliente.nome} não cumpriu promessa de pagamento`,
          priority: "high",
          createdAt: today
        });
      }
    });

    // Filtrar alertas já dispensados
    const filteredAlerts = newAlerts.filter(alert => !dismissedAlerts.includes(alert.id));
    setAlerts(filteredAlerts);
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30";
      case "medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30";
      case "low": return "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "vencimento": return Calendar;
      case "promessa": return MessageSquare;
      case "follow_up": return Phone;
      case "urgente": return AlertTriangle;
      default: return Bell;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "vencimento": return "Vencimento";
      case "promessa": return "Promessa";
      case "follow_up": return "Follow-up";
      case "urgente": return "Urgente";
      default: return "Alerta";
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-500/20 bg-orange-500/5 dark:border-orange-500/30 dark:bg-orange-500/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
          <Bell className="h-5 w-5" />
          Alertas e Notificações
          <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const Icon = getTypeIcon(alert.type);
          return (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${getPriorityColor(alert.priority)} flex items-start justify-between`}
            >
              <div className="flex items-start gap-3">
                <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(alert.type)}
                    </Badge>
                    {alert.priority === "high" && (
                      <Badge variant="destructive" className="text-xs">
                        Urgente
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    Conta: {alert.cliente.conta}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
