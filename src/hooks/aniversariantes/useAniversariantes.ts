import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAniversariantes, createAniversariante, deleteAniversariante } from '@/services/aniversariantes';
import { AniversarianteFormData } from '@/types/aniversariantes';
import { toast } from 'sonner';

export function useAniversariantes() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['aniversariantes'],
    queryFn: fetchAniversariantes,
  });

  const createMutation = useMutation({
    mutationFn: (newAniversariante: AniversarianteFormData) => createAniversariante(newAniversariante),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aniversariantes'] });
      toast.success('Aniversariante adicionado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar aniversariante: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAniversariante(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aniversariantes'] });
      toast.success('Aniversariante removido com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover aniversariante: ${error.message}`);
    },
  });

  return {
    aniversariantes: data || [],
    isLoading,
    error,
    addAniversariante: createMutation.mutate,
    isAdding: createMutation.isPending,
    removeAniversariante: deleteMutation.mutate,
    isRemoving: deleteMutation.isPending,
  };
}
