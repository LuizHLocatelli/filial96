
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MetasDashboardData } from '../types/metasTypes';
import { useToast } from '@/components/ui/use-toast';

export function useMetasDashboard(mesReferencia?: Date) {
  const [data, setData] = useState<MetasDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const mesRef = mesReferencia || new Date();
      const firstDayOfMonth = new Date(mesRef.getFullYear(), mesRef.getMonth(), 1);
      const formattedDate = firstDayOfMonth.toISOString().split('T')[0];

      const { data: result, error } = await supabase.rpc('get_metas_dashboard_data', {
        mes_ref: formattedDate
      });

      if (error) {
        throw error;
      }

      setData(result);
    } catch (err: any) {
      console.error('Erro ao carregar dados das metas:', err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar metas",
        description: "Não foi possível carregar os dados das metas.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [mesReferencia]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}
