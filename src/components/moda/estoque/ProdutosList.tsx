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
      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código do produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filtroSetor} onValueChange={setFiltroSetor}>
          <SelectTrigger className="w-full sm:w-48">
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

      {/* Resumo */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? "s" : ""} • 
          Total: {totalProdutos} unidade{totalProdutos !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Tabela */}
      {produtosFiltrados.length === 0 ? (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {produtos.length === 0 ? "Nenhum produto cadastrado" : "Nenhum produto encontrado"}
          </h3>
          <p className="text-muted-foreground">
            {produtos.length === 0 
              ? "Adicione produtos para começar a contagem" 
              : "Tente ajustar os filtros de busca"
            }
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Cadastrado</TableHead>
                {contagemStatus === "em_andamento" && (
                  <TableHead className="w-12"></TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosFiltrados.map((produto) => {
                const SetorIcon = getSetorIcon(produto.setor);
                return (
                  <TableRow key={produto.id}>
                    <TableCell className="font-mono">
                      {produto.codigo_produto}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getSetorColor(produto.setor)}
                      >
                        <SetorIcon className="h-3 w-3 mr-1" />
                        {produto.setor.charAt(0).toUpperCase() + produto.setor.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{produto.quantidade}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(produto.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </TableCell>
                    {contagemStatus === "em_andamento" && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
      )}
    </div>
  );
}