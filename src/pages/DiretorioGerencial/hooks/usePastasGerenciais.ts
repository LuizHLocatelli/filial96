import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { PastaGerencial } from "../types";
import { useToast } from "@/components/ui/use-toast";

export const usePastasGerenciais = (pastaPaiId?: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pastas, isLoading, error } = useQuery({
    queryKey: ['pastas_gerenciais', pastaPaiId],
    queryFn: async () => {
      let query = supabase
        .from('gerencial_pastas')
        .select('*');

      if (pastaPaiId === null) {
        query = query.is('pasta_pai_id', null);
      } else if (pastaPaiId) {
        query = query.eq('pasta_pai_id', pastaPaiId);
      }

      const { data, error } = await query.order('nome');

      if (error) {
        console.error('Error fetching folders:', error);
        throw error;
      }
      
      return data as PastaGerencial[];
    },
    enabled: !!user,
  });

  const { data: pastaAtual } = useQuery({
    queryKey: ['pasta_gerencial', pastaPaiId],
    queryFn: async () => {
      if (!pastaPaiId) return null;
      
      const { data, error } = await supabase
        .from('gerencial_pastas')
        .select('*')
        .eq('id', pastaPaiId)
        .single();

      if (error) {
        console.error('Error fetching folder:', error);
        throw error;
      }
      
      return data as PastaGerencial;
    },
    enabled: !!pastaPaiId && !!user,
  });

  const criarPasta = useMutation({
    mutationFn: async (nome: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from('gerencial_pastas')
        .insert({
          nome: nome.trim(),
          pasta_pai_id: pastaPaiId || null,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as PastaGerencial;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pastas_gerenciais'] });
      toast({
        title: "Sucesso",
        description: "Pasta criada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar pasta",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const atualizarPasta = useMutation({
    mutationFn: async ({ id, nome, cor, icone, pasta_pai_id }: { id: string; nome?: string; cor?: string; icone?: string; pasta_pai_id?: string | null }) => {
      const updateData: Partial<PastaGerencial> = {};
      if (nome !== undefined) updateData.nome = nome.trim();
      if (cor !== undefined) updateData.cor = cor;
      if (icone !== undefined) updateData.icone = icone;
      if (pasta_pai_id !== undefined) updateData.pasta_pai_id = pasta_pai_id;

      const { data, error } = await supabase
        .from('gerencial_pastas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PastaGerencial;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pastas_gerenciais'] });
      toast({
        title: "Sucesso",
        description: "Pasta atualizada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar pasta",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const moverPasta = useMutation({
    mutationFn: async ({ id, pasta_pai_id }: { id: string; pasta_pai_id: string | null }) => {
      const { data, error } = await supabase
        .from('gerencial_pastas')
        .update({ pasta_pai_id })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PastaGerencial;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pastas_gerenciais'] });
      toast({
        title: "Sucesso",
        description: "Pasta movida com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao mover pasta",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const excluirPasta = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('gerencial_pastas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pastas_gerenciais'] });
      queryClient.invalidateQueries({ queryKey: ['arquivos_gerenciais'] });
      toast({
        title: "Sucesso",
        description: "Pasta excluída com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir pasta",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    pastas,
    pastaAtual,
    isLoading,
    error,
    criarPasta,
    atualizarPasta,
    excluirPasta,
    moverPasta
  };
};
