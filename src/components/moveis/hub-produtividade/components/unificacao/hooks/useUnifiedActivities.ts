
import { useMemo } from 'react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UnifiedActivity {
  id: string;
  type: 'rotina' | 'tarefa';
  title: string;
  description?: string;
  status: 'concluida' | 'pendente' | 'atrasada';
  timestamp: string;
  user: string;
  category?: string;
  priority?: string;
  dueDate?: string;
  periodicidade?: string;
  connections?: string[];
}

interface UseUnifiedActivitiesProps {
  rotinas: any[];
  tarefas: any[];
  getCachedUserName: (userId: string) => string;
  filterType: 'all' | 'rotina' | 'tarefa';
  filterStatus: 'all' | 'concluida' | 'pendente' | 'atrasada';
}

export function useUnifiedActivities({
  rotinas,
  tarefas,
  getCachedUserName,
  filterType,
  filterStatus
}: UseUnifiedActivitiesProps) {
  // Unificar rotinas e tarefas em uma única lista
  const unifiedActivities: UnifiedActivity[] = useMemo(() => {
    const rotinaActivities: UnifiedActivity[] = rotinas.map(rotina => ({
      id: rotina.id,
      type: 'rotina' as const,
      title: rotina.nome,
      description: rotina.descricao,
      status: rotina.status,
      timestamp: rotina.created_at,
      user: getCachedUserName(rotina.created_by),
      category: rotina.categoria,
      periodicidade: rotina.periodicidade,
      connections: []
    }));

    const tarefaActivities: UnifiedActivity[] = tarefas.map(tarefa => ({
      id: tarefa.id,
      type: 'tarefa' as const,
      title: tarefa.titulo,
      description: tarefa.descricao,
      status: tarefa.status,
      timestamp: tarefa.data_criacao,
      user: getCachedUserName(tarefa.criado_por),
      priority: tarefa.prioridade,
      dueDate: tarefa.data_entrega,
      connections: tarefa.rotina_id ? [tarefa.rotina_id] : []
    }));

    return [...rotinaActivities, ...tarefaActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [rotinas, tarefas, getCachedUserName]);

  // Filtrar atividades
  const filteredActivities = useMemo(() => {
    return unifiedActivities.filter(activity => {
      if (filterType !== 'all' && activity.type !== filterType) return false;
      if (filterStatus !== 'all' && activity.status !== filterStatus) return false;
      return true;
    });
  }, [unifiedActivities, filterType, filterStatus]);

  // Agrupar por data
  const groupedActivities = useMemo(() => {
    const groups: { [key: string]: UnifiedActivity[] } = {};
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.timestamp);
      let dateKey: string;
      
      if (isToday(date)) {
        dateKey = 'Hoje';
      } else if (isYesterday(date)) {
        dateKey = 'Ontem';
      } else if (isTomorrow(date)) {
        dateKey = 'Amanhã';
      } else {
        dateKey = format(date, 'EEEE, dd/MM/yyyy', { locale: ptBR });
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });
    
    return groups;
  }, [filteredActivities]);

  return {
    unifiedActivities,
    filteredActivities,
    groupedActivities
  };
}
