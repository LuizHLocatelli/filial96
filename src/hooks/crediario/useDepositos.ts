import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/crediario/useFileUpload';

export type Deposito = {
  id: string;
  data: Date; // This is Date in JS memory
  concluido: boolean;
  ja_incluido: boolean;
  comprovante?: string;
  created_at: string;
  created_by?: string;
};

export type DepositoStatistics = {
  id: string;
  user_id: string;
  month_year: string;
  working_days: number;
  complete_days: number;
  partial_days: number;
  missed_days: number;
  completion_rate: number;
  punctuality_rate: number;
  average_deposit_hour: number | null;
  deposits_before_10h: number;
  deposits_after_12h: number;
  current_streak: number;
  max_streak_month: number;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
};

// Dados de exemplo para quando o Supabase não está configurado
const mockDepositos: Deposito[] = [
  {
    id: '1',
    data: new Date(),
    concluido: true,
    ja_incluido: true,
    comprovante: undefined,
    created_at: new Date().toISOString(),
    created_by: 'mock-user'
  },
  {
    id: '2',
    data: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ontem
    concluido: true,
    ja_incluido: false,
    comprovante: undefined,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'mock-user'
  }
];

// Tipo para erros com propriedades comuns
interface ErrorWithMessage {
  message?: string;
  code?: string;
}

// Função para retry com backoff exponencial
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Se é o último attempt, rejeita
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Verificar se é erro de rede que vale a pena tentar novamente
      const errorWithMsg = error as ErrorWithMessage;
      const isNetworkError = 
        errorWithMsg.message?.includes('Failed to fetch') ||
        errorWithMsg.message?.includes('QUIC_NETWORK_IDLE_TIMEOUT') ||
        errorWithMsg.message?.includes('ERR_QUIC_PROTOCOL_ERROR') ||
        errorWithMsg.message?.includes('NetworkError') ||
        errorWithMsg.code === 'PGRST301'; // Supabase network error
      
      if (!isNetworkError) {
        throw error; // Não tentar novamente para erros não relacionados à rede
      }
      
      // Delay exponencial: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Configurar timeout mais longo para o cliente Supabase
const createRobustSupabaseQuery = () => {
  // Criar uma nova instância com timeout maior
  const client = supabase;
  return client;
};

// Função para converter Date para string no formato YYYY-MM-DD mantendo timezone local
const formatDateForDatabase = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Função para converter dados do banco para Date, preservando horário real
const parseDateFromDatabase = (dateString: string, createdAt?: string): Date => {
  // Se temos created_at, usar a data selecionada mas com horário do created_at
  if (createdAt) {
    const createdDate = new Date(createdAt);
    const [year, month, day] = dateString.split('-');
    
    // Criar nova data com a data selecionada mas horário do created_at
    return new Date(
      parseInt(year), 
      parseInt(month) - 1, 
      parseInt(day),
      createdDate.getHours(),
      createdDate.getMinutes(),
      createdDate.getSeconds()
    );
  }
  
  // Fallback: usar meio-dia para evitar problemas de timezone
  const [year, month, day] = dateString.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
};

