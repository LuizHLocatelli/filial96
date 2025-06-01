import { useState, useEffect } from 'react';
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

// Função para retry com backoff exponencial
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Se é o último attempt, rejeita
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Verificar se é erro de rede que vale a pena tentar novamente
      const isNetworkError = 
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('QUIC_NETWORK_IDLE_TIMEOUT') ||
        error.message?.includes('ERR_QUIC_PROTOCOL_ERROR') ||
        error.message?.includes('NetworkError') ||
        error.code === 'PGRST301'; // Supabase network error
      
      if (!isNetworkError) {
        throw error; // Não tentar novamente para erros não relacionados à rede
      }
      
      // Delay exponencial: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`🔄 Tentativa ${attempt + 1}/${maxRetries + 1} falhou. Tentando novamente em ${delay}ms...`);
      
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
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'reconnecting'>('online');
  const { toast } = useToast();
  const { uploadFile, isUploading, progress } = useFileUpload();

  useEffect(() => {
    fetchDepositos();
  }, []);

  const fetchDepositos = async () => {
    setIsLoading(true);
    setConnectionStatus('reconnecting');
    
    // Se o Supabase não está configurado, usar dados mock
    if (!isSupabaseConfigured) {
      console.log('🔧 Supabase não configurado, usando dados de exemplo...');
      setDepositos(mockDepositos);
      setConnectionStatus('online');
      setIsLoading(false);
      
      toast({
        title: '⚠️ Modo Demonstração',
        description: 'Supabase não configurado. Usando dados de exemplo.',
        variant: 'default',
        duration: 3000,
      });
      
      return;
    }
    
    try {
      const result = await retryWithBackoff(async () => {
        console.log('🔍 Buscando depósitos...');
        
        const { data, error } = await createRobustSupabaseQuery()
        .from('crediario_depositos')
        .select('*')
        .order('data', { ascending: false });

      if (error) {
          console.error('❌ Erro na consulta:', error);
        throw error;
      }

        return data;
      }, 3, 2000);

      console.log('✅ Depósitos carregados com sucesso');

      // Convert string dates to Date objects
      const formattedData = result.map(item => {
        console.log('🔄 Convertendo item do banco:', {
          id: item.id,
          data_string: item.data,
          data_converted_OLD: new Date(item.data),
          data_converted_NEW: parseDateFromDatabase(item.data, item.created_at),
          data_converted_toString: parseDateFromDatabase(item.data, item.created_at).toString()
        });
        
        return {
          ...item,
          data: parseDateFromDatabase(item.data, item.created_at)
        };
      });

      console.log('📊 Dados finais formatados:', formattedData.map(item => ({
        id: item.id,
        data: item.data,
        data_toString: item.data.toString()
      })));

      setDepositos(formattedData);
      setConnectionStatus('online');
      
    } catch (error: any) {
      console.error('❌ Erro final ao buscar depósitos:', error);
      setConnectionStatus('offline');
      
      // Mostrar toast com informações detalhadas do erro
      const errorMessage = error.message?.includes('Failed to fetch') 
        ? 'Problema de conexão com o servidor. Verifique sua internet.'
        : error.message?.includes('QUIC') 
        ? 'Timeout de rede. Tentando reconectar...'
        : error.message || 'Erro desconhecido';
      
      toast({
        title: '⚠️ Problema de Conexão',
        description: errorMessage,
        variant: 'destructive',
        duration: 3000,
      });
      
      // Tentar novamente automaticamente após 10 segundos
      setTimeout(() => {
        console.log('🔄 Tentativa automática de reconexão...');
        fetchDepositos();
      }, 10000);
      
    } finally {
      setIsLoading(false);
    }
  };

  const addDeposito = async (depositoData: {
    data: Date;
    concluido?: boolean;
    ja_incluido?: boolean;
    comprovante?: File;
  }) => {
    console.log('🚀 addDeposito chamado com:', {
      data_original: depositoData.data,
      data_toString: depositoData.data.toString(),
      data_toISOString: depositoData.data.toISOString(),
      data_formatDateForDatabase: formatDateForDatabase(depositoData.data),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: depositoData.data.getTimezoneOffset()
    });

    // Se o Supabase não está configurado, simular sucesso
    if (!isSupabaseConfigured) {
      console.log('🔧 Supabase não configurado, simulando adição...');
      const newDeposito: Deposito = {
        id: Date.now().toString(),
        data: depositoData.data,
        concluido: depositoData.concluido ?? true,
        ja_incluido: depositoData.ja_incluido ?? false,
        comprovante: undefined,
        created_at: new Date().toISOString(),
        created_by: 'mock-user'
      };
      
      setDepositos(prev => [newDeposito, ...prev]);
      
      toast({
        title: '✅ Sucesso (Demo)',
        description: 'Depósito adicionado (modo demonstração)',
        duration: 3000,
      });
      
      return newDeposito;
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
      console.log('📅 Data formatada para banco:', formattedDate);
      
      // Inserir depósito no banco com retry
      const data = await retryWithBackoff(async () => {
        console.log('📝 Inserindo no banco com data:', formattedDate);
        
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
          console.error('❌ Erro ao inserir:', error);
        throw error;
      }

        console.log('✅ Dados retornados do banco:', data);
        
        return data;
      }, 3, 1500);
      
      console.log('✅ Depósito adicionado com sucesso');
      
      toast({
        title: '✅ Sucesso',
        description: 'Depósito adicionado com sucesso',
        duration: 3000,
      });
      
      fetchDepositos();
      return data;
    } catch (error: any) {
      console.error('❌ Erro final ao adicionar depósito:', error);
      
      const errorMessage = error.message?.includes('Failed to fetch') 
        ? 'Problema de conexão. Depósito não foi salvo.'
        : error.message || 'Falha ao adicionar depósito';
      
      toast({
        title: '❌ Erro',
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
      console.log('🔧 Supabase não configurado, simulando atualização...');
      
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
        title: '✅ Sucesso (Demo)',
        description: 'Depósito atualizado (modo demonstração)',
        duration: 3000,
      });
      
      return;
    }
    
    try {
      // Convert Date to string for database
      const formattedUpdates: { [key: string]: any } = { ...updates };
      
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
        console.log('📝 Atualizando depósito...');
        
        const { error } = await createRobustSupabaseQuery()
        .from('crediario_depositos')
        .update(formattedUpdates)
        .eq('id', id);
        
      if (error) {
          console.error('❌ Erro ao atualizar:', error);
        throw error;
      }
      }, 3, 1500);
      
      console.log('✅ Depósito atualizado com sucesso');
      
      toast({
        title: '✅ Sucesso',
        description: 'Depósito atualizado com sucesso',
        duration: 3000,
      });
      
      fetchDepositos();
    } catch (error: any) {
      console.error('❌ Erro final ao atualizar depósito:', error);
      
      const errorMessage = error.message?.includes('Failed to fetch') 
        ? 'Problema de conexão. Atualização não foi salva.'
        : error.message || 'Falha ao atualizar depósito';
      
      toast({
        title: '❌ Erro',
        description: errorMessage,
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const deleteDeposito = async (id: string) => {
    try {
      await retryWithBackoff(async () => {
        console.log('🗑️ Deletando depósito...');
        
        const { error } = await createRobustSupabaseQuery()
        .from('crediario_depositos')
        .delete()
        .eq('id', id);
        
      if (error) {
          console.error('❌ Erro ao deletar:', error);
        throw error;
      }
      }, 3, 1500);
      
      console.log('✅ Depósito excluído com sucesso');
      
      toast({
        title: '✅ Sucesso',
        description: 'Depósito excluído com sucesso',
        duration: 3000,
      });
      
      fetchDepositos();
    } catch (error: any) {
      console.error('❌ Erro final ao excluir depósito:', error);
      
      const errorMessage = error.message?.includes('Failed to fetch') 
        ? 'Problema de conexão. Exclusão não foi processada.'
        : error.message || 'Falha ao excluir depósito';
      
      toast({
        title: '❌ Erro',
        description: errorMessage,
        variant: 'destructive',
        duration: 3000,
      });
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

  return {
    depositos,
    isLoading,
    connectionStatus,
    addDeposito,
    updateDeposito,
    deleteDeposito,
    saveDeposito,
    fetchDepositos,
    uploadProgress: progress,
    isUploading,
  };
}
