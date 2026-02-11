import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Curriculo, JobPosition } from '@/types/curriculos';

export function useCurriculos(jobPositionFilter: JobPosition | null = null) {
  const [curriculos, setCurriculos] = useState<Curriculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurriculos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('curriculos')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobPositionFilter) {
        // Use the contains operator for arrays - checks if array contains the value
        query = query.contains('job_position', [jobPositionFilter]);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      // Cast the data to ensure types match
      const typedData: Curriculo[] = (data || []).map(item => ({
        id: item.id,
        candidate_name: item.candidate_name,
        job_position: (item.job_position || []) as JobPosition[],
        file_url: item.file_url,
        file_type: item.file_type as 'pdf' | 'image',
        file_size: item.file_size ?? undefined,
        created_by: item.created_by ?? undefined,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setCurriculos(typedData);
    } catch (err) {
      console.error('Error fetching curriculos:', err);
      setError('Erro ao carregar currículos');
    } finally {
      setIsLoading(false);
    }
  }, [jobPositionFilter]);

  useEffect(() => {
    fetchCurriculos();

    // Setup realtime subscription
    const channel = supabase
      .channel('curriculos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'curriculos' },
        () => {
          fetchCurriculos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCurriculos]);

  return {
    curriculos,
    isLoading,
    error,
    refetch: fetchCurriculos
  };
}
