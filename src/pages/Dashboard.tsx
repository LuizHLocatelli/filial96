
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
  Activity,
  Target,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/dashboard/StatCard";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
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
      gradient: "from-green-500 to-emerald-600"
    },
    {
      title: "Clientes",
      description: "Gerenciar clientes do crediário",
      icon: Users,
      action: () => navigate("/crediario?tab=clientes"),
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      title: "Depósitos",
      description: "Controlar depósitos",
      icon: Calendar,
      action: () => navigate("/crediario?tab=depositos"),
      gradient: "from-purple-500 to-violet-600"
    },
    {
      title: "Cards",
      description: "Cards promocionais",
      icon: BarChart3,
      action: () => navigate("/cards-promocionais"),
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className={`font-bold tracking-tight gradient-text ${
          isMobile ? 'text-2xl' : 'text-3xl'
        }`}>
          Dashboard
        </h1>
        <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
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
          isLoading={isLoading}
        />
        <StatCard
          title="Tarefas Concluídas"
          value={stats.completedTasks}
          icon={CheckCircle2}
          description="Finalizadas com sucesso"
          variant="success"
          trend={{ value: 12, isPositive: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Tarefas Pendentes"
          value={stats.pendingTasks}
          icon={Clock}
          description="Aguardando conclusão"
          variant="warning"
          trend={{ value: 5, isPositive: false }}
          isLoading={isLoading}
        />
        <StatCard
          title="Clientes Ativos"
          value={stats.totalClients}
          icon={Users}
          description="Clientes cadastrados"
          trend={{ value: 8, isPositive: true }}
          isLoading={isLoading}
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
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Taxa de Conclusão</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {stats.totalTasks > 0 
                        ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
                        : 0}%
                    </Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-700 ease-out" 
                      style={{ 
                        width: stats.totalTasks > 0 
                          ? `${(stats.completedTasks / stats.totalTasks) * 100}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                    <p className="text-xs text-green-600/80">Concluídas</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</p>
                    <p className="text-xs text-yellow-600/80">Pendentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  Status do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { name: "Crediário", status: "Ativo" },
                    { name: "Móveis", status: "Ativo" },
                    { name: "Cards Promocionais", status: "Ativo" }
                  ].map((system) => (
                    <div key={system.name} className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-950/10 border border-green-200 dark:border-green-800">
                      <span className="text-sm font-medium">{system.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {system.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
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
                className="cursor-pointer transition-all duration-300 hover:shadow-strong hover:-translate-y-2 group"
                onClick={action.action}
              >
                <CardContent className={isMobile ? "p-4" : "p-6"}>
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                        {action.title}
                      </h3>
                      <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {action.description}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-between p-0 h-auto font-medium group-hover:text-primary"
                    >
                      Acessar
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Nova tarefa criada</p>
                      <p className="text-xs text-muted-foreground">
                        Há {item} hora{item > 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Novo
                    </Badge>
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
