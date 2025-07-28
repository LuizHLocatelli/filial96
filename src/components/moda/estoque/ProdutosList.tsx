import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Package,
  User,
  Baby
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Produto {
  id: string;
  codigo_produto: string;
  setor: "masculino" | "feminino" | "infantil";
  quantidade: number;
  created_at: string;
  created_by: string;
}

interface ProdutosListProps {
  contagemId: string;
  contagemStatus: "em_andamento" | "finalizada";
  onProdutoAtualizado: () => void;
}

export function ProdutosList({ 
  contagemId, 
  contagemStatus, 
  onProdutoAtualizado 
}: ProdutosListProps) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroSetor, setFiltroSetor] = useState("todos");
  const [busca, setBusca] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    carregarProdutos();
  }, [contagemId]);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("moda_estoque_produtos")
        .select("*")
        .eq("contagem_id", contagemId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const produtosFormatados = data?.map(produto => ({
        ...produto,
        setor: produto.setor as "masculino" | "feminino" | "infantil"
      })) || [];

      setProdutos(produtosFormatados);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const excluirProduto = async (id: string) => {
    try {
      const { error } = await supabase
        .from("moda_estoque_produtos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Produto excluído",
        description: "Produto removido da contagem com sucesso."
      });

      carregarProdutos();
      onProdutoAtualizado();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto.",
        variant: "destructive"
      });
    }
  };

  const getSetorIcon = (setor: string) => {
    switch (setor) {
      case "masculino":
      case "feminino":
        return User;
      case "infantil":
        return Baby;
      default:
        return Package;
    }
  };

  const getSetorColor = (setor: string) => {
    switch (setor) {
      case "masculino":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "feminino":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "infantil":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const produtosFiltrados = produtos.filter(produto => {
    const matchSetor = filtroSetor === "todos" || produto.setor === filtroSetor;
    const matchBusca = busca === "" || produto.codigo_produto.includes(busca);
    return matchSetor && matchBusca;
  });

  const totalProdutos = produtosFiltrados.reduce((acc, produto) => acc + produto.quantidade, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros e Busca - Layout otimizado */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          
          <Select value={filtroSetor} onValueChange={setFiltroSetor}>
            <SelectTrigger className="w-full sm:w-[180px] h-10">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os setores</SelectItem>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="feminino">Feminino</SelectItem>
              <SelectItem value="infantil">Infantil</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resumo com estatísticas melhoradas */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-border/50">
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="secondary" className="font-mono">
              {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline" className="font-mono">
              {totalProdutos} unidade{totalProdutos !== 1 ? "s" : ""}
            </Badge>
          </div>
          
          {/* Estatísticas por setor */}
          {produtosFiltrados.length > 0 && (
            <div className="flex gap-2 text-xs">
              {["masculino", "feminino", "infantil"].map(setor => {
                const count = produtosFiltrados.filter(p => p.setor === setor).length;
                if (count === 0) return null;
                return (
                  <span key={setor} className="text-muted-foreground">
                    {setor.charAt(0).toUpperCase()}: {count}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lista de Produtos */}
      {produtosFiltrados.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2 text-foreground">
            {produtos.length === 0 ? "Nenhum produto cadastrado" : "Nenhum produto encontrado"}
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {produtos.length === 0 
              ? "Use a aba 'Adicionar Produto' para começar a contagem" 
              : "Tente ajustar os filtros de busca para encontrar produtos"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Tabela para desktop - Design otimizado */}
          <div className="hidden lg:block">
            <div className="glass-card overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-b border-border/50">
                    <TableHead className="font-semibold">Código</TableHead>
                    <TableHead className="font-semibold">Setor</TableHead>
                    <TableHead className="font-semibold text-center">Qtd</TableHead>
                    <TableHead className="font-semibold">Cadastrado</TableHead>
                    {contagemStatus === "em_andamento" && (
                      <TableHead className="w-12"></TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosFiltrados.map((produto, index) => {
                    const SetorIcon = getSetorIcon(produto.setor);
                    return (
                      <TableRow 
                        key={produto.id} 
                        className={`hover:bg-muted/20 transition-colors ${
                          index % 2 === 0 ? 'bg-muted/5' : ''
                        }`}
                      >
                        <TableCell className="font-mono text-lg font-medium">
                          {produto.codigo_produto}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${getSetorColor(produto.setor)} font-medium`}
                          >
                            <SetorIcon className="h-3 w-3 mr-1" />
                            {produto.setor.charAt(0).toUpperCase() + produto.setor.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-mono text-base px-3 py-1">
                            {produto.quantidade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(produto.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </TableCell>
                        {contagemStatus === "em_andamento" && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem 
                                      className="text-destructive focus:text-destructive"
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Remover
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja remover este produto da contagem? 
                                        Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => excluirProduto(produto.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Remover
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Grid para tablet e mobile - Design aprimorado */}
          <div className="block lg:hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {produtosFiltrados.map((produto) => {
                const SetorIcon = getSetorIcon(produto.setor);
                return (
                  <div key={produto.id} className="glass-card p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-bold tracking-wider">
                            {produto.codigo_produto}
                          </span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${getSetorColor(produto.setor)} font-medium`}
                        >
                          <SetorIcon className="h-3 w-3 mr-1" />
                          {produto.setor.charAt(0).toUpperCase() + produto.setor.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <Badge variant="secondary" className="font-mono text-lg px-3 py-1.5">
                            {produto.quantidade}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">unidades</p>
                        </div>
                        
                        {contagemStatus === "em_andamento" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remover
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja remover este produto da contagem? 
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => excluirProduto(produto.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Remover
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-border/30">
                      <p className="text-xs text-muted-foreground">
                        Cadastrado {formatDistanceToNow(new Date(produto.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}