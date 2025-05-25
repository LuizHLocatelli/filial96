import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StatsData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalClients: number;
  totalDeposits: number;
  totalSales: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalClients: 0,
    totalDeposits: 0,
    totalSales: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [tasksResponse, clientsResponse, depositsResponse, salesResponse] = await Promise.all([
        supabase.from('moveis_tarefas').select('status', { count: 'exact' }),
        supabase.from('crediario_clientes').select('id', { count: 'exact' }),
        supabase.from('crediario_depositos').select('id', { count: 'exact' }),
        supabase.from('venda_o_sales').select('id', { count: 'exact' }),
      ]);

      // Tratamento de erro para cada resposta
      if (tasksResponse.error) throw new Error(`Tasks error: ${tasksResponse.error.message}`);
      if (clientsResponse.error) throw new Error(`Clients error: ${clientsResponse.error.message}`);
      if (depositsResponse.error) throw new Error(`Deposits error: ${depositsResponse.error.message}`);
      if (salesResponse.error) throw new Error(`Sales error: ${salesResponse.error.message}`);

      const totalTasks = tasksResponse.count || 0;
      // Para contar completed e pending, precisamos dos dados, não apenas da contagem total.
      // Se a API permitir filtros na contagem, seria mais eficiente.
      // Por agora, mantendo a lógica original de filtrar os dados retornados, mas ajustando para o caso de a contagem ser o foco.
      // Se 'status' não for selecionado, a lógica abaixo falhará. 
      // A query original selecionava 'status' sem count, e depois 'id' com count para os outros.
      // Vou assumir que queremos todos os dados de tarefas para filtrar status, e contagem para os outros.
      
      const { data: tasksData, error: tasksDataError } = await supabase.from("moveis_tarefas").select("status");
      if (tasksDataError) throw new Error(`Tasks data fetch error: ${tasksDataError.message}`);

      const completedTasks = tasksData?.filter((t) => t.status === 'concluida').length || 0;
      const pendingTasks = tasksData?.filter((t) => t.status === 'pendente').length || 0;
      // O total de tarefas já pode vir de tasksResponse.count se a query for ajustada, 
      // mas para consistência com a contagem de concluídas/pendentes, usamos tasksData.length.
      const actualTotalTasks = tasksData?.length || 0; 

      setStats({
        totalTasks: actualTotalTasks, // Usar o total real dos dados de tarefas buscados
        completedTasks,
        pendingTasks,
        totalClients: clientsResponse.count || 0,
        totalDeposits: depositsResponse.count || 0,
        totalSales: salesResponse.count || 0,
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas do dashboard:', err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return { stats, isLoading, error, refreshStats: fetchDashboardStats };
} 