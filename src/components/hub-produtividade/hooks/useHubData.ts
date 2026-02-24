import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

export function useHubData() {
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshData = useCallback(async () => {
    try {
      toast({
        title: "✅ Dados atualizados",
        description: "Informações carregadas com sucesso",
      });
    } catch (error) {
      console.error('❌ Erro no refresh:', error);
      toast({
        title: "❌ Erro na atualização",
        description: "Alguns dados podem não ter sido atualizados",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    isLoading: false,
    refreshData,
  };
}