export function useDepositos() {
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [statistics, setStatistics] = useState<DepositoStatistics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'reconnecting'>('online');
  const [lastResetDate, setLastResetDate] = useState<Date | null>(null);
  const { toast } = useToast();
  const { uploadFile, isUploading, progress } = useFileUpload();

  const fetchStatistics = useCallback(async () => {
    // Se o Supabase não está configurado, usar dados mock
    if (!isSupabaseConfigured) {
      setStatistics([]);
      return;
    }
    
    try {
      const result = await retryWithBackoff(async () => {
        const { data, error } = await createRobustSupabaseQuery()
        .from('crediario_depositos_statistics')
        .select('*')
        .order('month_year', { ascending: false });

        if (error) {
          console.error('Erro na consulta de estatísticas:', error);
          throw error;
        }

        return data;
      }, 3, 2000);

      setStatistics(result || []);
      
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setStatistics([]);
    }
  }, []);

  const fetchLastResetDate = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLastResetDate(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('crediario_depositos_reset')
        .select('reset_date')
        .order('reset_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar data do último reset:', error);
      }

      if (data) {
        setLastResetDate(new Date(data.reset_date));
      } else {
        setLastResetDate(null);
      }
    } catch (error) {
      console.error('Erro ao buscar data do último reset:', error);
      setLastResetDate(null);
    }
  }, []);

  const fetchDepositos = useCallback(async () => {
    setIsLoading(true);
    setConnectionStatus('reconnecting');
    
    // Se o Supabase não está configurado, usar dados mock
    if (!isSupabaseConfigured) {
      setDepositos(mockDepositos);
      setConnectionStatus('online');
      setIsLoading(false);
      
      toast({
        title: 'Modo Demonstração',
        description: 'Supabase não configurado. Usando dados de exemplo.',
        variant: 'default',
        duration: 3000,
      });
      
      return;
    }
    
    try {
      const result = await retryWithBackoff(async () => {
        const { data, error } = await createRobustSupabaseQuery()
        .from('crediario_depositos')
        .select('*')
        .order('data', { ascending: false });

      if (error) {
          console.error('Erro na consulta:', error);
        throw error;
      }

        return data;
      }, 3, 2000);

      // Convert string dates to Date objects
      const formattedData = (result || []).map(item => ({
        ...item,
        data: parseDateFromDatabase(item.data, item.created_at)
      }));

      setDepositos(formattedData);
      setConnectionStatus('online');
      
    } catch (error) {
      console.error('Erro ao buscar depósitos:', error);
      setConnectionStatus('offline');
      
      // Mostrar toast com informações detalhadas do erro
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorMessage = errorMsg.includes('Failed to fetch') 
        ? 'Problema de conexão com o servidor. Verifique sua internet.'
        : errorMsg.includes('QUIC') 
        ? 'Timeout de rede. Tentando reconectar...'
        : errorMsg || 'Erro desconhecido';
      
      toast({
        title: 'Problema de Conexão',
        description: errorMessage,
        variant: 'destructive',
        duration: 3000,
      });
      
      // Tentar novamente automaticamente após 10 segundos
      setTimeout(() => {
        fetchDepositos();
      }, 10000);
      
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const addDeposito = async (depositoData: {
    data: Date;
    concluido?: boolean;
    ja_incluido?: boolean;
    comprovante?: File;
  }) => {
    // Se o Supabase não está configurado, usar dados mock
    if (!isSupabaseConfigured) {
      const novoDeposito: Deposito = {
        id: Date.now().toString(),
        data: depositoData.data,
        concluido: depositoData.concluido ?? true,
        ja_incluido: depositoData.ja_incluido ?? false,
        comprovante: undefined,
        created_at: new Date().toISOString(),
        created_by: 'mock-user'
      };
      
      setDepositos(prev => [...prev, novoDeposito]);
      
      toast({
        title: 'Sucesso (Demo)',
        description: 'Depósito adicionado (modo demonstração)',
        duration: 3000,
      });
      
      return novoDeposito;
    }
    
    try {
      let comprovante_url = '';
      
      // Upload do comprovante se existir
      if (depositoData.comprovante) {
        const result = await uploadFile(depositoData.comprovante, {
          bucketName: 'directory_files',
          folder: 'comprovantes',
          generateUniqueName: true
        });
        
        if (result) {
          comprovante_url = result.file_url;
        }
      }
      
      const formattedDate = formatDateForDatabase(depositoData.data);
      
      // Inserir depósito no banco com retry
      const data = await retryWithBackoff(async () => {
        const { data, error } = await createRobustSupabaseQuery()
        .from('crediario_depositos')
        .insert({
          data: formattedDate,
          concluido: depositoData.concluido ?? true,
          ja_incluido: depositoData.ja_incluido ?? false,
          comprovante: comprovante_url || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
        
      if (error) {
          console.error('Erro ao inserir:', error);
        throw error;
      }

        return data;
      }, 3, 1500);
      
      toast({
        title: 'Sucesso',
        description: 'Depósito adicionado com sucesso',
        duration: 3000,
      });
      
      // Recarregar depósitos e recalcular estatísticas automaticamente
      await fetchDepositos();
      
      // Recalcular estatísticas para o mês do depósito
      try {
        await forceRecalculateStatistics(depositoData.data);
      } catch (error) {
        // Não falhar a operação principal por conta disso
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao adicionar depósito:', error);

      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorMessage = errorMsg.includes('Failed to fetch')
        ? 'Problema de conexão. Depósito não foi salvo.'
        : errorMsg || 'Falha ao adicionar depósito';

      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
        duration: 3000,
      });
      return null;
    }
  };

  const updateDeposito = async (id: string, updates: {
    data?: Date;
    concluido?: boolean;
    ja_incluido?: boolean;
    comprovante?: string | File;
  }) => {
    // Se o Supabase não está configurado, simular atualização
    if (!isSupabaseConfigured) {
      setDepositos(prev => prev.map(dep => 
        dep.id === id 
          ? { 
              ...dep, 
              data: updates.data || dep.data,
              concluido: updates.concluido !== undefined ? updates.concluido : dep.concluido,
              ja_incluido: updates.ja_incluido !== undefined ? updates.ja_incluido : dep.ja_incluido,
              comprovante: updates.comprovante instanceof File ? dep.comprovante : (updates.comprovante as string || dep.comprovante)
            }
          : dep
      ));
      
      toast({
        title: 'Sucesso (Demo)',
        description: 'Depósito atualizado (modo demonstração)',
        duration: 3000,
      });
      
      return;
    }
    
    try {
      // Convert Date to string for database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedUpdates: Record<string, any> = { ...updates };
      
      if (updates.data instanceof Date) {
        formattedUpdates.data = formatDateForDatabase(updates.data);
      }

      // Handle file upload if comprovante is a File
      if (updates.comprovante && updates.comprovante instanceof File) {
        const result = await uploadFile(updates.comprovante, {
          bucketName: 'directory_files',
          folder: 'comprovantes',
          generateUniqueName: true
        });
        
        if (result) {
          formattedUpdates.comprovante = result.file_url;
        } else {
          // Remove the file update if upload failed
          delete formattedUpdates.comprovante;
        }
      }
      
      await retryWithBackoff(async () => {
        const { error } = await createRobustSupabaseQuery()
        .from('crediario_depositos')
        .update(formattedUpdates)
        .eq('id', id);
        
      if (error) {
          console.error('Erro ao atualizar:', error);
        throw error;
      }
      }, 3, 1500);
      
      toast({
        title: 'Sucesso',
        description: 'Depósito atualizado com sucesso',
        duration: 3000,
      });
      
      // Recarregar depósitos e recalcular estatísticas automaticamente
      await fetchDepositos();
      
      // Recalcular estatísticas para o mês do depósito
      if (updates.data) {
        try {
          await forceRecalculateStatistics(updates.data);
        } catch (error) {
          // Não falhar a operação principal por conta disso
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar depósito:', error);

      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorMessage = errorMsg.includes('Failed to fetch')
        ? 'Problema de conexão. Atualização não foi salva.'
        : errorMsg || 'Falha ao atualizar depósito';

      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const deleteDeposito = async (id: string) => {
    try {
      // Encontrar o depósito antes de deletar para obter a data
      const depositoToDelete = depositos.find(d => d.id === id);
      
      await retryWithBackoff(async () => {
        const { error } = await createRobustSupabaseQuery()
        .from('crediario_depositos')
        .delete()
        .eq('id', id);
        
      if (error) {
          console.error('Erro ao deletar:', error);
        throw error;
      }
      }, 3, 1500);
      
      toast({
        title: 'Sucesso',
        description: 'Depósito excluído com sucesso',
        duration: 3000,
      });
      
      // Recarregar depósitos e recalcular estatísticas automaticamente
      await fetchDepositos();
      
      // Recalcular estatísticas para o mês do depósito excluído
      if (depositoToDelete) {
        try {
          await forceRecalculateStatistics(depositoToDelete.data);
        } catch (error) {
          // Não falhar a operação principal por conta disso
        }
      }
    } catch (error) {
      console.error('Erro ao excluir depósito:', error);

      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorMessage = errorMsg.includes('Failed to fetch')
        ? 'Problema de conexão. Exclusão não foi processada.'
        : errorMsg || 'Falha ao excluir depósito';

      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const clearAllDepositos = async () => {
    // Se o Supabase não está configurado, simular limpeza
    if (!isSupabaseConfigured) {
      setDepositos([]);
      setStatistics([]);
      
      toast({
        title: 'Sucesso (Demo)',
        description: 'Todo o histórico de depósitos foi removido (modo demonstração)',
        duration: 3000,
      });
      
      return true;
    }
    
    try {
      await retryWithBackoff(async () => {
        const { error } = await createRobustSupabaseQuery()
          .from('crediario_depositos')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta todos os registros
        
        if (error) {
          console.error('Erro ao limpar depósitos:', error);
          throw error;
        }
      }, 3, 2000);
      
      // Limpar estatísticas também
      await retryWithBackoff(async () => {
        const { error } = await createRobustSupabaseQuery()
          .from('crediario_depositos_statistics')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (error) {
          console.error('Erro ao limpar estatísticas:', error);
          throw error;
        }
      }, 3, 2000);

      // Registrar a data do reset
      await retryWithBackoff(async () => {
        const { error } = await createRobustSupabaseQuery()
          .from('crediario_depositos_reset')
          .insert({
            reset_date: new Date().toISOString().split('T')[0]
          });
        
        if (error) {
          console.error('Erro ao registrar data do reset:', error);
          throw error;
        }
      }, 3, 2000);
      
      // Recarregar dados
      await fetchDepositos();
      await fetchStatistics();
      await fetchLastResetDate();
      
      toast({
        title: 'Sucesso',
        description: 'Todo o histórico de depósitos foi removido com sucesso',
        duration: 3000,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao limpar histórico de depósitos:', error);

      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorMessage = errorMsg.includes('Failed to fetch')
        ? 'Problema de conexão. Limpeza não foi processada.'
        : errorMsg || 'Falha ao limpar histórico de depósitos';

      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
        duration: 3000,
      });

      return false;
    }
  };
  
  const saveDeposito = async (
    depositoData: {
      id?: string;
      data: Date;
      concluido: boolean;
      jaIncluido: boolean;
      comprovante?: string;
    }, 
    file?: File | null
  ) => {
    try {
      let comprovante_url = depositoData.comprovante || '';
      
      // Upload do comprovante se existir
      if (file) {
        const result = await uploadFile(file, {
          bucketName: 'directory_files',
          folder: 'comprovantes',
          generateUniqueName: true
        });
        
        if (result) {
          comprovante_url = result.file_url;
        }
      }
      
      if (depositoData.id) {
        // Update existing deposit - convert Date to string
        await updateDeposito(depositoData.id, {
          data: depositoData.data,
          concluido: depositoData.concluido,
          ja_incluido: depositoData.jaIncluido,
          comprovante: comprovante_url || undefined
        });
      } else {
        // Create new deposit
        await addDeposito({
          data: depositoData.data,
          concluido: depositoData.concluido,
          ja_incluido: depositoData.jaIncluido,
          comprovante: file || undefined
        });
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao salvar depósito:", error);
      throw error;
    }
  };

  const getMonthStatistics = (month: Date): DepositoStatistics | null => {
    const monthKey = formatDateForDatabase(new Date(month.getFullYear(), month.getMonth(), 1));
    return statistics.find(stat => stat.month_year === monthKey) || null;
  };

  const forceRecalculateStatistics = async (month: Date) => {
    if (!isSupabaseConfigured) return;
    
    try {
      const monthStart = formatDateForDatabase(new Date(month.getFullYear(), month.getMonth(), 1));
      
      await retryWithBackoff(async () => {
        const { error } = await createRobustSupabaseQuery()
        .rpc('calculate_deposit_statistics', {
          target_user_id: (await supabase.auth.getUser()).data.user?.id,
          target_month: monthStart
        });

        if (error) {
          console.error('Erro ao recalcular estatísticas:', error);
          throw error;
        }
      }, 3, 2000);
      
      // Recarregar estatísticas
      await fetchStatistics();
      
      toast({
        title: 'Estatísticas Atualizadas',
        description: 'Estatísticas recalculadas com sucesso',
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Erro ao forçar recálculo:', error);

      toast({
        title: 'Erro',
        description: 'Falha ao recalcular estatísticas',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  // Effect para carregar dados iniciais
  useEffect(() => {
    fetchDepositos();
    fetchStatistics();
    fetchLastResetDate();
  }, [fetchDepositos, fetchStatistics, fetchLastResetDate]);

  return {
    depositos,
    statistics,
    isLoading,
    connectionStatus,
    lastResetDate,
    addDeposito,
    updateDeposito,
    deleteDeposito,
    clearAllDepositos,
    saveDeposito,
    fetchDepositos,
    fetchStatistics,
    getMonthStatistics,
    forceRecalculateStatistics,
    uploadProgress: progress,
    isUploading,
  };
}
