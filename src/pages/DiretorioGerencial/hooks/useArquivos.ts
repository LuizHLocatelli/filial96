import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { queryKeys, fetchArquivos, deleteArquivo as deleteArquivoQuery, moveArquivo as moveArquivoQuery } from "../lib/queries";
import { ArquivoGerencial } from "../types";

export function useArquivos(pastaId: string | null) {
  const { user } = useAuth();

  const { data: arquivos, isLoading, error } = useQuery({
    queryKey: queryKeys.arquivos.list(pastaId),
    queryFn: () => fetchArquivos(pastaId),
    enabled: !!user,
  });

  return {
    arquivos,
    isLoading,
    error,
  };
}

export function useDeleteArquivo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteArquivoQuery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.arquivos.all });
      toast.success("Arquivo excluído", { description: "O arquivo foi excluído com sucesso." });
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir arquivo", { description: error.message });
    },
  });
}

export function useMoveArquivo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ arquivoId, pastaId }: { arquivoId: string; pastaId: string | null }) => {
      return moveArquivoQuery(arquivoId, pastaId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.arquivos.all });
      toast.success("Arquivo movido", { description: "O arquivo foi movido com sucesso." });
    },
    onError: (error: Error) => {
      toast.error("Erro ao mover arquivo", { description: error.message });
    },
  });
}
