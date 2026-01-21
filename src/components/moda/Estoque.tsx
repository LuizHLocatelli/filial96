import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Package, RefreshCcw, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EstoqueContagemCard } from "./estoque/EstoqueContagemCard";
import { NovaContagemDialog } from "./estoque/NovaContagemDialog";
import { DetalheContagemDialog } from "./estoque/DetalheContagemDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Contagem {
  id: string;
  nome: string;
  setor: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "em_andamento" | "finalizada">("todos");
  const { toast } = useToast();

  useEffect(() => {
    // SEO basics for this section
    document.title = "Estoque de Moda – Contagens | Hub";
    const metaDesc = document.querySelector('meta[name="description"]');
    const content = "Gerencie contagens de estoque de Moda: criar, visualizar e finalizar contagens.";
    if (metaDesc) metaDesc.setAttribute("content", content);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = content;
      document.head.appendChild(m);
    }
  }, []);

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
            produtos_count: count || 0,
          };
        })
      );

      // Formatar dados para incluir contagem de produtos
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
  };

  const criarContagem = async (nome: string, setor: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("moda_estoque_contagens")
        .insert({
          nome,
          setor,
          created_by: user.user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contagem criada com sucesso!",
      });

      setNovaContagemOpen(false);
      carregarContagens();
    } catch (error) {
      console.error("Erro ao criar contagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a contagem.",
        variant: "destructive",
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
        description: "Contagem excluída com sucesso!",
      });

      carregarContagens();
    } catch (error) {
      console.error("Erro ao excluir contagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a contagem.",
        variant: "destructive",
      });
    }
  };

  const alterarStatusContagem = async (id: string, novoStatus: "em_andamento" | "finalizada") => {
    try {
      const { error } = await supabase
        .from("moda_estoque_contagens")
        .update({ status: novoStatus } as any)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Contagem ${novoStatus === "finalizada" ? "finalizada" : "reaberta"} com sucesso!`,
      });

      carregarContagens();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da contagem.",
        variant: "destructive",
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
            produtos_count: count || 0,
            status: contagemAtualizada.status as "em_andamento" | "finalizada",
            setor: contagemAtualizada.setor || "",
          });
        }
      } catch (error) {
        console.error("Erro ao atualizar contagem selecionada:", error);
      }
    }
  };

  const { total, emAndamentoCount, finalizadasCount } = useMemo(() => {
    const emAndamento = contagens.filter((c) => c.status === "em_andamento").length;
    const finalizadas = contagens.filter((c) => c.status === "finalizada").length;
    return { total: contagens.length, emAndamentoCount: emAndamento, finalizadasCount: finalizadas };
  }, [contagens]);

  const contagensFiltradas = useMemo(() => {
    const byStatus = statusFilter === "todos" ? contagens : contagens.filter((c) => c.status === statusFilter);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byStatus;
    return byStatus.filter((c) => c.nome.toLowerCase().includes(q));
  }, [contagens, statusFilter, searchQuery]);

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
            <p className="text-sm text-muted-foreground">Gerencie contagens de produtos armazenados</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={carregarContagens}>
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={() => setNovaContagemOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Contagem
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar contagem pelo nome"
              className="pl-9"
              aria-label="Buscar contagem"
            />
          </div>
        </div>
        <div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="finalizada">Finalizadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded-lg p-3 animate-fade-in">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 animate-fade-in">
          <div className="text-xs text-muted-foreground">Em andamento</div>
          <div className="text-2xl font-bold text-primary">{emAndamentoCount}</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 animate-fade-in">
          <div className="text-xs text-muted-foreground">Finalizadas</div>
          <div className="text-2xl font-bold">{finalizadasCount}</div>
        </div>
      </div>

      {/* Lista de Contagens */}
      {contagensFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma contagem encontrada</h3>
          <p className="text-muted-foreground mb-4">Ajuste os filtros ou crie uma nova contagem.</p>
          <Button onClick={() => setNovaContagemOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Contagem
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contagensFiltradas.map((contagem) => (
            <div key={contagem.id} className="animate-fade-in">
              <EstoqueContagemCard
                contagem={contagem}
                onExcluir={excluirContagem}
                onAlterarStatus={alterarStatusContagem}
                onAbrir={abrirDetalhe}
              />
            </div>
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
