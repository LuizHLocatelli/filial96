import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Contagem {
  id: string;
  nome: string;
  setor: string;
  status: "em_andamento" | "finalizada";
  created_at: string;
  created_by: string;
  produtos_count?: number;
}

export function useEstoqueContagens() {
  const [contagens, setContagens] = useState<Contagem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const carregarContagens = useCallback(async () => {
    try {
      setLoading(true);

      const { data: contagensData, error: contagensError } = await supabase
        .from("moda_estoque_contagens")
        .select("*")
        .order("created_at", { ascending: false });

      if (contagensError) throw contagensError;

      const contagensComProdutos = await Promise.all(
        (contagensData || []).map(async (contagem) => {
          const { count } = await supabase
            .from("moda_estoque_produtos")
            .select("*", { count: "exact", head: true })
            .eq("contagem_id", contagem.id);

          return {
            ...contagem,
            produtos_count: count || 0,
          };
        })
      );

      const contagensFormatadas = contagensComProdutos.map((contagem) => ({
        id: contagem.id,
        nome: contagem.nome,
        setor: contagem.setor || "",
        status: contagem.status as "em_andamento" | "finalizada",
        created_at: contagem.created_at,
        created_by: contagem.created_by,
        produtos_count: contagem.produtos_count,
      }));

      setContagens(contagensFormatadas);
    } catch (error) {
      console.error("Erro ao carregar contagens:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as contagens.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    carregarContagens();
  }, [carregarContagens]);

  const criarContagem = async (nome: string, setor: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from("moda_estoque_contagens")
        .insert({
          nome,
          setor,
          created_by: user.user.id,
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contagem criada com sucesso!",
      });

      await carregarContagens();
      return true;
    } catch (error) {
      console.error("Erro ao criar contagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a contagem.",
        variant: "destructive",
      });
      return false;
    }
  };

  const excluirContagem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("moda_estoque_contagens")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contagem excluída com sucesso!",
      });

      await carregarContagens();
      return true;
    } catch (error) {
      console.error("Erro ao excluir contagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a contagem.",
        variant: "destructive",
      });
      return false;
    }
  };

  const alterarStatusContagem = async (id: string, novoStatus: "em_andamento" | "finalizada") => {
    try {
      const { error } = await supabase
        .from("moda_estoque_contagens")
        .update({ status: novoStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Contagem ${novoStatus === "finalizada" ? "finalizada" : "reaberta"} com sucesso!`,
      });

      await carregarContagens();
      return true;
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da contagem.",
        variant: "destructive",
      });
      return false;
    }
  };

  const stats = useMemo(() => {
    const emAndamentoCount = contagens.filter((c) => c.status === "em_andamento").length;
    const finalizadasCount = contagens.filter((c) => c.status === "finalizada").length;
    return { 
      total: contagens.length, 
      emAndamentoCount, 
      finalizadasCount 
    };
  }, [contagens]);

  return {
    contagens,
    loading,
    stats,
    carregarContagens,
    criarContagem,
    excluirContagem,
    alterarStatusContagem,
  };
}
