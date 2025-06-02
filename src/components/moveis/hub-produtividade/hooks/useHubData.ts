import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { 
  ProductivityStats, 
  ActivityItem, 
  RotinaWithStatus, 
  Orientacao, 
  Tarefa,
  RotinaConclusao
} from '../types';

// Interface para usuários
interface User {
  id: string;
  name: string;
}

export function useHubData() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Ref para controlar se é a primeira carga
  const isInitialLoadRef = useRef(true);
  const lastRefreshRef = useRef<number>(0);
  
  const [stats, setStats] = useState<ProductivityStats>({
    rotinas: {
      total: 0,
      concluidas: 0,
      pendentes: 0,
      atrasadas: 0,
      percentualConclusao: 0
    },
    orientacoes: {
      total: 0,
      naoLidas: 0,
      recentes: 0
    },
    tarefas: {
      total: 0,
      concluidas: 0,
      pendentes: 0,
      atrasadas: 0,
      percentualConclusao: 0
    }
  });
  
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [rotinas, setRotinas] = useState<RotinaWithStatus[]>([]);
  const [orientacoes, setOrientacoes] = useState<Orientacao[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isLoadingRotinas, setIsLoadingRotinas] = useState(true);
  const [isLoadingOrientacoes, setIsLoadingOrientacoes] = useState(true);
  const [isLoadingTarefas, setIsLoadingTarefas] = useState(true);
  
  // Estados de erro
  const [errors, setErrors] = useState({
    rotinas: null as string | null,
    orientacoes: null as string | null,
    tarefas: null as string | null
  });

  // ===== BUSCAR USUÁRIOS =====
  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name');

      if (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        return;
      }

      const formattedUsers = data.map(profile => ({
        id: profile.id,
        name: profile.name || 'Usuário Desconhecido'
      }));

      setUsers(formattedUsers);
      console.log('👥 Usuários carregados:', formattedUsers.length);
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar usuários:', error);
    }
  }, []);

  // ===== FUNÇÃO PARA RESOLVER NOME DO USUÁRIO =====
  const getUserName = useCallback((userId: string): string => {
    if (!userId) return 'Usuário Desconhecido';
    
    const foundUser = users.find(u => u.id === userId);
    return foundUser?.name || userId;
  }, [users]);

  // ===== FETCH ROTINAS COM RETRY =====
  const fetchRotinas = useCallback(async (retryCount = 0) => {
    if (!user) return;

    try {
      setIsLoadingRotinas(true);
      setErrors(prev => ({ ...prev, rotinas: null }));
      console.log('🔄 Carregando rotinas para hub...');

      // Buscar rotinas
      const { data: rotinasData, error: rotinasError } = await supabase
        .from('moveis_rotinas')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (rotinasError) throw rotinasError;

      // Buscar conclusões
      const { data: conclusoesData, error: conclusoesError } = await supabase
        .from('moveis_rotinas_conclusoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (conclusoesError) throw conclusoesError;

      // Processar rotinas com status
      const rotinasWithStatus: RotinaWithStatus[] = (rotinasData || []).map(rotina => {
        const hoje = new Date();
        const conclusoesRotina = conclusoesData?.filter(c => c.rotina_id === rotina.id) || [];
        
        // Buscar conclusão mais recente
        const conclusaoMaisRecente = conclusoesRotina
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        // Determinar status baseado na periodicidade
        let status: 'pendente' | 'concluida' | 'atrasada' = 'pendente';
        
        if (conclusaoMaisRecente) {
          const dataConclusao = new Date(conclusaoMaisRecente.data_conclusao);
          const diffDays = Math.floor((hoje.getTime() - dataConclusao.getTime()) / (1000 * 60 * 60 * 24));
          
          if (rotina.periodicidade === 'diario' && diffDays === 0) {
            status = 'concluida';
          } else if (rotina.periodicidade === 'semanal' && diffDays < 7) {
            status = 'concluida';
          } else if (rotina.periodicidade === 'mensal' && diffDays < 30) {
            status = 'concluida';
          } else {
            status = diffDays > 1 ? 'atrasada' : 'pendente';
          }
        } else {
          status = 'atrasada';
        }

        return {
          ...rotina,
          periodicidade: rotina.periodicidade as 'diario' | 'semanal' | 'mensal' | 'personalizado',
          status,
          conclusao: conclusaoMaisRecente
        } as RotinaWithStatus;
      });

      setRotinas(rotinasWithStatus);
      console.log('✅ Rotinas carregadas:', rotinasWithStatus.length);
    } catch (error: any) {
      console.error('❌ Erro ao carregar rotinas:', error);
      const errorMessage = error.message || 'Erro desconhecido ao carregar rotinas';
      setErrors(prev => ({ ...prev, rotinas: errorMessage }));
      
      // Retry logic
      if (retryCount < 2) {
        console.log(`🔄 Tentativa ${retryCount + 1} de recarregar rotinas...`);
        setTimeout(() => fetchRotinas(retryCount + 1), 2000);
      } else if (!isInitialLoadRef.current) {
        // Só mostra toast em caso de erro se não for carga inicial
        toast({
          title: "⚠️ Erro ao carregar rotinas",
          description: "Não foi possível carregar as rotinas. Tente atualizar a página.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingRotinas(false);
    }
  }, [user]);

  // ===== FETCH ORIENTAÇÕES COM RETRY =====
  const fetchOrientacoes = useCallback(async (retryCount = 0) => {
    if (!user) return;

    try {
      setIsLoadingOrientacoes(true);
      setErrors(prev => ({ ...prev, orientacoes: null }));
      console.log('🔄 Carregando orientações para hub...');

      const { data: orientacoesData, error } = await supabase
        .from('moveis_orientacoes')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      // Buscar nomes dos criadores de forma otimizada
      const creatorIds = [...new Set(orientacoesData?.map(o => o.criado_por) || [])];
      if (creatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', creatorIds);

        const orientacoesFormatted: Orientacao[] = orientacoesData?.map(item => ({
          ...item,
          criado_por_nome: profiles?.find(p => p.id === item.criado_por)?.name || 'Usuário'
        })) || [];

        setOrientacoes(orientacoesFormatted);
      } else {
        setOrientacoes(orientacoesData || []);
      }

      console.log('✅ Orientações carregadas:', orientacoesData?.length || 0);
    } catch (error: any) {
      console.error('❌ Erro ao carregar orientações:', error);
      const errorMessage = error.message || 'Erro desconhecido ao carregar orientações';
      setErrors(prev => ({ ...prev, orientacoes: errorMessage }));
      
      // Retry logic
      if (retryCount < 2) {
        console.log(`🔄 Tentativa ${retryCount + 1} de recarregar orientações...`);
        setTimeout(() => fetchOrientacoes(retryCount + 1), 2000);
      } else if (!isInitialLoadRef.current) {
        // Só mostra toast em caso de erro se não for carga inicial
        toast({
          title: "⚠️ Erro ao carregar orientações",
          description: "Não foi possível carregar as orientações. Tente atualizar a página.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingOrientacoes(false);
    }
  }, [user]);

  // ===== FETCH TAREFAS COM RETRY =====
  const fetchTarefas = useCallback(async (retryCount = 0) => {
    if (!user) return;

    try {
      setIsLoadingTarefas(true);
      setErrors(prev => ({ ...prev, tarefas: null }));
      console.log('🔄 Carregando tarefas para hub...');

      const { data: tarefasData, error } = await supabase
        .from('moveis_tarefas')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      setTarefas(tarefasData || []);
      console.log('✅ Tarefas carregadas:', tarefasData?.length || 0);
    } catch (error: any) {
      console.error('❌ Erro ao carregar tarefas:', error);
      const errorMessage = error.message || 'Erro desconhecido ao carregar tarefas';
      setErrors(prev => ({ ...prev, tarefas: errorMessage }));
      
      // Retry logic
      if (retryCount < 2) {
        console.log(`🔄 Tentativa ${retryCount + 1} de recarregar tarefas...`);
        setTimeout(() => fetchTarefas(retryCount + 1), 2000);
      } else if (!isInitialLoadRef.current) {
        // Só mostra toast em caso de erro se não for carga inicial
        toast({
          title: "⚠️ Erro ao carregar tarefas",
          description: "Não foi possível carregar as tarefas. Tente atualizar a página.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingTarefas(false);
    }
  }, [user]);

  // ===== CALCULAR ESTATÍSTICAS (OTIMIZADA) =====
  const calculateStats = useCallback(() => {
    if (!rotinas.length && !orientacoes.length && !tarefas.length) return;

    try {
      // Stats de Rotinas
      const rotinasStats = {
        total: rotinas.length,
        concluidas: rotinas.filter(r => r.status === 'concluida').length,
        pendentes: rotinas.filter(r => r.status === 'pendente').length,
        atrasadas: rotinas.filter(r => r.status === 'atrasada').length,
        percentualConclusao: rotinas.length > 0 ? 
          Math.round((rotinas.filter(r => r.status === 'concluida').length / rotinas.length) * 100) : 0
      };

      // Stats de Orientações
      const hoje = new Date();
      const trintaDiasAtras = new Date(hoje.getTime() - (30 * 24 * 60 * 60 * 1000));
      const orientacoesRecentes = orientacoes.filter(o => 
        new Date(o.data_criacao) >= trintaDiasAtras
      );

      const orientacoesStats = {
        total: orientacoes.length,
        naoLidas: 0, // TODO: Implementar lógica de leitura
        recentes: orientacoesRecentes.length
      };

      // Stats de Tarefas
      const tarefasConcluidas = tarefas.filter(t => t.status === 'concluida');
      const tarefasPendentes = tarefas.filter(t => t.status === 'pendente');
      const tarefasAtrasadas = tarefas.filter(t => {
        const dataEntrega = new Date(t.data_entrega);
        return dataEntrega < hoje && t.status !== 'concluida';
      });

      const tarefasStats = {
        total: tarefas.length,
        concluidas: tarefasConcluidas.length,
        pendentes: tarefasPendentes.length,
        atrasadas: tarefasAtrasadas.length,
        percentualConclusao: tarefas.length > 0 ? 
          Math.round((tarefasConcluidas.length / tarefas.length) * 100) : 0
      };

      setStats({
        rotinas: rotinasStats,
        orientacoes: orientacoesStats,
        tarefas: tarefasStats
      });

      console.log('📊 Estatísticas calculadas:', {
        rotinas: rotinasStats,
        orientacoes: orientacoesStats,
        tarefas: tarefasStats
      });
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
    }
  }, [rotinas, orientacoes, tarefas]);

  // ===== GERAR TIMELINE DE ATIVIDADES (OTIMIZADA) =====
  const generateActivities = useCallback(() => {
    const allActivities: ActivityItem[] = [];

    // Atividades de Rotinas
    rotinas.forEach(rotina => {
      if (rotina.conclusao) {
        allActivities.push({
          id: `rotina-${rotina.id}`,
          type: 'rotina',
          title: rotina.nome,
          description: rotina.descricao,
          timestamp: rotina.conclusao.created_at,
          status: 'concluida',
          user: getUserName(rotina.created_by),
          action: 'concluida'
        });
      } else {
        allActivities.push({
          id: `rotina-${rotina.id}`,
          type: 'rotina',
          title: rotina.nome,
          description: rotina.descricao,
          timestamp: rotina.created_at,
          status: rotina.status,
          user: getUserName(rotina.created_by),
          action: 'criada'
        });
      }
    });

    // Atividades de Orientações (limitadas para performance)
    orientacoes.slice(0, 10).forEach(orientacao => {
      allActivities.push({
        id: `orientacao-${orientacao.id}`,
        type: 'orientacao',
        title: orientacao.titulo,
        description: orientacao.descricao,
        timestamp: orientacao.data_criacao,
        status: 'nova',
        user: orientacao.criado_por_nome || getUserName(orientacao.criado_por || ''),
        action: 'criada'
      });
    });

    // Atividades de Tarefas (limitadas para performance)
    tarefas.slice(0, 10).forEach(tarefa => {
      const hoje = new Date();
      const dataEntrega = new Date(tarefa.data_entrega);
      const status = tarefa.status === 'concluida' ? 'concluida' :
                    dataEntrega < hoje ? 'atrasada' : 'pendente';

      allActivities.push({
        id: `tarefa-${tarefa.id}`,
        type: 'tarefa',
        title: tarefa.titulo,
        description: tarefa.descricao,
        timestamp: tarefa.data_criacao,
        status,
        user: getUserName(tarefa.criado_por),
        action: tarefa.status === 'concluida' ? 'concluida' : 'criada'
      });
    });

    // Ordenar por timestamp (mais recente primeiro) e limitar
    const sortedActivities = allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    setActivities(sortedActivities);
  }, [rotinas, orientacoes, tarefas, getUserName]);

  // ===== REFRESH DADOS COM FEEDBACK CONTROLADO =====
  const refreshData = useCallback(async () => {
    // Evitar refresh múltiplo em pouco tempo
    const now = Date.now();
    if (now - lastRefreshRef.current < 2000) {
      console.log('🚫 Refresh muito recente, pulando...');
      return;
    }
    lastRefreshRef.current = now;

    console.log('🔄 Atualizando dados do hub...');
    
    // Só mostra toast de loading se não for a primeira carga
    if (!isInitialLoadRef.current) {
      toast({
        title: "🔄 Atualizando dados...",
        description: "Carregando informações mais recentes",
      });
    }
    
    try {
      await Promise.all([
        fetchRotinas(),
        fetchOrientacoes(),
        fetchTarefas()
      ]);
      
      // Só mostra toast de sucesso se não for a primeira carga
      if (!isInitialLoadRef.current) {
        toast({
          title: "✅ Dados atualizados",
          description: "Informações carregadas com sucesso",
        });
      }
    } catch (error) {
      console.error('❌ Erro no refresh:', error);
      if (!isInitialLoadRef.current) {
        toast({
          title: "❌ Erro na atualização",
          description: "Alguns dados podem não ter sido atualizados",
          variant: "destructive",
        });
      }
    }
  }, [fetchRotinas, fetchOrientacoes, fetchTarefas]);

  // ===== EFFECTS =====
  useEffect(() => {
    if (user) {
      // Buscar usuários primeiro, depois atualizar dados
      fetchUsers().then(() => {
        refreshData().finally(() => {
          isInitialLoadRef.current = false;
        });
      });
    }
  }, [user, fetchUsers]);

  useEffect(() => {
    if (!isLoadingRotinas && !isLoadingOrientacoes && !isLoadingTarefas && users.length > 0) {
      setIsLoadingStats(true);
      calculateStats();
      generateActivities();
      setIsLoadingStats(false);
      setIsLoadingActivities(false);
    }
  }, [isLoadingRotinas, isLoadingOrientacoes, isLoadingTarefas, users.length, calculateStats, generateActivities]);

  return {
    // Data
    stats,
    activities,
    rotinas,
    orientacoes,
    tarefas,
    
    // Loading states
    isLoadingStats,
    isLoadingActivities,
    isLoadingRotinas,
    isLoadingOrientacoes,
    isLoadingTarefas,
    isLoading: isLoadingStats || isLoadingActivities,
    
    // Error states
    errors,
    
    // Actions
    refreshData,
    fetchRotinas,
    fetchOrientacoes,
    fetchTarefas
  };
} 