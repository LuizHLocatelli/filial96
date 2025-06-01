import { 
  Sofa, 
  FileText, 
  FolderOpen, 
  Target, 
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

export function MoveisOverview() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const stats = [
    {
      title: "Orientações Ativas",
      value: "12",
      change: "+3",
      trend: "up",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Arquivos no Diretório",
      value: "48",
      change: "+5",
      trend: "up",
      icon: FolderOpen,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    {
      title: "Produtos em Foco",
      value: "3",
      change: "0",
      trend: "stable",
      icon: Target,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      title: "Vendas do Mês",
      value: "24",
      change: "+12",
      trend: "up",
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    }
  ];

  const quickActions = [
    {
      title: "Orientações",
      description: "Criar orientação ou tarefa",
      icon: FileText,
      path: "/moveis?tab=orientacoes",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Diretório",
      description: "Adicionar ao diretório",
      icon: FolderOpen,
      path: "/moveis?tab=diretorio",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    {
      title: "Produto Foco",
      description: "Gerenciar produtos",
      icon: Target,
      path: "/moveis?tab=produto-foco",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      title: "Folgas",
      description: "Calendário de folgas",
      icon: Calendar,
      path: "/moveis?tab=folgas",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      title: "Nova orientação VM criada",
      description: "Orientação sobre promoção de sofás",
      time: "2 horas atrás",
      type: "orientacao",
      user: "Maria Silva"
    },
    {
      id: 2,
      title: "Arquivo adicionado ao diretório",
      description: "Manual de produto XYZ.pdf",
      time: "4 horas atrás",
      type: "arquivo",
      user: "João Santos"
    },
    {
      id: 3,
      title: "Meta de produto foco atingida",
      description: "Sofá Reclinável Premium - 15 vendas",
      time: "1 dia atrás",
      type: "meta",
      user: "Sistema"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-primary/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className={`font-bold gradient-text ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Setor Móveis
            </h1>
            <p className="text-muted-foreground">
              Gerencie orientações, diretório e produtos em foco
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300">
              <Users className="h-3 w-3 mr-1" />
              12 Consultores
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title}
              className={`hover-lift transition-all duration-300 border-0 shadow-soft hover:shadow-medium ${stat.bgColor}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  {stat.trend === "up" && (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/20">
                      {stat.change}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                    {stat.value}
                  </div>
                  <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {stat.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions - Versão Horizontal Compacta */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Acesso Rápido</h2>
        <div className="w-full p-2 bg-background border rounded-lg">
          <ScrollArea className="w-full">
            <div className={`flex items-center gap-2 px-2 ${
              quickActions.length > 3 ? 'grid grid-cols-2 sm:flex sm:flex-wrap' : 'flex flex-wrap'
            }`}>
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <TooltipProvider key={action.title} delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 sm:h-8 px-2 sm:px-3 flex items-center gap-2 text-xs font-medium justify-center sm:justify-start"
                          onClick={() => navigate(action.path)}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-xs leading-tight">{action.title}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{action.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Atividade Recente</h2>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentActivity.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="p-4 hover:bg-muted/50 transition-colors duration-200"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {activity.type === 'orientacao' && <FileText className="h-4 w-4 text-primary" />}
                      {activity.type === 'arquivo' && <FolderOpen className="h-4 w-4 text-primary" />}
                      {activity.type === 'meta' && <Target className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.time}</span>
                        <span>•</span>
                        <span>{activity.user}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
