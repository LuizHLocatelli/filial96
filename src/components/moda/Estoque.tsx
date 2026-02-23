import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Package, RefreshCcw, Search, BarChart3, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EstoqueContagemCard } from "./estoque/EstoqueContagemCard";
import { NovaContagemDialog } from "./estoque/NovaContagemDialog";
import { DetalheContagemDialog } from "./estoque/DetalheContagemDialog";
import { useEstoqueContagens, Contagem } from "./estoque/hooks/useEstoqueContagens";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export function Estoque() {
  const {
    contagens,
    loading,
    stats,
    carregarContagens,
    criarContagem,
    excluirContagem,
    alterarStatusContagem,
  } = useEstoqueContagens();

  const [novaContagemOpen, setNovaContagemOpen] = useState(false);
  const [detalheContagemOpen, setDetalheContagemOpen] = useState(false);
  const [contagemSelecionada, setContagemSelecionada] = useState<Contagem | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "em_andamento" | "finalizada">("todos");

  useEffect(() => {
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

  const handleCriarContagem = async (nome: string, setor: string) => {
    const success = await criarContagem(nome, setor);
    if (success) {
      setNovaContagemOpen(false);
    }
  };

  const abrirDetalhe = useCallback((contagem: Contagem) => {
    setContagemSelecionada(contagem);
    setDetalheContagemOpen(true);
  }, []);

  const handleContagemAtualizada = async () => {
    await carregarContagens();

    if (contagemSelecionada) {
      try {
        const { data: contagemAtualizada, error } = await supabase
          .from("moda_estoque_contagens")
          .select("*")
          .eq("id", contagemSelecionada.id)
          .single();

        if (!error && contagemAtualizada) {
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

  const contagensFiltradas = useMemo(() => {
    let result = contagens;
    
    if (statusFilter !== "todos") {
      result = result.filter((c) => c.status === statusFilter);
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((c) => c.nome.toLowerCase().includes(q));
    }
    
    return result;
  }, [contagens, statusFilter, searchQuery]);

  if (loading && contagens.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary/20 border-l-primary"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Carregando estoque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/50 backdrop-blur-md border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-lg border border-primary/20">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Controle de Estoque</h1>
            <p className="text-muted-foreground text-sm">
              Gerencie contagens de produtos e auditoria
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="gap-1.5 bg-background/50 backdrop-blur shadow-sm hover:bg-muted" 
            onClick={carregarContagens}
          >
            <RefreshCcw className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
          <Button 
            size="sm"
            onClick={() => setNovaContagemOpen(true)} 
            className="gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Nova Contagem
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 flex items-center gap-4 border-l-4 border-l-border">
          <div className="bg-muted p-3 rounded-lg">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Total de Contagens</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
        </div>
        
        <div className="glass-card rounded-xl p-5 flex items-center gap-4 border-l-4 border-l-amber-500 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
          <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
            <RefreshCcw className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-amber-700/80 dark:text-amber-400/80">Em Andamento</div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-500">{stats.emAndamentoCount}</div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 flex items-center gap-4 border-l-4 border-l-emerald-500 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
          <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
            <Package className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-emerald-700/80 dark:text-emerald-400/80">Finalizadas</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-500">{stats.finalizadasCount}</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Toolbar de Pesquisa e Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card/30 p-2 rounded-xl border border-border/50">
          <Tabs 
            value={statusFilter} 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onValueChange={(v) => setStatusFilter(v as any)}
            className="w-full sm:w-auto"
          >
            <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex bg-background/50">
              <TabsTrigger value="todos" className="gap-2">
                Todos
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] bg-background/50">{stats.total}</Badge>
              </TabsTrigger>
              <TabsTrigger value="em_andamento" className="gap-2 data-[state=active]:text-amber-600 data-[state=active]:bg-amber-100/50 dark:data-[state=active]:bg-amber-500/10">
                Abertos
              </TabsTrigger>
              <TabsTrigger value="finalizada" className="gap-2 data-[state=active]:text-emerald-600 data-[state=active]:bg-emerald-100/50 dark:data-[state=active]:bg-emerald-500/10">
                Fechados
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:max-w-xs group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pelo nome..."
              className="pl-9 bg-background/50 border-border/50 focus-visible:ring-1 transition-all h-10"
              aria-label="Buscar contagem"
            />
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-full"
                onClick={() => setSearchQuery("")}
              >
                <Filter className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Listagem */}
        {contagensFiltradas.length === 0 ? (
          <div className="text-center py-16 px-4 border border-dashed rounded-xl bg-card/20 backdrop-blur-sm">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma contagem encontrada</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {searchQuery 
                ? "Não encontramos resultados para a sua busca. Tente mudar os filtros." 
                : "Você ainda não possui contagens de estoque. Comece criando uma agora mesmo."}
            </p>
            {!searchQuery && (
              <Button onClick={() => setNovaContagemOpen(true)} className="gap-2 shadow-md">
                <Plus className="h-4 w-4" />
                Criar Minha Primeira Contagem
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {contagensFiltradas.map((contagem) => (
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
      </div>

      <NovaContagemDialog
        open={novaContagemOpen}
        onOpenChange={setNovaContagemOpen}
        onCriar={handleCriarContagem}
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
