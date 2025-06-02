import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Calendar, TrendingUp, ArrowRight, CheckCircle2, Clock, AlertCircle, Activity, Target, Zap, LayoutDashboard, Sofa, CreditCard, FileText, Download, Settings } from "lucide-react";
import { useNavigate, NavigateFunction } from "react-router-dom";
import { StatCard } from "@/components/dashboard/StatCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { DashboardOverviewTab } from "@/components/dashboard/DashboardOverviewTab";
import { DashboardActionsTab } from "@/components/dashboard/DashboardActionsTab";
import { DashboardRecentActivityTab } from "@/components/dashboard/DashboardRecentActivityTab";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";
import { Progress } from "@/components/ui/progress";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  gradient: string;
}

const getQuickActions = (navigate: NavigateFunction): QuickAction[] => [
  {
    title: "Hub Produtividade",
    description: "Acessar rotinas, orientações e tarefas",
    icon: CheckCircle2,
    action: () => navigate("/moveis?tab=hub-produtividade"),
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

const stats = [
  {
    title: "Usuários Ativos",
    value: "2,847",
    change: "+12%",
    icon: Users,
    color: "text-blue-600"
  },
  {
    title: "Vendas Móveis",
    value: "R$ 45.231",
    change: "+8%",
    icon: Sofa,
    color: "text-green-600"
  },
  {
    title: "Crediário",
    value: "R$ 23.456",
    change: "+15%",
    icon: CreditCard,
    color: "text-purple-600"
  },
  {
    title: "Tarefas Concluídas",
    value: "87%",
    change: "+3%",
    icon: Activity,
    color: "text-orange-600"
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { stats: dashboardStats, isLoading, error, refreshStats } = useDashboardStats();
  const [activeTab, setActiveTab] = useState("overview");

  const quickActions = getQuickActions(navigate);

  const navigationTabs = [
    {
      value: "overview",
      label: "Visão Geral",
      mobileLabel: "Visão",
      icon: Activity,
      component: <DashboardOverviewTab stats={dashboardStats} isLoading={isLoading} />
    },
    {
      value: "actions",
      label: "Ações Rápidas",
      mobileLabel: "Ações",
      icon: Zap,
      component: <DashboardActionsTab actions={quickActions} isMobile={isMobile} />
    },
    {
      value: "recent",
      label: "Recente",
      icon: Clock,
      component: <DashboardRecentActivityTab />
    }
  ];

  if (error) {
    return (
      <PageLayout spacing="normal" maxWidth="lg">
        <div className="flex flex-col items-center justify-center h-screen text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Erro ao Carregar Dados</h2>
          <p className="text-muted-foreground mb-4">Não foi possível carregar as estatísticas do dashboard.</p>
          <p className="text-sm text-muted-foreground mb-6">Detalhes: {error}</p>
          <Button onClick={refreshStats} disabled={isLoading}>
            {isLoading ? "Tentando novamente..." : "Tentar Novamente"}
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout spacing="normal" maxWidth="full">
      <PageHeader
        title="Dashboard"
        description="Visão geral completa da Filial 96"
        icon={BarChart3}
        iconColor="text-primary"
        status={{
          label: "Online",
          color: "bg-green-50 text-green-700 border-green-200"
        }}
        variant="default"
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Dashboard" }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="default" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        }
      />

      {/* Grid de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> desde o mês passado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seção de módulos principais */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sofa className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Módulo Móveis</CardTitle>
                <CardDescription>
                  Gestão completa do setor de móveis
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Progresso mensal</span>
                <Badge variant="secondary">78%</Badge>
              </div>
              <Progress value={78} className="h-2" />
              <div className="flex justify-between text-sm">
                <span>Vendas: R$ 45.231</span>
                <span className="text-green-600">+8%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Módulo Crediário</CardTitle>
                <CardDescription>
                  Sistema completo de gestão do crediário
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Progresso mensal</span>
                <Badge variant="secondary">92%</Badge>
              </div>
              <Progress value={92} className="h-2" />
              <div className="flex justify-between text-sm">
                <span>Vendas: R$ 23.456</span>
                <span className="text-green-600">+15%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atividades recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Atividades Recentes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "Nova venda registrada",
                details: "Produto: Sofá 3 lugares - R$ 1.299,00",
                time: "2 min atrás",
                type: "sale"
              },
              {
                action: "Depósito confirmado",
                details: "Cliente: João Silva - R$ 250,00",
                time: "15 min atrás",
                type: "deposit"
              },
              {
                action: "Relatório gerado",
                details: "Vendas do dia - 23 itens",
                time: "1 hora atrás",
                type: "report"
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'sale' ? 'bg-green-500' :
                  activity.type === 'deposit' ? 'bg-blue-500' : 'bg-orange-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-muted-foreground text-xs">{activity.details}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}