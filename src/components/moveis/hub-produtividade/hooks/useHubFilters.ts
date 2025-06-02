import { useState, useMemo, useCallback } from 'react';
import { 
  HubFilters, 
  RotinaWithStatus, 
  Orientacao, 
  Tarefa,
  ActivityItem,
  StatusFilter,
  PeriodicidadeFilter
} from '../types';
import { useDebounce } from '@/hooks/use-debounce';

interface UseHubFiltersProps {
  rotinas: RotinaWithStatus[];
  orientacoes: Orientacao[];
  tarefas: Tarefa[];
  activities: ActivityItem[];
}

export function useHubFilters({
  rotinas,
  orientacoes,
  tarefas,
  activities
}: UseHubFiltersProps) {
  const [filters, setFilters] = useState<HubFilters>({
    searchTerm: '',
    dateRange: {
      start: null,
      end: null
    },
    status: 'todos',
    type: 'todos',
    categoria: 'todos',
    usuario: 'todos'
  });

  // Debounce na busca para melhor performance
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  // ===== ROTINAS FILTRADAS COM DEBOUNCE =====
  const filteredRotinas = useMemo(() => {
    return rotinas.filter(rotina => {
      // Filtro por termo de busca (com debounce)
      if (debouncedSearchTerm && !rotina.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) && 
          !rotina.descricao?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
        return false;
      }

      // Filtro por status
      if (filters.status !== 'todos' && rotina.status !== filters.status) {
        return false;
      }

      // Filtro por categoria
      if (filters.categoria !== 'todos' && rotina.categoria !== filters.categoria) {
        return false;
      }

      // Filtro por usuário
      if (filters.usuario !== 'todos' && rotina.created_by !== filters.usuario) {
        return false;
      }

      // Filtro por data
      if (filters.dateRange.start && filters.dateRange.end) {
        const rotinaDate = new Date(rotina.created_at);
        if (rotinaDate < filters.dateRange.start || rotinaDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }, [rotinas, debouncedSearchTerm, filters.status, filters.categoria, filters.usuario, filters.dateRange]);

  // ===== ORIENTAÇÕES FILTRADAS COM DEBOUNCE =====
  const filteredOrientacoes = useMemo(() => {
    return orientacoes.filter(orientacao => {
      // Filtro por termo de busca (com debounce)
      if (debouncedSearchTerm && !orientacao.titulo.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) && 
          !orientacao.descricao.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
        return false;
      }

      // Filtro por tipo (usando o campo tipo da orientação)
      if (filters.type !== 'todos' && filters.type !== 'orientacao') {
        return false;
      }

      // Filtro por usuário
      if (filters.usuario !== 'todos' && orientacao.criado_por !== filters.usuario) {
        return false;
      }

      // Filtro por data
      if (filters.dateRange.start && filters.dateRange.end) {
        const orientacaoDate = new Date(orientacao.data_criacao);
        if (orientacaoDate < filters.dateRange.start || orientacaoDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }, [orientacoes, debouncedSearchTerm, filters.type, filters.usuario, filters.dateRange]);

  // ===== TAREFAS FILTRADAS COM DEBOUNCE =====
  const filteredTarefas = useMemo(() => {
    return tarefas.filter(tarefa => {
      // Filtro por termo de busca (com debounce)
      if (debouncedSearchTerm && !tarefa.titulo.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) && 
          !tarefa.descricao.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
        return false;
      }

      // Filtro por status
      if (filters.status !== 'todos') {
        const hoje = new Date();
        const dataEntrega = new Date(tarefa.data_entrega);
        const tarefaStatus = tarefa.status === 'concluida' ? 'concluida' :
                           dataEntrega < hoje ? 'atrasada' : 'pendente';
        
        if (tarefaStatus !== filters.status) {
          return false;
        }
      }

      // Filtro por tipo
      if (filters.type !== 'todos' && filters.type !== 'tarefa') {
        return false;
      }

      // Filtro por usuário
      if (filters.usuario !== 'todos' && tarefa.criado_por !== filters.usuario) {
        return false;
      }

      // Filtro por data
      if (filters.dateRange.start && filters.dateRange.end) {
        const tarefaDate = new Date(tarefa.data_criacao);
        if (tarefaDate < filters.dateRange.start || tarefaDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }, [tarefas, debouncedSearchTerm, filters.status, filters.type, filters.usuario, filters.dateRange]);

  // ===== ATIVIDADES FILTRADAS COM DEBOUNCE =====
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Filtro por termo de busca (com debounce)
      if (debouncedSearchTerm && !activity.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) && 
          !activity.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
        return false;
      }

      // Filtro por tipo
      if (filters.type !== 'todos' && activity.type !== filters.type) {
        return false;
      }

      // Filtro por status
      if (filters.status !== 'todos' && activity.status !== filters.status) {
        return false;
      }

      // Filtro por usuário
      if (filters.usuario !== 'todos' && activity.user !== filters.usuario) {
        return false;
      }

      // Filtro por data
      if (filters.dateRange.start && filters.dateRange.end) {
        const activityDate = new Date(activity.timestamp);
        if (activityDate < filters.dateRange.start || activityDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }, [activities, debouncedSearchTerm, filters.type, filters.status, filters.usuario, filters.dateRange]);

  // ===== ESTATÍSTICAS DOS FILTROS (OTIMIZADA) =====
  const filterStats = useMemo(() => {
    const totalItems = filteredRotinas.length + filteredOrientacoes.length + filteredTarefas.length;
    
    return {
      total: totalItems,
      rotinas: filteredRotinas.length,
      orientacoes: filteredOrientacoes.length,
      tarefas: filteredTarefas.length,
      activities: filteredActivities.length,
      hasActiveFilters: filters.searchTerm !== '' || 
                       filters.status !== 'todos' || 
                       filters.type !== 'todos' || 
                       filters.categoria !== 'todos' || 
                       filters.usuario !== 'todos' ||
                       filters.dateRange.start !== null ||
                       filters.dateRange.end !== null
    };
  }, [filteredRotinas, filteredOrientacoes, filteredTarefas, filteredActivities, filters]);

  // ===== OPÇÕES PARA FILTROS (MEMOIZADAS) =====
  const filterOptions = useMemo(() => {
    // Categorias únicas das rotinas
    const categorias = [...new Set(rotinas.map(r => r.categoria))].sort();
    
    // Usuários únicos
    const usuarios = [
      ...new Set([
        ...rotinas.map(r => r.created_by),
        ...orientacoes.map(o => o.criado_por),
        ...tarefas.map(t => t.criado_por)
      ])
    ].sort();

    return {
      categorias: ['todos', ...categorias],
      usuarios: ['todos', ...usuarios],
      status: ['todos', 'pendente', 'concluida', 'atrasada'] as const,
      types: ['todos', 'rotina', 'orientacao', 'tarefa'] as const
    };
  }, [rotinas, orientacoes, tarefas]);

  // ===== FUNÇÕES DE CONTROLE OTIMIZADAS =====
  const updateFilter = useCallback((key: keyof HubFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<HubFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      dateRange: {
        start: null,
        end: null
      },
      status: 'todos',
      type: 'todos',
      categoria: 'todos',
      usuario: 'todos'
    });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    updateFilter('searchTerm', term);
  }, [updateFilter]);

  const setStatusFilter = (status: StatusFilter) => {
    updateFilter('status', status);
  };

  const setTypeFilter = (type: 'todos' | 'rotina' | 'orientacao' | 'tarefa') => {
    updateFilter('type', type);
  };

  const setCategoriaFilter = (categoria: string) => {
    updateFilter('categoria', categoria);
  };

  const setUsuarioFilter = (usuario: string) => {
    updateFilter('usuario', usuario);
  };

  const setDateRangeFilter = (start: Date | null, end: Date | null) => {
    updateFilter('dateRange', { start, end });
  };

  return {
    // Estado atual dos filtros
    filters,
    
    // Dados filtrados
    filteredRotinas,
    filteredOrientacoes,
    filteredTarefas,
    filteredActivities,
    
    // Estatísticas
    filterStats,
    filterOptions,
    
    // Funções de controle
    updateFilter,
    updateFilters,
    clearFilters,
    setSearchTerm,
    setStatusFilter,
    setTypeFilter,
    setCategoriaFilter,
    setUsuarioFilter,
    setDateRangeFilter
  };
} 