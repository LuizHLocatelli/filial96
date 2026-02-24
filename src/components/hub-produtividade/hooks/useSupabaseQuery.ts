import { useState, useEffect, useCallback, useRef } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '../utils/errorHandler';

export interface QueryOptions {
  retryCount?: number;
  retryDelay?: number;
  showErrorToast?: boolean;
}

type SupabaseQueryResult<T> = { data: T[] | null; error: Error };

export function useSupabaseQuery<T>(
  table: string,
  queryBuilder: (client: SupabaseClient) => Promise<SupabaseQueryResult<T>>,
  dependencies: unknown[] = [],
  options: QueryOptions = {}
) {
  const { retryCount = 2, retryDelay = 2000, showErrorToast = true } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usar refs para evitar loops infinitos
  const queryBuilderRef = useRef(queryBuilder);
  const dependenciesRef = useRef(dependencies);
  
  // Atualizar refs quando mudarem
  queryBuilderRef.current = queryBuilder;
  dependenciesRef.current = dependencies;

  const executeQuery = useCallback(async (attempt = 0): Promise<void> => {
    try {
      setError(null);
      console.log(`🔄 Carregando ${table}...`);
      
      const query = queryBuilderRef.current(supabase);
      const { data: result, error: queryError } = await query;
      
      if (queryError) throw queryError;
      
      setData(result || []);
      console.log(`✅ ${table} carregados:`, result?.length || 0);
    } catch (queryError) {
      console.error(`❌ Erro ao carregar ${table}:`, queryError);
      
      if (attempt < retryCount) {
        console.log(`🔄 Tentativa ${attempt + 1} de recarregar ${table}...`);
        setTimeout(() => executeQuery(attempt + 1), retryDelay);
      } else {
        const errorMessage = handleError(
          queryError, 
          `carregar ${table}`, 
          { showToast: showErrorToast }
        );
        setError(errorMessage);
      }
    } finally {
      if (attempt === 0) {
        setIsLoading(false);
      }
    }
  }, [table, retryCount, retryDelay, showErrorToast]); // Dependências estáveis

  // Effect para executar query quando dependências mudarem
  useEffect(() => {
    executeQuery();
    // Usar JSON.stringify para comparar arrays de dependências
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executeQuery, JSON.stringify(dependencies)]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    executeQuery();
  }, [executeQuery]);

  return { data, isLoading, error, refetch };
}
