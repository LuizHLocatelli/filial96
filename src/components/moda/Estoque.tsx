import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import { EstoqueContagemCard } from "./estoque/EstoqueContagemCard";
import { NovaContagemDialog } from "./estoque/NovaContagemDialog";
import { DetalheContagemDialog } from "./estoque/DetalheContagemDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Contagem {
  id: string;
  nome: string;
  status: "em_andamento" | "finalizada";
  created_at: string;
  created_by: string;
  produtos_count?: number;
}

export function Estoque() {
  const [contagens, setContagens] = useState<Contagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [novaContagemOpen, setNovaContagemOpen] = useState(false);
  const [detalheContagemOpen, setDetalheContagemOpen] = useState(false);
  const [contagemSelecionada, setContagemSelecionada] = useState<Contagem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    carregarContagens();
  }, []);

  const carregarContagens = async () => {
    try {
      setLoading(true);

      // Buscar contagens
      const { data: contagensData, error: contagensError } = await supabase
        .from("moda_estoque_contagens")
        .select("*")
        .order("created_at", { ascending: false });

      if (contagensError) throw contagensError;

      // Buscar contagem de produtos para cada contagem
      const contagensComProdutos = await Promise.all(
        (contagensData || []).map(async (contagem) => {
          const { count } = await supabase
            .from("moda_estoque_produtos")
            .select("*", { count: "exact", head: true })
            .eq("contagem_id", contagem.id);

          return {
            ...contagem,
            produtos_count: count || 0
          };
        })
      );

      // Formatar dados para incluir contagem de produtos
      const contagensFormatadas = contagensComProdutos.map(contagem => ({
        id: contagem.id,
        nome: contagem.nome,
        status: contagem.status as "em_andamento" | "finalizada",
        created_at: contagem.created_at,
        created_by: contagem.created_by,
        produtos_count: contagem.produtos_count
      }));

      setContagens(contagensFormatadas);
    } catch (error) {
      console.error("Erro ao carregar contagens:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as contagens.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const criarContagem = async (nome: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from("moda_estoque_contagens")
        .insert({
          nome,
          created_by: user.user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contagem criada com sucesso!"
      });

      setNovaContagemOpen(false);
      carregarContagens();
    } catch (error) {
      console.error("Erro ao criar contagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a contagem.",
        variant: "destructive"
      });
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
        description: "Contagem excluída com sucesso!"
      });

      carregarContagens();
    } catch (error) {
      console.error("Erro ao excluir contagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a contagem.",
        variant: "destructive"
      });
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
        description: `Contagem ${novoStatus === "finalizada" ? "finalizada" : "reaberta"} com sucesso!`
      });

      carregarContagens();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da contagem.",
        variant: "destructive"
      });
    }
  };

  const abrirDetalhe = (contagem: Contagem) => {
    setContagemSelecionada(contagem);
    setDetalheContagemOpen(true);
  };

  const handleContagemAtualizada = async () => {
    await carregarContagens();
    
    // Atualizar também a contagem selecionada se ela existir
    if (contagemSelecionada) {
      try {
        const { data: contagemAtualizada, error } = await supabase
          .from("moda_estoque_contagens")
          .select("*")
          .eq("id", contagemSelecionada.id)
          .single();

        if (!error && contagemAtualizada) {
          // Buscar contagem de produtos
          const { count } = await supabase
            .from("moda_estoque_produtos")
            .select("*", { count: "exact", head: true })
            .eq("contagem_id", contagemAtualizada.id);

          setContagemSelecionada({
            ...contagemAtualizada,
            produtos_count: count || 0
          });
        }
      } catch (error) {
        console.error("Erro ao atualizar contagem selecionada:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Controle de Estoque</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie contagens de produtos armazenados
            </p>
          </div>
        </div>
        <Button onClick={() => setNovaContagemOpen(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Nova Contagem
        </Button>
      </div>

      {/* Lista de Contagens */}
      {contagens.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma contagem criada</h3>
          <p className="text-muted-foreground mb-4">
            Crie sua primeira contagem de estoque para começar
          </p>
          <Button onClick={() => setNovaContagemOpen(true)} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Criar Primeira Contagem
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contagens.map((contagem) => (
            <EstoqueContagemCard
              key={contagem.id}
              contagem={contagem}
              onExcluir={excluirContagem}
              onAlterarStatus={alterarStatusContagem}
              onAbrir={abrirDetalhe}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <NovaContagemDialog
        open={novaContagemOpen}
        onOpenChange={setNovaContagemOpen}
        onCriar={criarContagem}
      />

      {contagemSelecionada && (
        <DetalheContagemDialog
          open={detalheContagemOpen}
          onOpenChange={setDetalheContagemOpen}
          contagem={contagemSelecionada}
          onContagemAtualizada={handleContagemAtualizada}
        />
      )}
    </div>
  );
}