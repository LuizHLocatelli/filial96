import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { ActivityItem, DatabaseActivity, ActivityStats, ActivityFilters } from "../types";

export function useActivities() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ActivityFilters>({
    searchTerm: "",
    typeFilter: "all",
    actionFilter: "all",
    dateRange: "all",
    userFilter: "all"
  });

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("activities")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      let allActivities: ActivityItem[] = [];

      if (activitiesData && activitiesData.length > 0) {
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
        // Dados de demonstração
        const sampleActivities: ActivityItem[] = [
          {
            id: "demo-1",
            type: "rotina",
            title: "Abertura da Loja",
            description: "Rotina de abertura da loja realizada com sucesso",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            status: "concluida",
            user: profile?.email || "Usuário Atual",
            action: "concluida"
          },
          {
            id: "demo-2", 
            type: "orientacao",
            title: "VM - Novos Produtos",
            description: "Nova orientação publicada",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            status: "nova",
            user: "Sistema",
            action: "criada"
          },
          {
            id: "demo-3",
            type: "tarefa",
            title: "Organização do Estoque",
            description: "Tarefa em andamento",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            status: "pendente",
            user: profile?.email || "Usuário Atual",
            action: "criada"
          }
        ];
        allActivities = sampleActivities;
      }

      setActivities(allActivities);
    } catch (error) {
      toast({
        title: "Erro ao carregar atividades",
        description: "Não foi possível carregar as atividades.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = filters.searchTerm === "" ||
        activity.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        activity.user.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesType = filters.typeFilter === "all" || activity.type === filters.typeFilter;
      const matchesAction = filters.actionFilter === "all" || activity.action === filters.actionFilter;
      const matchesUser = filters.userFilter === "all" || activity.user === filters.userFilter;

      let matchesDate = true;
      const activityDate = new Date(activity.timestamp);
      const now = new Date();

      switch (filters.dateRange) {
        case "today":
          matchesDate = activityDate.toDateString() === now.toDateString();
          break;
        case "last_7_days":
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          matchesDate = activityDate >= sevenDaysAgo;
          break;
      }

      return matchesSearch && matchesType && matchesAction && matchesUser && matchesDate;
    });
  }, [activities, filters]);

  const stats: ActivityStats = useMemo(() => {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return {
      total: activities.length,
      completed: activities.filter(a => a.status === 'concluida').length,
      pending: activities.filter(a => a.status === 'pendente').length,
      recent: activities.filter(a => new Date(a.timestamp) >= last24Hours).length
    };
  }, [activities]);

  const handleActivityClick = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'rotina':
        navigate('/moveis/rotinas');
        break;
      case 'orientacao':
        navigate('/moveis/orientacoes');
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
      description: `${filteredActivities.length} atividades exportadas.`
    });
  };

  const updateFilter = (key: keyof ActivityFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return {
    activities,
    filteredActivities,
    isLoading,
    filters,
    stats,
    fetchActivities,
    handleActivityClick,
    exportActivities,
    updateFilter
  };
} 