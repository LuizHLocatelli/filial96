import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Calendar, TrendingUp, ArrowRight, CheckCircle2, Clock, AlertCircle, Activity, Target, Zap, LayoutDashboard } from "lucide-react";
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

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  gradient: string;
}

const getQuickActions = (navigate: NavigateFunction): QuickAction[] => [
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

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { stats, isLoading, error, refreshStats } = useDashboardStats();
  const [activeTab, setActiveTab] = useState("overview");

  const quickActions = getQuickActions(navigate);

  const navigationTabs = [
    {
      value: "overview",
      label: "Visão Geral",
      mobileLabel: "Visão",
      icon: Activity,
      component: <DashboardOverviewTab stats={stats} isLoading={isLoading} />
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
    <PageLayout spacing="normal" maxWidth="xl">
      <PageHeader
        title="Painel"
        description="Visão geral do sistema"
        icon={LayoutDashboard}
        iconColor="text-primary"
        variant="default"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total de Tarefas" value={stats.totalTasks} icon={Activity} description="Tarefas no sistema" isLoading={isLoading} />
        <StatCard title="Tarefas Concluídas" value={stats.completedTasks} icon={CheckCircle2} description="Finalizadas com sucesso" variant="success" trend={{
        value: 12,
        isPositive: true
      }} isLoading={isLoading} />
        <StatCard title="Tarefas Pendentes" value={stats.pendingTasks} icon={Clock} description="Aguardando conclusão" variant="warning" trend={{
        value: 5,
        isPositive: false
      }} isLoading={isLoading} />
        <StatCard title="Clientes Ativos" value={stats.totalClients} icon={Users} description="Clientes cadastrados" trend={{
        value: 8,
        isPositive: true
      }} isLoading={isLoading} />
      </div>

      {/* Main Content Tabs */}
      <PageNavigation
        tabs={navigationTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="tabs"
      />
    </PageLayout>
  );
}