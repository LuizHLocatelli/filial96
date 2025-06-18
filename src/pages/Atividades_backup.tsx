import { useSearchParams } from "react-router-dom";
import { Activity, Download, RefreshCw } from "lucide-react";

import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { NotificationsDebug } from "@/components/notifications/NotificationsDebug";

// Componentes modularizados
import { useActivities } from "./Atividades/hooks/useActivities";
import { ActivityStats } from "./Atividades/components/ActivityStats";
import { ActivityFilters } from "./Atividades/components/ActivityFilters";
import { ActivityTimeline } from "./Atividades/components/ActivityTimeline";

export default function Atividades() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "timeline";
  
  const {
    activities,
    filteredActivities,
    isLoading,
    filters,
    stats,
    fetchActivities,
    handleActivityClick,
    exportActivities,
    updateFilter
  } = useActivities();

  // Buscar atividades do banco de dados
  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Buscando atividades do banco de dados...");

      // Buscar atividades da tabela activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("activities")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (activitiesError) {
        console.warn("⚠️ Erro ao buscar tabela activities, tentando alternativas:", activitiesError);
      }

      // Se não encontrar dados na tabela activities, criar dados simulados baseados nas notificações
      let allActivities: ActivityItem[] = [];

      if (activitiesData && activitiesData.length > 0) {
        console.log(`✅ ${activitiesData.length} atividades encontradas na tabela activities`);
        
        // Converter dados reais
        allActivities = activitiesData.map((activity: DatabaseActivity) => {
          let status: ActivityItem['status'] = 'nova';
          if (activity.action === 'concluiu' || activity.action === 'finalizou') {
            status = 'concluida';
          } else if (activity.action === 'atualizou') {
            status = 'pendente';
          }

          let type: ActivityItem['type'] = 'tarefa';
          if (activity.task_type === 'rotina') type = 'rotina';
          if (activity.task_type === 'orientacao') type = 'orientacao';

          let mappedAction: ActivityItem['action'] = 'criada';
          if (activity.action === 'criou') mappedAction = 'criada';
          if (activity.action === 'concluiu' || activity.action === 'finalizou') mappedAction = 'concluida';
          if (activity.action === 'atualizou') mappedAction = 'atualizada';
          if (activity.action === 'removeu' || activity.action === 'deletou') mappedAction = 'deletada';

          return {
            id: activity.id,
            type,
            title: activity.task_title,
            description: `${activity.user_name} ${activity.action} uma ${type}`,
            timestamp: activity.timestamp,
            status,
            user: activity.user_name,
            action: mappedAction
          };
        });
      } else {
        console.log("📝 Criando dados de demonstração para atividades...");
        
        // Criar dados de demonstração realistas
        const sampleActivities: ActivityItem[] = [
          {
            id: "demo-1",
            type: "rotina",
            title: "Abertura da Loja",
            description: "Rotina de abertura da loja realizada com sucesso",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min atrás
            status: "concluida",
            user: profile?.email || "Usuário Atual",
            action: "concluida"
          },
          {
            id: "demo-2",
            type: "orientacao",
            title: "VM - Novos Produtos de Inverno",
            description: "Nova orientação sobre produtos de inverno publicada",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h atrás
            status: "nova",
            user: "Sistema",
            action: "criada"
          },
          {
            id: "demo-3",
            type: "tarefa",
            title: "Organização do Estoque",
            description: "Tarefa de organização do estoque em andamento",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4h atrás
            status: "pendente",
            user: profile?.email || "Usuário Atual",
            action: "criada"
          },
          {
            id: "demo-4",
            type: "rotina",
            title: "Limpeza da Vitrine",
            description: "Rotina de limpeza da vitrine concluída",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6h atrás
            status: "concluida",
            user: "João Silva",
            action: "concluida"
          },
          {
            id: "demo-5",
            type: "orientacao",
            title: "Procedimento de Atendimento ao Cliente",
            description: "Atualização nos procedimentos de atendimento",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8h atrás
            status: "pendente",
            user: "Maria Santos",
            action: "atualizada"
          },
          {
            id: "demo-6",
            type: "tarefa",
            title: "Conferência de Caixa",
            description: "Conferência diária do caixa realizada",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
            status: "concluida",
            user: "Ana Costa",
            action: "concluida"
          }
        ];

        allActivities = sampleActivities;
      }

      setActivities(allActivities);
      console.log(`🎯 Total de ${allActivities.length} atividades carregadas`);
      
    } catch (error) {
      console.error("❌ Erro ao carregar atividades:", error);
      toast({
        title: "Erro ao carregar atividades",
        description: "Não foi possível carregar as atividades. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar atividades
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Filtro de busca
      if (searchTerm && !activity.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !activity.user.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !activity.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtro de tipo
      if (typeFilter !== "all" && activity.type !== typeFilter) {
        return false;
      }

      // Filtro de ação
      if (actionFilter !== "all" && activity.action !== actionFilter) {
        return false;
      }

      // Filtro de usuário
      if (userFilter !== "all" && activity.user !== userFilter) {
        return false;
      }

      // Filtro de data
      if (dateRange !== "all") {
        const activityDate = new Date(activity.timestamp);
        const now = new Date();
        
        switch (dateRange) {
          case "today":
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (activityDate < today || activityDate >= tomorrow) return false;
            break;
          case "week":
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            if (activityDate < weekAgo) return false;
            break;
          case "month":
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            if (activityDate < monthAgo) return false;
            break;
        }
      }

      return true;
    });
  }, [activities, searchTerm, typeFilter, actionFilter, userFilter, dateRange]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = filteredActivities.length;
    const completed = filteredActivities.filter(a => a.status === 'concluida').length;
    const pending = filteredActivities.filter(a => a.status === 'pendente').length;
    const recent = filteredActivities.filter(a => {
      const now = new Date();
      const activityDate = new Date(a.timestamp);
      const diffHours = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60);
      return diffHours <= 24;
    }).length;

    return { total, completed, pending, recent };
  }, [filteredActivities]);

  // Usuários únicos para filtro
  const uniqueUsers = useMemo(() => {
    const users = Array.from(new Set(activities.map(a => a.user)));
    return users.sort();
  }, [activities]);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleActivityClick = (activity: ActivityItem) => {
    // Navegar para a seção específica baseada no tipo da atividade
    switch (activity.type) {
      case 'rotina':
        navigate('/?tab=rotinas');
        break;
      case 'orientacao':
        navigate('/?tab=orientacoes');
        break;
      case 'tarefa':
        navigate('/');
        break;
      default:
        navigate('/');
    }
    
    toast({
      title: "Navegando para " + activity.type,
      description: `Redirecionando para a seção de ${activity.type}s.`
    });
  };

  const exportActivities = () => {
    const csvContent = [
      "Título,Tipo,Usuário,Ação,Status,Data/Hora,Descrição",
      ...filteredActivities.map(a => 
        `"${a.title}","${a.type}","${a.user}","${a.action}","${a.status}","${new Date(a.timestamp).toLocaleString('pt-BR')}","${a.description || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `atividades_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportação concluída",
      description: `${filteredActivities.length} atividades exportadas com sucesso.`
    });
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <PageLayout spacing="normal" maxWidth="full">
      <PageHeader
        title="Todas as Atividades"
        description="Visualize e gerencie todas as atividades do sistema"
        icon={Activity}
        iconColor="text-primary"
        variant="default"
        breadcrumbs={[
          { label: "Hub de Produtividade", href: "/" },
          { label: "Atividades" }
        ]}
        actions={
          <div className="flex gap-2">
            <Button onClick={exportActivities} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={fetchActivities} disabled={isLoading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        }
      />

      {/* Estatísticas rápidas */}
      <div className="grid-responsive-stats gap-base mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.recent}</p>
                <p className="text-xs text-muted-foreground">Nas últimas 24h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Linha do Tempo de Atividades</CardTitle>
              <CardDescription>
                Visualize todas as atividades recentes em um único lugar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filtros */}
              <div className="grid-responsive-files gap-base p-4 border rounded-lg">
                <Input
                  placeholder="Buscar por título, usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="col-span-2"
                />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="rotina">Rotina</SelectItem>
                    <SelectItem value="tarefa">Tarefa</SelectItem>
                    <SelectItem value="orientacao">Orientação</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Ações</SelectItem>
                    <SelectItem value="criada">Criada</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="atualizada">Atualizada</SelectItem>
                    <SelectItem value="deletada">Deletada</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Data" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualquer Data</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="yesterday">Ontem</SelectItem>
                    <SelectItem value="this_week">Esta Semana</SelectItem>
                    <SelectItem value="last_7_days">Últimos 7 dias</SelectItem>
                    <SelectItem value="this_month">Este Mês</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Usuários</SelectItem>
                    {/* Unique users could be populated dynamically */}
                    {[...new Set(activities.map(a => a.user))].map(user => (
                      <SelectItem key={user} value={user}>{user}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Timeline */}
              <div className="border rounded-lg overflow-hidden">
                {isLoading && (
                  <div className="text-center text-muted-foreground p-8">
                    <p>Carregando atividades...</p>
                  </div>
                )}
                {!isLoading && filteredActivities.length > 0 && (
                  <div className="p-4">
                    {/* Placeholder para a timeline */}
                    <div className="text-center text-muted-foreground p-8">
                      <p>A funcionalidade de Timeline foi removida.</p>
                      <p>Exibindo {filteredActivities.length} atividades filtradas.</p>
                    </div>
                  </div>
                )}
                {!isLoading && filteredActivities.length === 0 && (
                  <div className="text-center text-muted-foreground p-8">
                    <p>Nenhuma atividade encontrada com os filtros atuais.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug">
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico do Sistema</CardTitle>
              <CardDescription>
                Ferramenta para diagnosticar problemas com notificações e atividades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationsDebug />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
