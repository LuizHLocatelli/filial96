
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tarefa } from "@/components/moveis/orientacoes/types";

const tarefaFormSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().optional(),
  data_entrega: z.date(),
  orientacao_id: z.string().optional(),
  rotina_id: z.string().optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']).default('media'),
  origem: z.enum(['manual', 'rotina', 'orientacao']).default('manual'),
});

type TarefaFormValues = z.infer<typeof tarefaFormSchema>;

export function useTarefasOperations() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [orientacoes, setOrientacoes] = useState<Array<{ id: string; titulo: string }>>([]);
  const [isLoadingTarefas, setIsLoadingTarefas] = useState(true);

  const { user } = useAuth();
  const { toast } = useToast();

  const tarefaForm = useForm<TarefaFormValues>({
    resolver: zodResolver(tarefaFormSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      orientacao_id: "none",
      rotina_id: "none",
      prioridade: "media",
      origem: "manual",
    },
  });

  const fetchTarefas = async () => {
    setIsLoadingTarefas(true);
    try {
      const { data, error } = await supabase
        .from("moveis_tarefas")
        .select(`
          *,
          orientacao:moveis_orientacoes(titulo)
        `)
        .order("data_entrega", { ascending: true });

      if (error) throw error;

      setTarefas((data || []) as unknown as Tarefa[]);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de tarefas.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTarefas(false);
    }
  };

  const fetchOrientacoes = async () => {
    try {
      const { data, error } = await supabase
        .from("moveis_orientacoes")
        .select("id, titulo")
        .order("titulo", { ascending: true });

      if (error) throw error;

      setOrientacoes((data || []) as unknown as Array<{ id: string; titulo: string }>);
    } catch (error) {
      console.error("Erro ao buscar orientações:", error);
    }
  };

  const handleCreateTarefa = async (data: TarefaFormValues) => {
    try {
      setIsLoadingTarefas(true);
      const response = await fetch('/api/tarefas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          usuario_id: user?.id,
          orientacao_id: data.orientacao_id === 'none' ? null : data.orientacao_id,
          rotina_id: data.rotina_id === 'none' ? null : data.rotina_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar tarefa');
      }

      const novaTarefa = await response.json();
      setTarefas(prev => [novaTarefa, ...prev]);
      tarefaForm.reset();
      
      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar tarefa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTarefas(false);
    }
  };

  const handleAtualizarStatusTarefa = async (tarefaId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from("moveis_tarefas")
        .update({ status: novoStatus })
        .eq("id", tarefaId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status da tarefa atualizado!",
      });

      fetchTarefas();
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleExcluirTarefa = async (tarefaId: string) => {
    try {
      const { error } = await supabase
        .from("moveis_tarefas")
        .delete()
        .eq("id", tarefaId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tarefa excluída com sucesso!",
      });

      fetchTarefas();
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a tarefa.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTarefas();
    fetchOrientacoes();
  }, []);

  return {
    tarefas,
    orientacoes,
    isLoadingTarefas,
    tarefaForm,
    handleCreateTarefa,
    handleAtualizarStatusTarefa,
    handleExcluirTarefa,
    fetchTarefas,
  };
}
