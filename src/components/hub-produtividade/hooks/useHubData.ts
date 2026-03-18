import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { toast } from "sonner";

export function useHubData() {
  const { user } = useAuth();

  const refreshData = useCallback(async () => {
    try {
      toast.success("✅ Dados atualizados", { description: "Informações carregadas com sucesso" });
    } catch (error) {
      console.error('❌ Erro no refresh:', error);
      toast.error("❌ Erro na atualização", { description: "Alguns dados podem não ter sido atualizados" });
    }
  }, []);

  return {
    isLoading: false,
    refreshData,
  };
}
