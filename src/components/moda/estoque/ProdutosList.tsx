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
  Baby,
  AlertTriangle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EditarProdutoDialog } from "./EditarProdutoDialog";

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
  const [filtroValidacao, setFiltroValidacao] = useState("todos");
  const [editarProdutoOpen, setEditarProdutoOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
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

  const validarCodigo = (codigo: string) => {
    // Valida se o código tem exatamente 6 ou 9 dígitos
    return codigo.length === 6 || codigo.length === 9;
  };

  const abrirEdicaoProduto = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setEditarProdutoOpen(true);
  };

  const handleProdutoEditado = () => {
    carregarProdutos();
    onProdutoAtualizado();
    setEditarProdutoOpen(false);
    setProdutoSelecionado(null);
  };

  const produtosComInconformidade = produtos.filter(produto => !validarCodigo(produto.codigo_produto));

  const produtosFiltrados = produtos.filter(produto => {
    const matchSetor = filtroSetor === "todos" || produto.setor === filtroSetor;
    const matchBusca = busca === "" || produto.codigo_produto.includes(busca);
    const matchValidacao = filtroValidacao === "todos" || 
                          (filtroValidacao === "validos" && validarCodigo(produto.codigo_produto)) ||
                          (filtroValidacao === "invalidos" && !validarCodigo(produto.codigo_produto));
    return matchSetor && matchBusca && matchValidacao;
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

          <Select value={filtroValidacao} onValueChange={setFiltroValidacao}>
            <SelectTrigger className="w-full sm:w-[160px] h-10">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos códigos</SelectItem>
              <SelectItem value="validos">Códigos válidos</SelectItem>
              <SelectItem value="invalidos">Códigos inválidos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resumo com estatísticas melhoradas */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-border/50">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="secondary" className="font-mono text-xs sm:text-sm shrink-0">
              {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs sm:text-sm shrink-0">
              {totalProdutos} unidade{totalProdutos !== 1 ? "s" : ""}
            </Badge>
            {produtosComInconformidade.length > 0 && (
              <Badge variant="destructive" className="font-mono text-xs sm:text-sm shrink-0">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">{produtosComInconformidade.length} código{produtosComInconformidade.length !== 1 ? "s" : ""} inválido{produtosComInconformidade.length !== 1 ? "s" : ""}</span>
                <span className="sm:hidden">{produtosComInconformidade.length} inválido{produtosComInconformidade.length !== 1 ? "s" : ""}</span>
              </Badge>
            )}
          </div>
          
          {/* Estatísticas por setor */}
          {produtosFiltrados.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs">
              {["masculino", "feminino", "infantil"].map(setor => {
                const count = produtosFiltrados.filter(p => p.setor === setor).length;
                if (count === 0) return null;
                return (
                  <span key={setor} className="text-muted-foreground whitespace-nowrap">
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
        <div className="space-y-3">
          {/* Tabela para desktop - Design otimizado */}
          <div className="hidden md:block">
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-b border-border/50">
                      <TableHead className="font-semibold min-w-[120px]">Código</TableHead>
                      <TableHead className="font-semibold min-w-[100px]">Setor</TableHead>
                      <TableHead className="font-semibold text-center min-w-[60px]">Qtd</TableHead>
                      <TableHead className="font-semibold min-w-[120px]">Cadastrado</TableHead>
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
                            <div className="flex items-center gap-2">
                              {produto.codigo_produto}
                              {!validarCodigo(produto.codigo_produto) && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Inválido
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`${getSetorColor(produto.setor)} font-medium whitespace-nowrap`}
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
                          <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
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
                                  <DropdownMenuItem 
                                    onClick={() => abrirEdicaoProduto(produto)}
                                  >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
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
          </div>

          {/* Cards para mobile e tablet - Design completamente responsivo */}
          <div className="block md:hidden">
            <div className="space-y-3">
              {produtosFiltrados.map((produto) => {
                const SetorIcon = getSetorIcon(produto.setor);
                return (
                  <div key={produto.id} className="glass-card p-3 hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-mono text-base sm:text-lg font-bold tracking-wider truncate">
                              {produto.codigo_produto}
                            </span>
                            {!validarCodigo(produto.codigo_produto) && (
                              <Badge variant="destructive" className="text-xs shrink-0">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                <span className="hidden xs:inline">Inválido</span>
                                <span className="xs:hidden">!</span>
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-center">
                            <Badge variant="secondary" className="font-mono text-sm px-2 py-1">
                              {produto.quantidade}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-0.5">un.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className={`${getSetorColor(produto.setor)} font-medium text-xs shrink-0`}
                        >
                          <SetorIcon className="h-3 w-3 mr-1" />
                          {produto.setor.charAt(0).toUpperCase() + produto.setor.slice(1)}
                        </Badge>
                        
                        {contagemStatus === "em_andamento" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => abrirEdicaoProduto(produto)}
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
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
                      <p className="text-xs text-muted-foreground truncate">
                        {formatDistanceToNow(new Date(produto.created_at), {
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

      {/* Dialog de edição de produto */}
      <EditarProdutoDialog
        open={editarProdutoOpen}
        onOpenChange={setEditarProdutoOpen}
        produto={produtoSelecionado}
        onProdutoAtualizado={handleProdutoEditado}
        contagemId={contagemId}
      />
    </div>
  );
}