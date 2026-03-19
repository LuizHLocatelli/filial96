import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { queryKeys, fetchPastas, fetchAllPastas, createPasta, updatePasta, deletePasta, movePasta } from "../lib/queries";
import { PastaComCounts, FolderFormData } from "../types";

export function usePastas(pastaPaiId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: pastas, isLoading, error } = useQuery({
    queryKey: queryKeys.pastas.list(pastaPaiId),
    queryFn: () => fetchPastas(pastaPaiId),
    enabled: !!user,
  });

  return {
    pastas,
    isLoading,
    error,
  };
}

export function useAllPastas() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.pastas.allFolders,
    queryFn: fetchAllPastas,
    enabled: !!user,
  });
}

export function useCreatePasta() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nome, pastaPaiId }: { nome: string; pastaPaiId: string | null }) => {
      if (!user) throw new Error("Usuário não autenticado");
      return createPasta(nome, user.id, pastaPaiId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pastas.all });
      toast.success("Pasta criada", { description: "A pasta foi criada com sucesso." });
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar pasta", { description: error.message });
    },
  });
}

export function useUpdatePasta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FolderFormData }) => {
      return updatePasta(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pastas.all });
      toast.success("Pasta atualizada", { description: "A pasta foi atualizada com sucesso." });
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar pasta", { description: error.message });
    },
  });
}

export function useDeletePasta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePasta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pastas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.arquivos.all });
      toast.success("Pasta excluída", { description: "A pasta foi excluída com sucesso." });
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir pasta", { description: error.message });
    },
  });
}

export function useMovePasta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pastaId, pastaPaiId }: { pastaId: string; pastaPaiId: string | null }) => {
      return movePasta(pastaId, pastaPaiId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pastas.all });
      toast.success("Pasta movida", { description: "A pasta foi movida com sucesso." });
    },
    onError: (error: Error) => {
      toast.error("Erro ao mover pasta", { description: error.message });
    },
  });
}
