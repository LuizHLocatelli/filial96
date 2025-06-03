import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Orientacao } from "../types";

export function useOrientacoesCrud() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const updateOrientacao = async (id: string, data: Partial<Orientacao>) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('moveis_orientacoes')
        .update({
          titulo: data.titulo,
          descricao: data.descricao,
          tipo: data.tipo
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso",
        description: "Orientação atualizada com sucesso",
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar orientação:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar a orientação",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrientacao = async (id: string) => {
    try {
      setIsLoading(true);
      console.log('Tentando excluir orientação com ID:', id);
      
      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }
      
      console.log('Usuário autenticado:', user.id);

      // Verificar se a orientação existe antes de tentar excluir
      const { data: orientacao, error: selectError } = await supabase
        .from('moveis_orientacoes')
        .select('id, titulo')
        .eq('id', id)
        .single();

      if (selectError) {
        console.error('Erro ao buscar orientação:', selectError);
        throw new Error('Orientação não encontrada');
      }

      if (!orientacao) {
        throw new Error('Orientação não encontrada');
      }

      console.log('Orientação encontrada:', orientacao);

      // Verificar se existem tarefas relacionadas a esta orientação
      const { data: tarefasRelacionadas, error: tarefasError } = await supabase
        .from('moveis_tarefas')
        .select('id, titulo')
        .eq('orientacao_id', id);

      if (tarefasError) {
        console.error('Erro ao verificar tarefas relacionadas:', tarefasError);
        throw new Error('Erro ao verificar dependências');
      }

      // Se há tarefas relacionadas, remover a relação (definir orientacao_id como null)
      if (tarefasRelacionadas && tarefasRelacionadas.length > 0) {
        const { error: updateTarefasError } = await supabase
          .from('moveis_tarefas')
          .update({ orientacao_id: null })
          .eq('orientacao_id', id);

        if (updateTarefasError) {
          console.error('Erro ao remover relação das tarefas:', updateTarefasError);
          throw new Error('Erro ao remover relação das tarefas');
        }

        console.log(`Relação removida de ${tarefasRelacionadas.length} tarefa(s)`);
      }

      // Tentar excluir a orientação (as visualizações serão excluídas automaticamente por CASCADE)
      const { error: deleteError, data } = await supabase
        .from('moveis_orientacoes')
        .delete()
        .eq('id', id)
        .select();

      if (deleteError) {
        console.error('Erro detalhado na exclusão:', deleteError);
        throw deleteError;
      }

      console.log('Resultado da exclusão:', data);

      toast({
        title: "✅ Sucesso",
        description: "Orientação excluída com sucesso",
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao excluir orientação:', error);
      
      let errorMessage = "Não foi possível excluir a orientação";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.details) {
        errorMessage = error.details;
      } else if (error.hint) {
        errorMessage = error.hint;
      }
      
      toast({
        title: "❌ Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateOrientacao,
    deleteOrientacao,
    isLoading
  };
}
