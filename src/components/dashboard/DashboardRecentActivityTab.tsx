import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap } from "lucide-react";

// Nenhuma prop é necessária por enquanto, pois o conteúdo é mockado.
// interface DashboardRecentActivityTabProps {}

export function DashboardRecentActivityTab(/* props: DashboardRecentActivityTabProps */) {
  // Dados mockados como no original
  const recentActivities = [
    { id: 1, text: "Nova tarefa criada", time: "1 hora" },
    { id: 2, text: "Cliente adicionado ao crediário", time: "2 horas" },
    { id: 3, text: "Venda 'O' registrada", time: "3 horas" },
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{item.text}</p>
                <p className="text-xs text-muted-foreground">
                  Há {item.time}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                Novo {/* Ou poderia ser um status dinâmico */}
              </Badge>
            </div>
          ))}
          {recentActivities.length === 0 && (
             <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade recente.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 