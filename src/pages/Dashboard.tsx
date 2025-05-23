
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp, 
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface StatsData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalClients: number;
  totalDeposits: number;
  totalSales: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalClients: 0,
    totalDeposits: 0,
    totalSales: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [tasksData, clientsData, depositsData, salesData] = await Promise.all([
        supabase.from("moveis_tarefas").select("status"),
        supabase.from("crediario_clientes").select("id"),
        supabase.from("crediario_depositos").select("id"),
        supabase.from("venda_o_sales").select("id")
      ]);

      const totalTasks = tasksData.data?.length || 0;
      const completedTasks = tasksData.data?.filter(t => t.status === "concluida").length || 0;
      const pendingTasks = tasksData.data?.filter(t => t.status === "pendente").length || 0;

      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        totalClients: clientsData.data?.length || 0,
        totalDeposits: depositsData.data?.length || 0,
        totalSales: salesData.data?.length || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Nova Tarefa",
      description: "Criar nova tarefa de móveis",
      icon: CheckCircle2,
      action: () => navigate("/moveis?tab=orientacoes"),
      color: "bg-green-500"
    },
    {
      title: "Clientes",
      description: "Gerenciar clientes do crediário",
      icon: Users,
      action: () => navigate("/crediario?tab=clientes"),
      color: "bg-blue-500"
    },
    {
      title: "Depósitos",
      description: "Controlar depósitos",
      icon: Calendar,
      action: () => navigate("/crediario?tab=depositos"),
      color: "bg-purple-500"
    },
    {
      title: "Cards",
      description: "Cards promocionais",
      icon: BarChart3,
      action: () => navigate("/cards-promocionais"),
      color: "bg-orange-500"
    }
  ];

  const StatCard = ({ title, value, icon: Icon, description, variant = "default" }: {
    title: string;
    value: number;
    icon: any;
    description: string;
    variant?: "default" | "success" | "warning" | "danger";
  }) => {
    const variantStyles = {
      default: "border-border text-foreground",
      success: "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800",
      warning: "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800",
      danger: "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800"
    };

    return (
      <Card className={`transition-all duration-200 hover:shadow-md ${variantStyles[variant]}`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl sm:text-3xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  value
                )}
              </p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <div className="shrink-0">
              <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Visão geral das atividades da Filial 96
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Tarefas"
          value={stats.totalTasks}
          icon={Activity}
          description="Tarefas no sistema"
        />
        <StatCard
          title="Tarefas Concluídas"
          value={stats.completedTasks}
          icon={CheckCircle2}
          description="Finalizadas com sucesso"
          variant="success"
        />
        <StatCard
          title="Tarefas Pendentes"
          value={stats.pendingTasks}
          icon={Clock}
          description="Aguardando conclusão"
          variant="warning"
        />
        <StatCard
          title="Clientes Ativos"
          value={stats.totalClients}
          icon={Users}
          description="Clientes cadastrados"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="actions">Ações Rápidas</TabsTrigger>
          <TabsTrigger value="recent" className="hidden sm:flex">Recente</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Taxa de Conclusão</span>
                    <Badge variant="secondary">
                      {stats.totalTasks > 0 
                        ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
                        : 0}%
                    </Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500" 
                      style={{ 
                        width: stats.totalTasks > 0 
                          ? `${(stats.completedTasks / stats.totalTasks) * 100}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                    <p className="text-xs text-muted-foreground">Concluídas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Status do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Crediário</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Ativo
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Móveis</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Ativo
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cards Promocionais</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Ativo
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Última atualização: {new Date().toLocaleString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
                onClick={action.action}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm sm:text-base">{action.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-between p-0 h-auto font-medium"
                    >
                      Acessar
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Nova tarefa criada</p>
                      <p className="text-xs text-muted-foreground">
                        Há {item} hora{item > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
