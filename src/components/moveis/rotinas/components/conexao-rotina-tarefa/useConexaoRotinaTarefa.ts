
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RotinaWithStatus } from "../../types";

interface TarefaRelacionada {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  data_entrega: string;
  criado_por: string;
  data_criacao: string;
  data_atualizacao: string;
  orientacao_id: string | null;
  rotina_id: string | null;
  origem: string;
  prioridade: string;
  moveis_orientacoes: { titulo: string } | null;
}

export function useConexaoRotinaTarefa(rotina: RotinaWithStatus) {
  const { toast } = useToast();
  const [tarefasRelacionadas, setTarefasRelacionadas] = useState<TarefaRelacionada[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTarefa, setIsCreatingTarefa] = useState(false);

  const carregarTarefasRelacionadas = async () => {
    try {
      setIsLoading(true);
      
      const { data: tarefas, error } = await supabase
        .from('moveis_tarefas')
        .select(`
          id,
          titulo,
          descricao,
          status,
          data_entrega,
          criado_por,
          data_criacao,
          data_atualizacao,
          orientacao_id,
          rotina_id,
          origem,
          prioridade,
          moveis_orientacoes (titulo)
        `)
        .order('data_entrega', { ascending: true });

      if (error) throw error;

      // Transform data to match expected type
      const transformedTarefas = (tarefas || []).map(tarefa => ({
        ...tarefa,
        rotina_id: tarefa.rotina_id || null,
        origem: tarefa.origem || 'manual',
        prioridade: tarefa.prioridade || 'media'
      }));

      setTarefasRelacionadas(transformedTarefas);
    } catch (error) {
      console.error('Erro ao carregar tarefas relacionadas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas relacionadas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const criarTarefaAutomatica = async () => {
    try {
      setIsCreatingTarefa(true);
      
      const dataEntrega = new Date();
      dataEntrega.setDate(dataEntrega.getDate() + 3);

      const novaTarefa = {
        titulo: `Tarefa: ${rotina.nome}`,
        descricao: `Tarefa gerada automaticamente pela rotina: ${rotina.nome}`,
        data_entrega: dataEntrega.toISOString(),
        status: 'pendente',
        criado_por: rotina.created_by,
        origem: 'rotina',
        prioridade: 'media'
      };

      const { error } = await supabase
        .from('moveis_tarefas')
        .insert(novaTarefa);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tarefa criada automaticamente a partir da rotina",
      });

      carregarTarefasRelacionadas();
      
    } catch (error) {
      console.error('Erro ao criar tarefa automática:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa automática",
        variant: "destructive"
      });
    } finally {
      setIsCreatingTarefa(false);
    }
  };

  useEffect(() => {
    carregarTarefasRelacionadas();
  }, [rotina.id]);

  return {
    tarefasRelacionadas,
    isLoading,
    isCreatingTarefa,
    criarTarefaAutomatica
  };
}
