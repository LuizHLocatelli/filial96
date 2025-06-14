
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useOrientacoes } from '@/components/moveis/orientacoes/hooks/useOrientacoes';

// Schema com campos obrigatórios e defaults apropriados
const tarefaSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  data_entrega: z.date({
    required_error: 'Data de entrega é obrigatória',
  }),
  orientacao_id: z.string().optional(),
  rotina_id: z.string().optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']).default('media'),
  origem: z.enum(['manual', 'rotina', 'orientacao']).default('manual'),
});

// Tipo derivado do schema para garantir consistência
export type TarefaFormValues = z.infer<typeof tarefaSchema>;

export function useTarefasOperations() {
  const { toast } = useToast();
  const { orientacoes } = useOrientacoes();
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [isLoadingTarefas, setIsLoadingTarefas] = useState(true);

  // Form com valores padrão explícitos
  const tarefaForm = useForm<TarefaFormValues>({
    resolver: zodResolver(tarefaSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      data_entrega: new Date(),
      orientacao_id: '',
      rotina_id: '',
      prioridade: 'media',
      origem: 'manual',
    },
  });

  const fetchTarefas = async () => {
    try {
      setIsLoadingTarefas(true);
      const { data, error } = await supabase
        .from('moveis_tarefas')
        .select('*')
        .order('data_entrega', { ascending: true });

      if (error) {
        throw error;
      }

      setTarefas(data || []);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      toast({
        title: "Erro ao carregar tarefas",
        description: "Não foi possível carregar as tarefas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTarefas(false);
    }
  };

  useEffect(() => {
    fetchTarefas();
  }, []);

  const handleCreateTarefa = async (data: TarefaFormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Usuário não autenticado",
          description: "Você precisa estar logado para criar uma tarefa.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('moveis_tarefas')
        .insert([{
          ...data,
          data_entrega: data.data_entrega.toISOString(),
          orientacao_id: data.orientacao_id || null,
          rotina_id: data.rotina_id || null,
          status: 'pendente',
          criado_por: user.id,
        }]);

      if (error) {
        throw error;
      }

      toast({
        title: "Tarefa criada com sucesso!",
        description: "A tarefa foi adicionada à sua lista.",
      });

      tarefaForm.reset();
      await fetchTarefas();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "Erro ao criar tarefa",
        description: "Não foi possível criar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleAtualizarStatusTarefa = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('moveis_tarefas')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Status atualizado!",
        description: "O status da tarefa foi atualizado com sucesso.",
      });

      await fetchTarefas();
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleExcluirTarefa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('moveis_tarefas')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Tarefa excluída!",
        description: "A tarefa foi removida com sucesso.",
      });

      await fetchTarefas();
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast({
        title: "Erro ao excluir tarefa",
        description: "Não foi possível excluir a tarefa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    tarefas,
    orientacoes,
    isLoadingTarefas,
    tarefaForm,
    handleCreateTarefa,
    handleAtualizarStatusTarefa,
    handleExcluirTarefa,
  };
}
